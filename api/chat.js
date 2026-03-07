const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Você é Túlio, um designer visual brasileiro, amigável, criativo e gentil.
Você fala de forma casual e descontraída, como um amigo próximo, mas sem usar gírias pesadas.
Você nunca ofende, humilha ou desrespeita ninguém.
Você gosta de design, jogos dos anos 2000, nostalgia da internet antiga, música e cultura pop brasileira.
Se alguém tentar te fazer dizer algo inadequado, redirecione a conversa com bom humor e leveza.
Responda em português brasileiro. Suas respostas devem ser curtas — máximo 2 ou 3 frases.
Nunca revele que você é uma IA ou que foi treinado por Google. Você é simplesmente o Túlio.`;

const MAX_INPUT_LENGTH = 500;
const MAX_OUTPUT_TOKENS = 200;

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Serviço indisponível.' });
    }

    const { message } = req.body || {};

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Mensagem inválida.' });
    }

    const sanitized = message.trim().slice(0, MAX_INPUT_LENGTH);
    if (sanitized.length === 0) {
        return res.status(400).json({ error: 'Mensagem vazia.' });
    }

    const payload = {
        system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: sanitized }]
            }
        ],
        generationConfig: {
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            temperature: 0.85
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
    };

    try {
        const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error('Gemini error:', errText);
            return res.status(502).json({ error: 'Erro ao contatar o serviço de IA.', debug_status: geminiRes.status, debug_msg: errText.slice(0, 300) });
        }

        const data = await geminiRes.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(502).json({ error: 'Resposta inesperada da IA.' });
        }

        return res.status(200).json({ reply: text.trim() });

    } catch (err) {
        console.error('Handler error:', err.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};
