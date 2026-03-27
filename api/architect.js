import Groq from 'groq-sdk';
import portfolioData from './portfolio.js';
import {
    applySecurityHeaders,
    clampText,
    extractJsonObject,
    isAllowedOrigin,
    sanitizeEnum,
    sanitizeMultilineText,
} from './lib/security.js';
import {
    attachRunTrace,
    completeStep,
    createRun,
    failRun,
    finishRun,
    recordServiceProbe,
} from './lib/control-plane.js';

const MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant'
];

const CUSTOM_OPTION = '__custom__';
const PROJECT_TYPES = ['web-platform', 'ai-agent', 'automation-system', 'internal-tool', 'creative-interface'];
const USER_SCOPES = ['solo-team', 'department', 'public-users', 'clients', 'mixed'];
const TIMELINES = ['asap', 'month', 'quarter', 'flexible'];
const COMPLEXITIES = ['focused-mvp', 'production-build', 'multi-system'];
const ARCHITECT_ACTIONS = ['GENERATE_STRUCTURED_BRIEF', 'VALIDATE_SCHEMA', 'RETURN_SAFE_JSON'];

const PROJECT_TYPE_META = {
    'web-platform': { label: 'Web Platform', description: 'Client apps, SaaS, portals, and productized services.' },
    'ai-agent': { label: 'AI Agent', description: 'LLM systems with tools, retrieval, approvals, or supervised execution loops.' },
    'automation-system': { label: 'Automation System', description: 'Pipelines, sync engines, repetitive workflow automation, and orchestration.' },
    'internal-tool': { label: 'Internal Tool', description: 'Ops panels, admin systems, back-office workflows, and internal enablement.' },
    'creative-interface': { label: 'Creative Interface', description: 'Visually distinctive launches, interactive showcases, and high-impact web experiences.' },
};

const USER_SCOPE_META = {
    'solo-team': { label: 'Solo Team', description: 'A founder, freelancer, or tiny operator with limited process overhead.' },
    department: { label: 'Department', description: 'A defined internal unit with shared workflows and coordination needs.' },
    'public-users': { label: 'Public Users', description: 'External end users where onboarding, clarity, and UX quality matter most.' },
    clients: { label: 'Client Portal', description: 'External clients who need approvals, status visibility, or structured collaboration.' },
    mixed: { label: 'Mixed Audience', description: 'A system serving both internal operators and external users or clients.' },
};

const TIMELINE_META = {
    asap: { label: 'ASAP', description: 'Urgent delivery pressure; scope should stay extremely tight.' },
    month: { label: 'Within 30 Days', description: 'A focused first release with disciplined scope and limited surface area.' },
    quarter: { label: 'This Quarter', description: 'Enough room for stronger architecture, polish, and some iteration.' },
    flexible: { label: 'Flexible', description: 'Quality and strategic fit matter more than an aggressive launch date.' },
};

