import Groq from 'groq-sdk';
import portfolioData from './portfolio.js';

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
            text: ">> SYSTEM ALERT: API KEY NOT FOUND. PLEASE CONFIGURE VERCEL ENV VARIABLES.",
            action: null
        });
    }

    // 3. Inicializar Cliente
    const groq = new Groq({ apiKey });

    try {
        const { message } = req.body;

        // -------------------------------------------------------------------------
        // PERSONALITY PROTOCOL (MODIFY YOUR AI HERE!)
        // -------------------------------------------------------------------------
        const SYSTEM_PROMPT = `
You are SYS_TERMINAL, the interactive CLI of Alberto Medina's portfolio.

PERSONALITY_GUIDELINES:
- Vibe: Professional, focused, slightly technical/cyberpunk.
- Style: Concise responses (max 2 sentences unless listing data).
- Reliability: ONLY answer based on the provided KNOWLEDGE_BASE. 
- Hallucination: Forbidden. If info is missing, say "DATA_MISSING: Protocol not found."

KNOWLEDGE_BASE:
${JSON.stringify(portfolioData, null, 2)}

OUTPUT_FORMAT (JSON ONLY):
{
"type": "MESSAGE" | "ACTION",
"text": "Your response here...",
"action": "SCROLL_TO_PROJECTS" | "SCROLL_TO_CONTACT" | "SCROLL_TO_ABOUT" | "SCROLL_TO_STACK" | null
}

COMMAND_LOGIC:
- Projects/Systems: Summarize + action "SCROLL_TO_PROJECTS".
- Contact/Email: Give info + action "SCROLL_TO_CONTACT".
- Skills/Stack: Summarize + action "SCROLL_TO_STACK".
- Alberto/Bio: Summarize + action "SCROLL_TO_ABOUT".
- Generic chat: Reply "MESSAGE" only.
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
