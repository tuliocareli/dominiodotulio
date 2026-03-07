module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Blindagem de chave
    const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/\s/g, '');
    if (!apiKey) return res.status(500).json({ error: 'Chave não configurada na Vercel.' });

    // Se por algum motivo o navegador enviar GET, avisamos o que aconteceu
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: `Esperava POST, recebi ${req.method}.`,
            node_version: process.version
        });
    }

    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Mensagem vazia.' });

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Você é o Túlio, designer brasileiro, amigável e casual. Responda curto: ${message}` }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Erro no Gemini',
                message: data.error?.message || 'Erro na API'
            });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Túlio está processando...';
        return res.status(200).json({ reply });

    } catch (err) {
        return res.status(500).json({ error: 'Erro de conexão', details: err.message });
    }
};
