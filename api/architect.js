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

const PROJECT_TYPES = ['web-platform', 'ai-agent', 'automation-system', 'internal-tool', 'creative-interface'];
const USER_SCOPES = ['solo-team', 'department', 'public-users', 'clients', 'mixed'];
const TIMELINES = ['asap', 'month', 'quarter', 'flexible'];
const COMPLEXITIES = ['focused-mvp', 'production-build', 'multi-system'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildSystemPrompt() {
    return `
You are Alberto Medina's AI Project Architect.

Your task is to transform a project intake into a sharp pre-sales architecture brief that sounds like a senior systems engineer.

Rules:
- Be concrete, useful, and commercially relevant.
- Mirror the user's language if it is obvious; otherwise use English.
- Focus on architecture, delivery strategy, technical tradeoffs, and measurable value.
- Do not invent proprietary data, budgets, or guarantees.
- Keep output concise and high-signal.
- Mention AI only when it materially improves the system.
- Output valid JSON only.

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
    const projectType = sanitizeEnum(req.body?.projectType, PROJECT_TYPES, 'web-platform');
    const userScope = sanitizeEnum(req.body?.userScope, USER_SCOPES, 'mixed');
    const timeline = sanitizeEnum(req.body?.timeline, TIMELINES, 'flexible');
    const complexity = sanitizeEnum(req.body?.complexity, COMPLEXITIES, 'production-build');
    const constraints = sanitizeMultilineText(req.body?.constraints, { max: 400, fallback: 'No explicit constraints shared.' });

    if (!brief) {
        return res.status(400).json({ message: 'A valid project brief is required.' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const userPrompt = `
Project type: ${projectType}
User scope: ${userScope}
Timeline: ${timeline}
Complexity: ${complexity}
Constraints: ${constraints}

Project brief:
${brief}
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
