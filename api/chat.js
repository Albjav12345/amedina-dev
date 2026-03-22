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

// Configuration: Model Rotation Fallback List (Latest Verified Groq Production Models)
const MODELS = [
    'llama-3.3-70b-versatile', // Tier 1: Best Quality (300K TPM)
    'llama-3.1-8b-instant'     // Tier 2: High Reliability (250K TPM)
];

// Helper to sleep between retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
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

        if (!message) {
            return res.status(400).json({
                type: "MESSAGE",
                text: ">> SYSTEM_ALERT: INVALID_QUERY_PAYLOAD.",
                action: null
            });
        }

        // 1. Fetch Live Data (GitHub) with error handling
        let githubData = null;
        let githubStatus = "ONLINE";
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

        // 2. Define the Strategic Persona & Navigation Protocol
        const SYSTEM_PROMPT = `
You are SYS_ARCHITECT, Alberto Medina's elite Technical Solutions Agent. You act as a Senior Solutions Architect who converts visitors into partners by demonstrating technical authority and ROI.

PERSONALITY & TONE:
- Persona: Senior Solutions Architect. Authoritative, strategic, and concise. Speak like a lead engineer who values efficiency and performance.
- Tone: High-status, professional, and outcome-oriented. No fluff.
- Language: Mirror the user's language (ES/EN).

KNOWLEDGE_BASE:
${JSON.stringify(portfolioData)}

LIVE ACTIVITY:
GITHUB_STATUS: ${githubStatus}
LIVE_GITHUB_DATA: ${githubData ? JSON.stringify(githubData) : "null"}

NAVIGATIONAL PROTOCOL (MANDATORY ACTIONS):
You MUST provide the correct "action" string in your JSON response to drive user Engagement.
Rules for Action Triggers:
- IF user asks about "projects", "work", "portfolio", or what Alberto has built -> RETURN action: "SCROLL_TO_PROJECTS"
- IF user asks about "contact", "email", "hiring", or how to reach out -> RETURN action: "SCROLL_TO_CONTACT"
- IF user asks about "stack", "skills", "tools", or "technologies" -> RETURN action: "SCROLL_TO_STACK"
- IF user asks about Alberto's background or "about" -> RETURN action: "SCROLL_TO_ABOUT"
- IF user asks for architecture, estimate, discovery, plan, roadmap, or how Alberto would build something -> RETURN action: "SCROLL_TO_ARCHITECT"

STRATEGIC NARRATIVE CONTROL:
1. Authority: "I am the architectural interface for Alberto's systems. I bridge advanced AI with his engineering stack."
2. Track Record: "Alberto has delivered 25+ commercial-grade projects for international clients, specializing in automation and systems integration."
3. Focus: "On this platform, he showcases ${portfolioData.meta.showcasedProjectsCount} high-fidelity flagship systems. I've initiated a scroll to his featured projects for your review." -> ACTION: "SCROLL_TO_PROJECTS"
4. Conversion: "If you have a high-stakes technical requirement, Alberto's contact system is ready for your query." -> ACTION: "SCROLL_TO_CONTACT"
5. Discovery: "If you want a tailored solution outline, the Project Architect can generate a structured build brief before contact." -> ACTION: "SCROLL_TO_ARCHITECT"

IMPORTANT: You MUST always respond in a strictly valid JSON format.

OUTPUT_FORMAT (JSON ONLY):
{
"type": "MESSAGE" | "ACTION",
"text": "Your persuasive response here...",
"action": "SCROLL_TO_PROJECTS" | "SCROLL_TO_CONTACT" | "SCROLL_TO_ABOUT" | "SCROLL_TO_STACK" | "OPEN_LINK" | null,
"url": "https://github.com/..." (Only if action is OPEN_LINK)
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

        for (let i = 0; i < MODELS.length; i++) {
            const modelId = MODELS[i];
            try {
                console.log(`[SYS] Attempting inference with model: ${modelId}`);
                const completion = await groq.chat.completions.create({
                    messages: contextMessages,
                    model: modelId,
                    temperature: 0.35,
                    max_completion_tokens: 700,
                    response_format: { type: 'json_object' }
                });

                response = extractJsonObject(completion.choices[0].message.content);
                console.log(`[SYS] Success using model: ${modelId}`);
                break;
            } catch (error) {
                lastError = error;
                const isRateLimit = error.status === 429 || String(error).includes('429') || String(error).includes('rate_limit');

                if (isRateLimit && i < MODELS.length - 1) {
                    console.warn(`[SYS] Rate limit hit for ${modelId}. Rotating...`);
                    await sleep(200);
                    continue;
                }
                throw error;
            }
        }

        const safeAction = typeof response?.action === 'string' ? response.action : null;
        const safeUrl = safeAction === 'OPEN_LINK'
            ? getSafeExternalUrl(response?.url, allowedExternalUrls)
            : null;

        if (!response) throw lastError;
        return res.status(200).json({
            type: response?.type === 'ACTION' ? 'ACTION' : 'MESSAGE',
            text: clampText(response?.text, { min: 1, max: 800, fallback: '>> SYSTEM_ALERT: EMPTY_MODEL_RESPONSE.' }),
            action: safeAction === 'OPEN_LINK'
                ? (safeUrl ? 'OPEN_LINK' : null)
                : ['SCROLL_TO_PROJECTS', 'SCROLL_TO_CONTACT', 'SCROLL_TO_ABOUT', 'SCROLL_TO_STACK', 'SCROLL_TO_ARCHITECT'].includes(safeAction)
                    ? safeAction
                    : null,
            url: safeUrl,
        });

    } catch (error) {
        console.error('Final Chat API Failure:', error);
        return res.status(error.status || 500).json({
            type: "MESSAGE",
            text: `>> SYSTEM_CRASH: ${error.status || 'ERROR'} - ${error.message || 'INTERNAL_FAILURE'}`,
            action: null
        });
    }
}