const COMPLEXITY_META = {
    'focused-mvp': { label: 'Focused MVP', description: 'A narrow first release around one critical workflow.' },
    'production-build': { label: 'Production Build', description: 'A polished launch-ready system with stronger operational readiness.' },
    'multi-system': { label: 'Multi-System Rollout', description: 'A broader platform with multiple domains, dependencies, or workflows.' },
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildSystemPrompt() {
    return `
### ROLE
You are Alberto Medina's AI Project Architect.
You write like a senior full-stack systems engineer producing a sharp pre-sales brief for a real prospective client.

### OBJECTIVE
Transform the intake into a professional architecture brief that Alberto could confidently send after a discovery call.

### INSTRUCTIONS
1. Be concrete, commercially relevant, and architecturally credible.
2. Mirror the user's language if it is obvious; otherwise use English.
3. Focus on product shape, delivery strategy, implementation realism, technical tradeoffs, and measurable value.
4. Prefer the smallest valuable phase-one release that still feels premium.
5. Recommend simple, stable technology unless the brief clearly requires extra complexity.
6. Treat security, permissions, auditability, data modeling, and operational visibility as first-class concerns when relevant.
7. Mention AI only when it materially improves the system. Do not force AI into the solution.
8. Avoid vague filler such as "scalable", "robust", "seamless", or "modern" unless you immediately make it concrete.
9. Do not invent budgets, team size claims, proprietary systems, or guarantees.
10. Output valid JSON only.

### QUALITY BAR
- The summary must be exactly 2 sentences and read like a confident technical proposal, not marketing copy.
- The recommended stack must contain 4 to 6 concrete technologies or patterns. Never output vague items like "SQL / NoSQL".
- Architecture must describe real layers or subsystems, not just feature names.
- Delivery phases must be realistic for a strong solo engineer or small delivery team.
- Risks must name actual delivery or product risks: permissions, data model, integrations, adoption, QA, compliance, or scope creep.
- The next step must be technical and credible, not generic sales language like "schedule a call".
- AI opportunities must never be an empty array.
- If AI is not recommended for phase one, return 1 or 2 items explaining that core operations should come first and where AI could be added later.

### DECISION PROCESS
1. Identify the primary workflow that creates the most value in phase one.
2. Infer what absolutely must exist at launch versus what can wait.
3. Choose an architecture that supports the current scope without blocking later expansion.
4. Prefer one clear data model and one credible backend path.
5. Surface ambiguity explicitly in risks or next step instead of hallucinating certainty.

### MINI EXAMPLE OF GOOD OUTPUT QUALITY
{
  "headline": "Client Operations Portal Brief",
  "summary": "The first release should focus on request intake, status visibility, approvals, and internal handling in one controlled workflow. A relational backend with explicit permissions and audit history is the safest path because it supports premium UX now and future billing or reporting later.",
  "solutionFit": "High",
  "recommendedStack": ["React", "Node.js", "PostgreSQL", "Role-Based Access Control", "Vercel"],
  "architecture": [
    { "title": "Client Experience Layer", "detail": "A polished responsive portal for request submission, status tracking, and approvals." }
  ],
  "deliveryPlan": [
    { "phase": "Scope Lock", "detail": "Define workflows, roles, statuses, and approval states before implementation starts.", "duration": "1 week" }
  ],
  "quickWins": ["Lock the approval states early so the data model stays coherent."],
  "risks": ["Permissions can become messy if client and internal roles are not modeled explicitly from day one."],
  "aiOpportunities": ["No strong AI layer is needed for phase one; core operations, permissions, and auditability matter more at launch."],
  "nextStep": "Turn the core workflow into a scoped delivery plan with exact roles, statuses, integrations, and screen-level requirements."
}

Reference portfolio context:
${JSON.stringify({
        profile: portfolioData.profile,
        skills: portfolioData.skills,
        showcasedProjectsCount: portfolioData.meta.showcasedProjectsCount,
        showcasedProjectTitles: portfolioData.meta.showcasedProjectTitles,
    })}

Required JSON schema:
{
  "headline": "Short title",
  "summary": "2-3 sentence proposal summary",
  "solutionFit": "High" | "Strong" | "Selective",
  "recommendedStack": ["item"],
  "architecture": [
    { "title": "Layer title", "detail": "What it does and why" }
  ],
  "deliveryPlan": [
    { "phase": "Phase name", "detail": "What happens", "duration": "Short duration label" }
  ],
  "quickWins": ["item"],
  "risks": ["item"],
  "aiOpportunities": ["item"],
  "nextStep": "One clear next action"
}
`;
}

function resolveDimension(value, customValue, allowedValues, metadata, fallback) {
    const normalized = sanitizeEnum(value, [...allowedValues, CUSTOM_OPTION], fallback);

    if (normalized === CUSTOM_OPTION) {
        const customLabel = clampText(customValue, { min: 2, max: 72, fallback: '' });
        if (customLabel) {
            return {
                key: CUSTOM_OPTION,
                label: customLabel,
                description: 'Custom user-defined input. Infer the closest credible product or delivery interpretation.',
                isCustom: true,
            };
        }
    }

    return {
        key: normalized === CUSTOM_OPTION ? fallback : normalized,
        ...metadata[normalized === CUSTOM_OPTION ? fallback : normalized],
        isCustom: false,
    };
}

function normalizeStack(stackItems, projectTypeKey) {
    const vaguePattern = /^(sql\s*\/\s*nosql|sql or nosql|database|backend|frontend|cloud|api layer|auth)$/i;
    const cleaned = (Array.isArray(stackItems) ? stackItems : [])
        .map(item => clampText(item, { min: 1, max: 40, fallback: '' }))
        .filter(Boolean)
        .filter(item => !vaguePattern.test(item));

    return cleaned.slice(0, 6);
}

function normalizeArchitectResponse(response, { projectTypeKey }) {
    const aiOpportunities = Array.isArray(response?.aiOpportunities)
        ? response.aiOpportunities.map(item => sanitizeMultilineText(item, { min: 5, max: 120, fallback: '' })).filter(Boolean).slice(0, 4)
        : [];

    const normalized = {
        headline: clampText(response?.headline, { min: 8, max: 80, fallback: '' }),
        summary: sanitizeMultilineText(response?.summary, { min: 40, max: 420, fallback: '' }),
        solutionFit: sanitizeEnum(response?.solutionFit, ['High', 'Strong', 'Selective'], ''),
        recommendedStack: normalizeStack(response?.recommendedStack, projectTypeKey),
        architecture: Array.isArray(response?.architecture)
            ? response.architecture.map(item => ({
                title: clampText(item?.title, { min: 2, max: 40, fallback: '' }),
                detail: sanitizeMultilineText(item?.detail, { min: 15, max: 160, fallback: '' }),
            })).filter(item => item.title && item.detail).slice(0, 4)
            : [],
        deliveryPlan: Array.isArray(response?.deliveryPlan)
            ? response.deliveryPlan.map(item => ({
                phase: clampText(item?.phase, { min: 2, max: 36, fallback: '' }),
                detail: sanitizeMultilineText(item?.detail, { min: 15, max: 150, fallback: '' }),
                duration: clampText(item?.duration, { min: 2, max: 24, fallback: '' }),
            })).filter(item => item.phase && item.detail && item.duration).slice(0, 4)
            : [],
        quickWins: Array.isArray(response?.quickWins)
            ? response.quickWins.map(item => sanitizeMultilineText(item, { min: 5, max: 120, fallback: '' })).filter(Boolean).slice(0, 4)
            : [],
        risks: Array.isArray(response?.risks)
            ? response.risks.map(item => sanitizeMultilineText(item, { min: 5, max: 120, fallback: '' })).filter(Boolean).slice(0, 4)
            : [],
        aiOpportunities,
        nextStep: sanitizeMultilineText(response?.nextStep, { min: 10, max: 160, fallback: '' }),
    };

    const missingFields = [];

    if (!normalized.headline) missingFields.push('headline');
    if (!normalized.summary) missingFields.push('summary');
    if (!normalized.solutionFit) missingFields.push('solutionFit');
    if (normalized.recommendedStack.length < 4) missingFields.push('recommendedStack');
    if (!normalized.architecture.length) missingFields.push('architecture');
    if (!normalized.deliveryPlan.length) missingFields.push('deliveryPlan');
    if (!normalized.nextStep) missingFields.push('nextStep');

    return {
        normalized,
        missingFields,
    };
}

export default async function handler(req, res) {
    const requestStartedAt = Date.now();
    let runId = null;
    let debugTrace = null;

    applySecurityHeaders(res);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!isAllowedOrigin(req.headers.origin)) {
        return res.status(403).json({ message: 'Origin not allowed' });
    }

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ message: 'GROQ_API_KEY not configured' });
    }

    const brief = sanitizeMultilineText(req.body?.brief, { min: 30, max: 1400, fallback: '' });
    const projectType = resolveDimension(req.body?.projectType, req.body?.projectTypeCustom, PROJECT_TYPES, PROJECT_TYPE_META, 'web-platform');
    const userScope = resolveDimension(req.body?.userScope, req.body?.userScopeCustom, USER_SCOPES, USER_SCOPE_META, 'mixed');
    const timeline = resolveDimension(req.body?.timeline, req.body?.timelineCustom, TIMELINES, TIMELINE_META, 'flexible');
    const complexity = resolveDimension(req.body?.complexity, req.body?.complexityCustom, COMPLEXITIES, COMPLEXITY_META, 'production-build');
    const constraints = sanitizeMultilineText(req.body?.constraints, { max: 400, fallback: 'No explicit constraints shared.' });
    runId = createRun({
        channel: 'architect',
        title: 'Project Architect Brief',
        input: brief || req.body?.brief,
        tools: ['Groq LLM', 'Portfolio Context', 'Schema Validation'],
    });

    if (!brief) {
        failRun(runId, {
            message: 'Architect intake rejected because the project brief was too short or invalid.',
            decision: 'Rejected before generation',
        });
        return res.status(400).json({ message: 'A valid project brief is required.' });
    }

    completeStep(runId, 'ingress', 'Architect request accepted by the edge function.');
    completeStep(runId, 'validation', 'Brief body and selector values were normalized safely.');
    completeStep(runId, 'context', 'Project shape, audience, timeline, and delivery depth were resolved for the model.');

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const userPrompt = `
Project shape:
- Label: ${projectType.label}
- Key: ${projectType.key}
- Interpretation: ${projectType.description}

Primary audience:
- Label: ${userScope.label}
- Key: ${userScope.key}
- Interpretation: ${userScope.description}

Delivery window:
- Label: ${timeline.label}
- Key: ${timeline.key}
- Interpretation: ${timeline.description}

Phase-one depth:
- Label: ${complexity.label}
- Key: ${complexity.key}
- Interpretation: ${complexity.description}

Constraints:
${constraints}

Project brief:
${brief}

Output expectations:
- Name the most credible product shape for phase one.
- Recommend a stack Alberto would realistically build and defend.
- Keep architecture grounded in the actual launch constraints.
- If AI is not justified, return one concise item explaining why phase one should stay non-AI and where AI could be added later.
`;
    debugTrace = {
        channel: 'architect',
        provider: 'Groq',
        model: null,
        userInput: brief,
        availableActions: ARCHITECT_ACTIONS,
        requestMessages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: userPrompt },
        ],
        rawModelResponse: null,
        parsedResponse: null,
        requestPayload: {
            brief,
            projectType,
            userScope,
            timeline,
            complexity,
            constraints,
        },
    };

    try {
        let response = null;
        let lastError = null;

        for (let i = 0; i < MODELS.length; i += 1) {
            try {
                const completion = await groq.chat.completions.create({
                    model: MODELS[i],
                    temperature: 0.15,
                    seed: 42,
                    max_completion_tokens: 1200,
                    response_format: { type: 'json_object' },
                    messages: debugTrace.requestMessages,
                });

                debugTrace.model = MODELS[i];
                debugTrace.rawModelResponse = completion.choices?.[0]?.message?.content || '';
                const parsedResponse = normalizeArchitectResponse(
                    extractJsonObject(debugTrace.rawModelResponse),
                    { projectTypeKey: projectType.key }
                );
                completeStep(runId, 'inference', `Architecture brief drafted successfully using ${MODELS[i]}.`);

                if (parsedResponse.missingFields.length) {
                    const error = new Error('ARCHITECT_RESPONSE_INCOMPLETE');
                    error.status = 502;
                    error.details = { missingFields: parsedResponse.missingFields };
                    throw error;
                }

                response = parsedResponse.normalized;
                debugTrace.parsedResponse = response;
                completeStep(runId, 'action', 'Structured response passed schema validation and is safe to expose.');
                recordServiceProbe('groq-provider', {
                    status: 'operational',
                    note: `Architect inference completed successfully with ${MODELS[i]}.`,
                });
                break;
            } catch (error) {
                lastError = error;
                const isRateLimit = error?.status === 429 || String(error).includes('429') || String(error).includes('rate_limit');
                if (isRateLimit && i < MODELS.length - 1) {
                    await sleep(200);
                    continue;
                }
                recordServiceProbe('groq-provider', {
                    status: 'degraded',
                    note: `Architect inference failed on ${MODELS[i]}: ${error.message || 'provider failure'}.`,
                });
                throw error;
            }
        }

        if (!response) throw lastError || new Error('ARCHITECT_RESPONSE_EMPTY');

        attachRunTrace(runId, debugTrace);
        finishRun(runId, {
            output: response.summary,
            decision: response.solutionFit ? `${response.solutionFit} solution fit` : 'Brief generated',
            approval: 'Schema-validated brief returned to frontend',
        });
        recordServiceProbe('architect-api', {
            status: 'operational',
            latencyMs: Date.now() - requestStartedAt,
            note: 'Project Architect generated a validated brief successfully.',
        });

        return res.status(200).json({
            briefId: `ARCH-${Date.now().toString(36).toUpperCase()}`,
            generatedAt: new Date().toISOString(),
            ...response,
            debugTrace,
        });
    } catch (error) {
        recordServiceProbe('architect-api', {
            status: 'degraded',
            latencyMs: Date.now() - requestStartedAt,
            note: `Project Architect failed: ${error?.message || 'internal failure'}.`,
        });
        if (runId) {
            attachRunTrace(runId, debugTrace);
            failRun(runId, {
                message: error?.message || 'Architect generation failed before a valid brief could be returned.',
                decision: 'Runtime failure',
            });
        }
        return res.status(error?.status || 500).json({
            message: error?.message || 'ARCHITECT_REQUEST_FAILED',
            details: error?.details || null,
            debugTrace,
        });
    }
}
