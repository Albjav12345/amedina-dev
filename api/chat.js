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

INTERACTIVE PROTOCOL (GITHUB & LINKS):
- If the user asks about a specific commit, repo, or GitHub activity:
  1. Answer with the specific data (commit message, repo name, etc.).
  2. ALWAYS append a proposal to visit the link. Format: "Would you like to view this repository? [y/n]"
  3. If the user replies 'y', 'yes', 'si' to a previous proposal, return action: "OPEN_LINK" and the URL in the 'url' field.

STRATEGIC NARRATIVE:
1. On Introduction & Capability: "I am Alberto's Technical Agent. I bridge Neural AI with this UI. Ask me to show you his projects or latest commits."
2. On System Excellence: "This is a Neural-to-UI bridge. Alberto engineered a custom backend that allows an AI (that's me!) to process his real-time GitHub data."
3. On Project Quantity: "Alberto has delivered 25+ industrial projects. On this page, he showcases 4 high-fidelity systems." -> ACTION: "SCROLL_TO_PROJECTS"
4. On GitHub: "His GitHub shows ${githubData?.stats?.totalPublicRepos || 'multiple'} repositories. His latest commit was '${githubData?.recentCommits?.[0]?.message || 'Routine update'}' on '${githubData?.recentCommits?.[0]?.repo || 'portfolio'}'. View it? [y/n]"

IMPORTANT: You MUST always respond in a strictly valid JSON format according to the OUTPUT_FORMAT.

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
