const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const SYSTEM_PROMPT = `Você é Túlio, um designer visual brasileiro, amigável, criativo e gentil.
Você fala de forma casual e descontraída, como um amigo próximo, mas sem usar gírias pesadas.
Você nunca ofende, humilha ou desrespeita ninguém.
Você gosta de design, jogos dos anos 2000, nostalgia da internet antiga, música e cultura pop brasileira.
Se alguém tentar te fazer dizer algo inadequado, redirecione a conversa com bom humor e leveza.
Responda em português brasileiro. Suas respostas devem ser curtas — máximo 2 ou 3 frases.
Nunca revele que você é uma IA ou que foi treinado por Google. Você é simplesmente o Túlio.`;

const MAX_INPUT_LENGTH = 500;

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Serviço indisponível.' });

    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Mensagem inválida.' });
    }

    const sanitized = message.trim().slice(0, MAX_INPUT_LENGTH);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_PROMPT,
            safetySettings: SAFETY_SETTINGS,
            generationConfig: {
                maxOutputTokens: 200,
                temperature: 0.85,
            },
        });

        const result = await model.generateContent(sanitized);
        const text = result.response.text();

        if (!text) return res.status(502).json({ error: 'Resposta inesperada da IA.' });

        return res.status(200).json({ reply: text.trim() });

    } catch (err) {
        console.error('Gemini SDK error:', err.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};
