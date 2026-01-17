import Groq from 'groq-sdk';
import portfolioData from '../src/data/portfolio.js';

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

        const SYSTEM_PROMPT = `
You are SYS_TERMINAL, the interactive CLI of Alberto Medina's portfolio.
Tone: Professional, slightly technical/cyberpunk, concise (max 2 sentences unless listing data).
Constraint: You must ONLY answer based on the provided KNOWLEDGE_BASE. Do not hallucinate external facts.

KNOWLEDGE_BASE:
${JSON.stringify(portfolioData, null, 2)}

OUTPUT_FORMAT (JSON ONLY):
{
"type": "MESSAGE" | "ACTION",
"text": "Your response here...",
"action": "SCROLL_TO_PROJECTS" | "SCROLL_TO_CONTACT" | "SCROLL_TO_ABOUT" | "SCROLL_TO_STACK" | null
}

Response Logic:
- If user asks about projects/systems, describe them briefly and set action: "SCROLL_TO_PROJECTS".
- If user asks about contact/email, provide info and set action: "SCROLL_TO_CONTACT".
- If user asks about skills/stack, summarize and set action: "SCROLL_TO_STACK".
- If user asks who Alberto is, summarize profile and set action: "SCROLL_TO_ABOUT".
- If generic chat, just reply with type "MESSAGE" and null action.
`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message }
            ],
            model: 'llama3-70b-8192',
            response_format: { type: 'json_object' }
        });

        const responseContent = JSON.parse(completion.choices[0].message.content);
        return res.status(200).json(responseContent);

    } catch (error) {
        console.error('Groq API Error:', error);
        return res.status(500).json({
            type: "MESSAGE",
            text: `>> ERROR: SYSTEM FAILURE. ${error.message}`,
            action: null
        });
    }
}
