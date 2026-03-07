const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/[\n\r\s]/g, '');
    if (!apiKey) return res.status(500).json({ error: 'Falta GEMINI_API_KEY na Vercel.' });

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // gemini-flash-latest é o alias que o Google confirmou estar disponível para sua chave
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        if (req.method === 'GET') {
            const queryMsg = req.query.msg || 'Diga oi';
            const result = await model.generateContent(queryMsg);
            const response = await result.response;
            return res.status(200).json({
                status: 'CONECTADO! 🚀',
                reply: response.text().trim()
            });
        }

        if (req.method === 'POST') {
            const { message } = req.body || {};
            if (!message) return res.status(400).json({ error: 'Mensagem vazia' });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: message }] }],
                systemInstruction: "Você é o Túlio, designer visual brasileiro amigável. Responda de forma curta e casual."
            });

            const response = await result.response;
            return res.status(200).json({ reply: response.text().trim() });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Erro de Integração', detail: err.message });
    }

    return res.status(405).json({ error: 'Método não suportado' });
};
