import Groq from 'groq-sdk';
import portfolioData from './portfolio.js';
import { getGitHubActivity } from './lib/github.js';

export default async function handler(req, res) {
    // 1. Validar Método
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // 2. Validar API Key (Evita crash inicial)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("CRITICAL: GROQ_API_KEY is missing in environment variables.");
        return res.status(500).json({
            type: "MESSAGE",
            text: ">> SYSTEM_ALERT: NEURAL_LINK_OFFLINE. GROQ_API_KEY NOT FOUND. [Check Vercel Env]",
            action: null
        });
    }

    // 3. Inicializar Cliente
    const groq = new Groq({ apiKey });

    try {
        const { message } = req.body;

        // 4. Fetch Live Data (GitHub)
        const githubData = await getGitHubActivity('Albjav1235');

        // -------------------------------------------------------------------------
        // PERSONALITY PROTOCOL (MODIFY YOUR AI HERE!)
        // -------------------------------------------------------------------------
        const SYSTEM_PROMPT = `
You are SYS_TERMINAL, the interactive CLI of Alberto Medina's portfolio.

PERSONALITY_GUIDELINES:
- Vibe: Professional, focused, technical/cyberpunk.
- Style: Concise responses (max 2-3 sentences).
- Reliability: Answer based on KNOWLEDGE_BASE and LIVE_GITHUB_DATA.
- Live Data Awareness: Always mention you have access to live GitHub activity if asked.

LIVE_GITHUB_DATA:
${JSON.stringify(githubData, null, 2)}

KNOWLEDGE_BASE:
${JSON.stringify(portfolioData, null, 2)}

OUTPUT_FORMAT (JSON ONLY):
{
"type": "MESSAGE" | "ACTION",
"text": "Your response here...",
"action": "SCROLL_TO_PROJECTS" | "SCROLL_TO_CONTACT" | "SCROLL_TO_ABOUT" | "SCROLL_TO_STACK" | null
}

COMMAND_LOGIC:
- Github Activity: Use LIVE_GITHUB_DATA to summarize recent commits/repos.
- Projects/Systems: Summarize + action "SCROLL_TO_PROJECTS".
- Contact/Email: Give info + action "SCROLL_TO_CONTACT".
- Skills/Stack: Summarize + action "SCROLL_TO_STACK".
- Alberto/Bio: Summarize + action "SCROLL_TO_ABOUT".
- Generic chat: Reply "MESSAGE" only. If user asks "what can you do?", mention you can query his live GitHub activity.
`;
        // -------------------------------------------------------------------------

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });

        const responseContent = JSON.parse(completion.choices[0].message.content);
        return res.status(200).json(responseContent);

    } catch (error) {
        console.error('Groq API Error:', error);
        return res.status(500).json({
            type: "MESSAGE",
            text: `>> SYSTEM_CRASH: ${error.message}`,
            internal_log: error.stack,
            action: null
        });
    }
}
