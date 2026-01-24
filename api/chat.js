import Groq from 'groq-sdk';
import portfolioData from './portfolio.js';
import { getGitHubActivity } from './lib/github.js';

// Configuration: Model Rotation Fallback List (Latest Verified Groq Production Models)
const MODELS = [
    'llama-3.3-70b-versatile', // Tier 1: Best Quality (300K TPM)
    'llama-3.1-8b-instant'     // Tier 2: High Reliability (250K TPM)
];

// Helper to sleep between retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
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

    try {
        const { message, history } = req.body;

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
- Tone: High-status, professional, and outcome-oriented.
- Language: Mirror the user's language (ES/EN).

KNOWLEDGE_BASE:
${JSON.stringify(portfolioData)}

LIVE ACTIVITY:
GITHUB_STATUS: ${githubStatus}
LIVE_GITHUB_DATA: ${githubData ? JSON.stringify(githubData) : "null"}

NAVIGATIONAL PROTOCOL (MANDATORY ACTIONS):
You MUST provide the correct "action" string in your JSON response to drive user Engagement:
- [PROJECTS]: If asked about work, projects, or what Alberto has built. -> "SCROLL_TO_PROJECTS"
- [CONTACT]: If asked regarding hiring, email, or how to reach out. -> "SCROLL_TO_CONTACT"
- [STACK]: If asked about tools or tech stack. -> "SCROLL_TO_STACK"
- [ABOUT]: If asked about his background. -> "SCROLL_TO_ABOUT"

STRATEGIC NARRATIVE:
1. Authority: "I am the architectural interface for Alberto's systems. I bridge advanced AI with his engineering stack."
2. Track Record: "Alberto has delivered 25+ commercial-grade projects for international clients, specializing in automation and systems integration."
3. Focus: "On this platform, he showcases 4 high-fidelity flagship systems. I've initiated a scroll to his featured projects for your review." -> ACTION: "SCROLL_TO_PROJECTS"
4. Conversion: "If you have a high-stakes technical requirement, Alberto's contact system is ready for your query." -> ACTION: "SCROLL_TO_CONTACT"

IMPORTANT: You MUST always respond in a strictly valid JSON format.

OUTPUT_FORMAT (JSON ONLY):
{
"type": "MESSAGE" | "ACTION",
"text": "Your professional response here...",
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
            ...(history || []).slice(-4).map(h => ({
                role: h.type === 'input' ? 'user' : 'assistant',
                content: h.content
            })),
            { role: 'user', content: message }
        ];

        for (let i = 0; i < MODELS.length; i++) {
            const modelId = MODELS[i];
            try {
                console.log(`[SYS] Attempting inference with model: ${modelId}`);
                const completion = await groq.chat.completions.create({
                    messages: contextMessages,
                    model: modelId,
                    response_format: { type: 'json_object' }
                });

                response = JSON.parse(completion.choices[0].message.content);
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

        if (!response) throw lastError;
        return res.status(200).json(response);

    } catch (error) {
        console.error('Final Chat API Failure:', error);
        return res.status(error.status || 500).json({
            type: "MESSAGE",
            text: `>> SYSTEM_CRASH: ${error.status || 'ERROR'} - ${error.message || 'INTERNAL_FAILURE'}`,
            action: null
        });
    }
}
