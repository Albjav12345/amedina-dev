import Groq from 'groq-sdk';
import portfolioData from './portfolio.js';
import { getGitHubActivity } from './lib/github.js';
import {
    applySecurityHeaders,
    clampText,
    extractJsonObject,
    getAllowedExternalUrls,
    getSafeExternalUrl,
    isAllowedOrigin,
    sanitizeHistory,
} from './lib/security.js';
import {
    attachRunTrace,
    completeStep,
    createRun,
    failRun,
    finishRun,
    recordServiceProbe,
} from './lib/control-plane.js';

// Configuration: Model Rotation Fallback List (Latest Verified Groq Production Models)
const MODELS = [
    'llama-3.3-70b-versatile', // Tier 1: Best Quality (300K TPM)
    'llama-3.1-8b-instant'     // Tier 2: High Reliability (250K TPM)
];

const isArchitectSectionEnabled = portfolioData.ui?.navigation?.links
    ?.some(link => link.id === 'architect');

const AVAILABLE_ACTIONS = [
    'SCROLL_TO_PROJECTS',
    'SCROLL_TO_CONTACT',
    'SCROLL_TO_ABOUT',
    'SCROLL_TO_STACK',
    ...(isArchitectSectionEnabled ? ['SCROLL_TO_ARCHITECT'] : []),
    'OPEN_CONTROL_PANEL',
    'OPEN_CV',
    'OPEN_LINK',
];

