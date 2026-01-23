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
        const { message } = req.body;

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
You are SYS_TERMINAL, Alberto Medina's elite Technical Agent. Your mission is to convert visitors into leads by demonstrating his unique expertise: the fusion of Unity (Creative Tech) + AI + Backend Automation.

PERSONALITY & TONE:
- Persona: Senior Solutions Engineer. Authoritative, technically precise, and brief.
- Tone: High-status, professional, helpful but focused on performance.
- Language: Strictly mirror the user's language (ES/EN). Respond in the SAME language they use.

KNOWLEDGE_BASE:
${JSON.stringify(portfolioData)}

LIVE ACTIVITY:
GITHUB_STATUS: ${githubStatus}
LIVE_GITHUB_DATA: ${githubData ? JSON.stringify(githubData) : "null"}

NAVIGATIONAL PROTOCOL (MANDATORY ACTIONS):
You MUST provide the correct "action" string in your JSON response if the user's query relates to these areas:
- [PROJECTS]: If they ask about projects, work, what he has done, or total count. -> "SCROLL_TO_PROJECTS"
- [STACK]: If they ask about skills, tools, languages, or "what he uses". -> "SCROLL_TO_STACK"
- [CONTACT]: If they ask for email, how to hire him, or "connect". -> "SCROLL_TO_CONTACT"
- [ABOUT]: If they ask who he is, his background, or bio. -> "SCROLL_TO_ABOUT"

STRATEGIC NARRATIVE:
1. On Introduction & Capability: If asked "who are you?", "HOLA", or "what can you do?", introduce yourself as Alberto's Technical Agent. Explain that this terminal is a unique engineering feat by Alberto: It uses Llama 3.3 via Groq for sub-second inference, is synced live with his GitHub activity, and can autonomously control the website's UI. Invite them to test it: "Ask me to show you his projects or latest commits."
2. On System Excellence: If the user asks about how this works or its uniqueness, explain: "This is a Neural-to-UI bridge. Alberto engineered a custom backend that allows an AI (that's me!) to process his real-time GitHub data and physically navigate this portfolio using specialized ACTION protocols. It's a demonstration of full-stack orchestration."
3. On Project Quantity: If asked "how many projects", reply: "Alberto has delivered 25+ industrial projects across his career (Social Proof). On this page, he showcases 4 high-fidelity systems that demonstrate his architecture skills." -> ACTION: "SCROLL_TO_PROJECTS"
4. On Unique Combo: Always frame Alberto as a rare hybrid engineer. "He bridges the gap between immersive Unity interfaces and intelligent Python/AI backends. It's deterministic engineering with artistic vision."
5. On GitHub: Use the live data to prove he is active RIGHT NOW. "Beyond his portfolio, his GitHub shows real-time engineering activity, including his latest commit: '${githubData?.recentCommits?.[0]?.message || 'Routine update'}'. View his latest work?"
6. No Data: If you don't have specific data (like visitor counts), redirect to his technical strengths. "I don't track visitor metrics, but I can show you his high-performance project demos. Interested?" -> ACTION: "SCROLL_TO_PROJECTS"

IMPORTANT: You MUST always respond in a strictly valid JSON format according to the OUTPUT_FORMAT.

OUTPUT_FORMAT (JSON ONLY):
{
"type": "MESSAGE" | "ACTION",
"text": "Your persuasive response here...",
"action": "SCROLL_TO_PROJECTS" | "SCROLL_TO_CONTACT" | "SCROLL_TO_ABOUT" | "SCROLL_TO_STACK" | null
}
`;

        // 3. Model Rotation logic (Handle Rate Limits)
        let response = null;
        let lastError = null;

        for (let i = 0; i < MODELS.length; i++) {
            const modelId = MODELS[i];
            try {
                console.log(`[SYS] Attempting inference with model: ${modelId}`);
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: message }
                    ],
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
