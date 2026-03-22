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

const MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant'
];

const CUSTOM_OPTION = '__custom__';
const PROJECT_TYPES = ['web-platform', 'ai-agent', 'automation-system', 'internal-tool', 'creative-interface'];
const USER_SCOPES = ['solo-team', 'department', 'public-users', 'clients', 'mixed'];
const TIMELINES = ['asap', 'month', 'quarter', 'flexible'];
const COMPLEXITIES = ['focused-mvp', 'production-build', 'multi-system'];

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
You are Alberto Medina's AI Project Architect.

Your task is to transform a project intake into a sharp pre-sales architecture brief that sounds like a senior systems engineer writing directly to a prospective client.

Rules:
- Be concrete, commercially relevant, and architecturally credible.
- Mirror the user's language if it is obvious; otherwise use English.
- Focus on architecture, delivery strategy, implementation realism, technical tradeoffs, and measurable value.
- Do not invent proprietary data, budgets, or guarantees.
- Prefer the narrowest architecture that credibly solves phase one.
- Recommend simple, stable technology by default unless the brief clearly demands higher complexity.
- Treat security, permissions, auditability, and operational visibility as first-class concerns whenever relevant.
- Mention AI only when it materially improves the system; do not force AI into the solution.
- Avoid generic filler such as "scalable", "robust", or "seamless" unless you immediately make it concrete.
- Write like an expert who already sees delivery risks, hidden scope, and product shape.
- The result should feel like something Alberto could confidently send after a real discovery call.
- Keep output concise and high-signal.
- Output valid JSON only.

Decision rules:
- First identify the smallest valuable release.
- Then choose architecture layers that directly support that release.
- Use the intake dimensions to infer delivery pressure, audience complexity, and operational risk.
- If an input is custom or ambiguous, make the safest reasonable interpretation and surface the ambiguity in risks or next step.
- Delivery phases should be realistic for one strong engineer or a small delivery team, not an enterprise org chart.
- Recommended stack items should be implementation-ready technologies or patterns, not vague categories.
- Architecture items should each name a real layer or subsystem and explain why it exists.
- Quick wins should be tactical and immediately useful.
- Risks should expose scope, dependency, data, integration, security, or adoption concerns.
- AI opportunities should be narrow and practical: triage, summarization, drafting, retrieval, classification, anomaly detection, or supervised actions.

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

function normalizeArchitectResponse(response) {
    return {
        headline: clampText(response?.headline, { min: 8, max: 80, fallback: 'AI Architecture Brief' }),
        summary: sanitizeMultilineText(response?.summary, { min: 40, max: 420, fallback: 'A tailored architecture brief is ready for review.' }),
        solutionFit: sanitizeEnum(response?.solutionFit, ['High', 'Strong', 'Selective'], 'Strong'),
        recommendedStack: Array.isArray(response?.recommendedStack)
            ? response.recommendedStack.map(item => clampText(item, { min: 1, max: 40, fallback: '' })).filter(Boolean).slice(0, 6)
            : [],
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
        aiOpportunities: Array.isArray(response?.aiOpportunities)
            ? response.aiOpportunities.map(item => sanitizeMultilineText(item, { min: 5, max: 120, fallback: '' })).filter(Boolean).slice(0, 4)
            : [],
        nextStep: sanitizeMultilineText(response?.nextStep, { min: 10, max: 160, fallback: 'Share this brief and turn it into a scoped execution plan.' }),
    };
}

export default async function handler(req, res) {
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

    if (!brief) {
        return res.status(400).json({ message: 'A valid project brief is required.' });
    }

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
- If AI is not justified, keep AI opportunities limited or empty.
`;

    try {
        let response = null;
        let lastError = null;

        for (let i = 0; i < MODELS.length; i += 1) {
            try {
                const completion = await groq.chat.completions.create({
                    model: MODELS[i],
                    temperature: 0.4,
                    max_completion_tokens: 1200,
                    response_format: { type: 'json_object' },
                    messages: [
                        { role: 'system', content: buildSystemPrompt() },
                        { role: 'user', content: userPrompt },
                    ],
                });

                response = normalizeArchitectResponse(
                    extractJsonObject(completion.choices?.[0]?.message?.content)
                );
                break;
            } catch (error) {
                lastError = error;
                const isRateLimit = error?.status === 429 || String(error).includes('429') || String(error).includes('rate_limit');
                if (isRateLimit && i < MODELS.length - 1) {
                    await sleep(200);
                    continue;
                }
                throw error;
            }
        }

        if (!response) throw lastError || new Error('ARCHITECT_RESPONSE_EMPTY');

        return res.status(200).json({
            briefId: `ARCH-${Date.now().toString(36).toUpperCase()}`,
            generatedAt: new Date().toISOString(),
            ...response,
        });
    } catch (error) {
        return res.status(error?.status || 500).json({
            message: error?.message || 'ARCHITECT_REQUEST_FAILED',
        });
    }
}