// Helper to sleep between retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
    const requestStartedAt = Date.now();
    let runId = null;
    let debugTrace = null;

    applySecurityHeaders(res);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!isAllowedOrigin(req.headers.origin)) {
        return res.status(403).json({
            type: "MESSAGE",
            text: ">> SYSTEM_ALERT: ORIGIN_REJECTED.",
            action: null
        });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            type: "MESSAGE",
            text: ">> SYSTEM_ALERT: NEURAL_LINK_OFFLINE. GROQ_API_KEY NOT FOUND.",
            action: null
        });
    }

    const groq = new Groq({ apiKey });
    const allowedExternalUrls = getAllowedExternalUrls(portfolioData);

    try {
        const message = clampText(req.body?.message, { min: 1, max: 500, fallback: '' });
        const history = sanitizeHistory(req.body?.history);
        runId = createRun({
            channel: 'terminal',
            title: 'Terminal Agent Run',
            input: message,
            tools: ['Groq LLM', 'Portfolio Context', 'GitHub API'],
        });

        if (!message) {
            failRun(runId, {
                message: 'Input validation rejected an empty or invalid terminal command.',
                decision: 'Rejected before orchestration',
            });
            return res.status(400).json({
                type: "MESSAGE",
                text: ">> SYSTEM_ALERT: INVALID_QUERY_PAYLOAD.",
                action: null
            });
        }

        completeStep(runId, 'ingress', 'Terminal request accepted by the edge function.');
        completeStep(runId, 'validation', 'Input text and recent history were sanitized safely.');

        // 1. Fetch Live Data (GitHub) with error handling
        let githubData = null;
        let githubStatus = "ONLINE";
        const githubProbeStartedAt = Date.now();
        try {
            githubData = await getGitHubActivity('Albjav12345');
            if (!githubData) {
                githubStatus = "OFFLINE: API_DATA_NULL";
                console.warn("[SYS] GitHub fetch returned null.");
            }
        } catch (e) {
            githubStatus = "OFFLINE: SYNC_ERROR";
            console.error("[SYS] GitHub Sync Error:", e.message);
        }
        recordServiceProbe('github-sync', {
            status: githubData ? 'operational' : 'degraded',
            latencyMs: Date.now() - githubProbeStartedAt,
            note: githubData
                ? 'Live GitHub activity synced successfully for terminal context.'
                : 'GitHub context degraded. Terminal continues with portfolio-only context.',
        });
        completeStep(
            runId,
            'context',
            githubData
                ? 'Portfolio data and live GitHub activity were attached to the reasoning context.'
                : 'Portfolio data attached. GitHub sync degraded, so the agent continued without live activity.',
        );

        // 2. Ground the guide in portfolio evidence and safe, optional navigation.
        const architectGuidance = isArchitectSectionEnabled
            ? '- Architecture or scoping requests may use SCROLL_TO_ARCHITECT when opening that section genuinely helps.'
            : '- The Project Architect section is disabled. Answer architecture questions directly, then use SCROLL_TO_PROJECTS or SCROLL_TO_CONTACT only when useful.';
        const SYSTEM_PROMPT = `
ROLE:
You are the interactive portfolio guide for Alberto Medina. Help recruiters, engineering leads, and potential collaborators understand what Alberto has actually built, how he works, and where his evidence matches their needs.

VOICE:
- Clear, technically literate, calm, and concise. Never use sales hype, status language, or pressure.
- Mirror the user's language (Spanish or English).
- Prefer useful specifics over generic praise.
- Use plain text that reads well in a terminal. No Markdown tables.

SOURCE_OF_TRUTH / PORTFOLIO:
${JSON.stringify(portfolioData)}

LIVE_GITHUB_CONTEXT:
GITHUB_STATUS: ${githubStatus}
LIVE_GITHUB_DATA: ${githubData ? JSON.stringify(githubData) : "null"}

GROUNDING_RULES:
- Use only the portfolio and live GitHub context above. Never invent employers, dates, qualifications, client names, metrics, availability, production scale, or project outcomes.
- Name the project, stack item, statistic, or live GitHub fact that supports important claims.
- If evidence is missing, say "I can't verify that from the portfolio" and state what would need confirmation.
- The "25+ Projects Delivered" statistic is a broad overall portfolio total. Never rephrase it as 25+ paid, commercial, or client projects.
- The site showcases ${portfolioData.meta.showcasedProjectsCount} selected systems. Do not imply that these are the entire body of work.
- If GitHub status is offline, say live activity could not be checked; do not present cached-looking details as current.

RECRUITER_FIT_MODE:
Trigger this when the user provides a role, job description, requirements, or asks whether Alberto is a fit.
- Structure the text as: MATCH, EVIDENCE, GAPS, NEXT STEP.
- Rate fit as STRONG, MODERATE, or LIMITED and explain why in one sentence.
- Under EVIDENCE, connect requirements to named projects or explicit skills.
- Under GAPS, distinguish missing evidence from a confirmed lack of experience. Never hide a gap.
- Suggest /cv, projects, or contact as the next step. Use one UI action only if it helps.

PROJECT_ANALYSIS_MODE:
- For a deep-dive, explain the problem, implemented solution, stack, and one meaningful engineering decision using the project data.
- For a comparison, contrast the systems by problem, architecture, trade-offs, and what each one proves.
- If asked for the "best" project, first state the criterion: full-stack product, AI workflow, real-time UX, automation, or interactive systems.

ACTION_PROTOCOL:
- Navigation is optional, never forced. Answer the question before moving the page.
- Use at most one action.
- Projects/work/deep-dive -> SCROLL_TO_PROJECTS when opening evidence helps.
- Contact/email/hiring -> SCROLL_TO_CONTACT.
- Stack/skills/tools -> SCROLL_TO_STACK.
- Background/about -> SCROLL_TO_ABOUT.
- CV/resume/curriculum -> OPEN_CV.
- Runtime/observability/telemetry/logs -> OPEN_CONTROL_PANEL.
- Public GitHub or a specific repository -> OPEN_LINK with an exact URL already present in the source of truth.
${architectGuidance}

OUTPUT_CONTRACT:
Return one strictly valid JSON object and nothing else:
{
  "type": "MESSAGE" or "ACTION",
  "text": "Concise grounded response, maximum 650 characters",
  "action": one of ${JSON.stringify(AVAILABLE_ACTIONS)} or null,
  "url": "exact allowed URL" only when action is OPEN_LINK; otherwise null
}
`;

        // 3. Model Rotation logic (Handle Rate Limits)
        let response = null;
        let lastError = null;

        // Construct conversation context (last 2 turns + current)
        const contextMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: message }
        ];
        debugTrace = {
            channel: 'terminal',
            provider: 'Groq',
            model: null,
            userInput: message,
            availableActions: AVAILABLE_ACTIONS,
            requestMessages: contextMessages,
            rawModelResponse: null,
            parsedResponse: null,
            requestPayload: {
                message,
                history,
                githubStatus,
            },
        };

        for (let i = 0; i < MODELS.length; i++) {
            const modelId = MODELS[i];
            try {
                console.log(`[SYS] Attempting inference with model: ${modelId}`);
                const completion = await groq.chat.completions.create({
                    messages: contextMessages,
                    model: modelId,
                    temperature: 0.2,
                    max_completion_tokens: 700,
                    response_format: { type: 'json_object' }
                });

                debugTrace.model = modelId;
                debugTrace.rawModelResponse = completion.choices?.[0]?.message?.content || '';
                response = extractJsonObject(debugTrace.rawModelResponse);
                debugTrace.parsedResponse = response;
                console.log(`[SYS] Success using model: ${modelId}`);
                completeStep(runId, 'inference', `Inference completed successfully using ${modelId}.`);
                recordServiceProbe('groq-provider', {
                    status: 'operational',
                    note: `Inference completed successfully with ${modelId}.`,
                });
                break;
            } catch (error) {
                lastError = error;
                const isRateLimit = error.status === 429 || String(error).includes('429') || String(error).includes('rate_limit');

                if (isRateLimit && i < MODELS.length - 1) {
                    console.warn(`[SYS] Rate limit hit for ${modelId}. Rotating...`);
                    await sleep(200);
                    continue;
                }
                recordServiceProbe('groq-provider', {
                    status: 'degraded',
                    note: `Inference failed on ${modelId}: ${error.message || 'provider failure'}.`,
                });
                throw error;
            }
        }

        if (!response) throw lastError;

        const requestedAction = typeof response.action === 'string' ? response.action : null;
        const safeUrl = requestedAction === 'OPEN_LINK'
            ? getSafeExternalUrl(response.url, allowedExternalUrls)
            : null;
        const normalizedAction = requestedAction === 'OPEN_LINK'
            ? (safeUrl ? 'OPEN_LINK' : null)
            : AVAILABLE_ACTIONS.filter(action => action !== 'OPEN_LINK').includes(requestedAction)
                ? requestedAction
                : null;

        completeStep(runId, 'action', normalizedAction
            ? `UI action ${normalizedAction} resolved and sanitized before returning to the client.`
            : 'The response was normalized as a text-only terminal reply.'
        );
        attachRunTrace(runId, debugTrace);
        finishRun(runId, {
            output: response?.text,
            decision: normalizedAction || 'Message response only',
            approval: normalizedAction === 'OPEN_LINK' || normalizedAction === 'OPEN_CV'
                ? 'Approved user-requested handoff'
                : 'Autonomous UI-safe response',
        });
        recordServiceProbe('chat-api', {
            status: 'operational',
            latencyMs: Date.now() - requestStartedAt,
            note: 'Terminal agent request completed successfully.',
        });
        return res.status(200).json({
            type: normalizedAction ? 'ACTION' : 'MESSAGE',
            text: clampText(response?.text, { min: 1, max: 800, fallback: '>> SYSTEM_ALERT: EMPTY_MODEL_RESPONSE.' }),
            action: normalizedAction,
            url: safeUrl,
            debugTrace,
        });

    } catch (error) {
        console.error('Final Chat API Failure:', error);
        recordServiceProbe('chat-api', {
            status: 'degraded',
            latencyMs: Date.now() - requestStartedAt,
            note: `Terminal agent failed: ${error.message || 'internal failure'}.`,
        });
        if (runId) {
            attachRunTrace(runId, debugTrace);
            failRun(runId, {
                message: error.message || 'Terminal agent failed before a valid response was returned.',
                decision: 'Runtime failure',
            });
        }
        return res.status(error.status || 500).json({
            type: "MESSAGE",
            text: `>> SYSTEM_CRASH: ${error.status || 'ERROR'} - ${error.message || 'INTERNAL_FAILURE'}`,
            action: null,
            debugTrace,
        });
    }
}
