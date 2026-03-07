const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

const SYSTEM_PROMPT = `Você é o Túlio, um designer visual brasileiro amigável. Responda de forma casual e curta (máx 2 frases).`;

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chave ausente no servidor.' });

    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Mensagem vazia.' });

    // Payload seguindo estritamente a documentação v1
    const payload = {
        contents: [{
            parts: [
                { text: SYSTEM_PROMPT },
                { text: `Usuário diz: ${message}` }
            ]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150
        }
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini Error:', data);
            return res.status(response.status).json({
                error: 'Erro na API do Gemini',
                details: data.error?.message || 'Erro desconhecido'
            });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) return res.status(500).json({ error: 'Resposta vazia da IA.' });

        return res.status(200).json({ reply: reply.trim() });

    } catch (err) {
        return res.status(500).json({ error: 'Erro interno: ' + err.message });
    }
};
