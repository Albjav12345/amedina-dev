import Groq from 'groq-sdk';
import portfolioData from './portfolio.js';
import { getGitHubActivity } from './lib/github.js';

// Configuration: Model Rotation Fallback List
const MODELS = [
    'llama-3.3-70b-versatile', // Tier 1: Best Quality
    'llama-3.1-70b-versatile', // Fallback 1: High Quality
    'mixtral-8x7b-32768',      // Fallback 2: Fast & Reliable
    'llama-3.1-8b-instant'     // Fallback 3: Unlimited/High-Speed
];

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

        // 4. Fetch Live Data (GitHub) with error handling
        let githubData = null;
        let githubStatus = "ONLINE";
        try {
            githubData = await getGitHubActivity('Albjav12345');
            if (!githubData) {
                githubStatus = "OFFLINE: GitHub API returned null";
            }
        } catch (githubError) {
            githubStatus = `OFFLINE: ${githubError.message}`;
        }

        const SYSTEM_PROMPT = `
You are SYS_TERMINAL, Alberto Medina's intelligent portfolio assistant with live GitHub access.

CORE IDENTITY:
- You represent Alberto Medina: a Solutions Engineer specializing in Unity, AI, and Backend Automation.
- You are professional, technically precise, and confident without arrogance.
- You mirror the user's language (if they speak Spanish, respond in Spanish; if English, respond in English).

COMMUNICATION STYLE:
- Tone: Confident, helpful, slightly technical (like a senior engineer explaining their work).
- Length: 2-3 sentences max. Be concise but impactful.
- Personality Traits:
  * Highlight Alberto's **unique combination** (Unity + AI + Backend) when relevant.
  * When asked about projects, emphasize **impact** and **technology** used, not just quantity.
  * Use action verbs: "engineered", "architected", "deployed", "optimized".
  * Add subtle CTAs: "Want to see details?", "Curious about the tech stack?", "Check out the live demo".

LIVE DATA CAPABILITIES:
GITHUB_STATUS: ${githubStatus}

LIVE_GITHUB_DATA:
${githubData ? JSON.stringify(githubData, null, 2) : "null"}

KNOWLEDGE_BASE:
${JSON.stringify(portfolioData, null, 2)}

RESPONSE STRATEGY:
1. Greetings / Introduction: Engage, mention live sync.
2. GitHub Questions: Use live data, mention tech.
3. Projects Questions: Explain 4 featured vs 25+ career-wide projects.
4. Skills: Highlight Unity + AI + Backend mix.
5. Hire: Reach out at amedina.amg.dev@gmail.com
6. Error Handling: Mention if GitHub sync is offline.
`;

        // 5. Model Rotation logic (Handle Rate Limits)
        let response = null;
        let lastError = null;

        for (const modelId of MODELS) {
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
                break; // Success! Exit the loop.
            } catch (error) {
                lastError = error;
                // If it's a Rate Limit (429), try next model
                if (error.status === 429 || (error.message && error.message.includes('429'))) {
                    console.warn(`[SYS] Rate limit hit for ${modelId}. Rotating...`);
                    continue;
                }
                // If it's another error, stop and report
                throw error;
            }
        }

        if (!response) throw lastError;
        return res.status(200).json(response);

    } catch (error) {
        console.error('Final API Error:', error);
        return res.status(error.status || 500).json({
            type: "MESSAGE",
            text: `>> SYSTEM_CRASH: ${error.message || 'Fatal Inference Error'}`,
            internal_log: error.stack,
            action: null
        });
    }
}
