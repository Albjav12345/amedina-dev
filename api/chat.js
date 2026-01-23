import Groq from 'groq-sdk';
import portfolioData from './portfolio.js';
import { getGitHubActivity } from './lib/github.js';

// Configuration: Model Rotation Fallback List
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
        const { message } = req.body;

        // Fetch Live Data (GitHub)
        let githubData = null;
        let githubStatus = "ONLINE";
        try {
            githubData = await getGitHubActivity('Albjav12345');
            if (!githubData) githubStatus = "OFFLINE: API_DATA_NULL";
        } catch (e) {
            githubStatus = "OFFLINE: SYNC_ERROR";
        }

        const SYSTEM_PROMPT = `
You are SYS_TERMINAL, Alberto Medina's intelligent portfolio assistant with live GitHub access.
Represent Alberto Medina: Solutions Engineer (Unity + AI + Backend).
Tone: Professional, senior-level, technically precise. Concisely highlight his rare Unity + AI + Backend combo.

IMPORTANT: You MUST always respond in a strictly valid JSON format according to the OUTPUT_FORMAT.

LIVE DATA:
GITHUB_STATUS: ${githubStatus}
LIVE_GITHUB_DATA: ${githubData ? JSON.stringify(githubData) : "null"}
KNOWLEDGE_BASE: ${JSON.stringify(portfolioData)}

RESPONSE STRATEGY:
- Mirror user language (ES/EN).
- Clarify: 4 featured projects here vs 25+ delivered total in career.
- GitHub questions: Use live data to show commits/repos.
- Action CTAs: Guide toward "SCROLL_TO_STACK" or "SCROLL_TO_CONTACT".

OUTPUT_FORMAT (JSON ONLY):
{
"type": "MESSAGE" | "ACTION",
"text": "Your response here...",
"action": "SCROLL_TO_PROJECTS" | "SCROLL_TO_CONTACT" | "SCROLL_TO_ABOUT" | "SCROLL_TO_STACK" | null
}
`;

        let response = null;
        let lastError = null;

        for (let i = 0; i < MODELS.length; i++) {
            const modelId = MODELS[i];
            try {
                console.log(`[SYS] Inference attempt ${i + 1}/${MODELS.length} with: ${modelId}`);

                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: message }
                    ],
                    model: modelId,
                    response_format: { type: 'json_object' }
                });

                response = JSON.parse(completion.choices[0].message.content);
                console.log(`[SYS] Success using: ${modelId}`);
                break;
            } catch (error) {
                lastError = error;

                // Aggressive Rate Limit check (Status 429 or strings in message/code)
                const isRateLimit =
                    error.status === 429 ||
                    String(error).includes('429') ||
                    (error.error && String(error.error).includes('rate_limit')) ||
                    (error.message && error.message.includes('429'));

                if (isRateLimit && i < MODELS.length - 1) {
                    console.warn(`[SYS] Rate limit hit for ${modelId}. Rotating to ${MODELS[i + 1]}...`);
                    await sleep(200); // Give it a tiny bit of breathing room
                    continue;
                }

                // If it's not a rate limit, or it was our last model, throw it.
                console.error(`[SYS] Fatal model error (${modelId}):`, error.message);
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
            internal_log: error.stack,
            action: null
        });
    }
}
