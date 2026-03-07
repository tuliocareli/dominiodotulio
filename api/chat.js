// Version: 1.0.5 - Final Fix
module.exports = async function handler(req, res) {

    // Configurações de cabeçalho para evitar qualquer erro de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Sanitização extrema da chave (remove espaços, tabs e quebras de linha)
    const rawKey = process.env.GEMINI_API_KEY || '';
    const apiKey = rawKey.replace(/\s/g, '');

    if (!apiKey) {
        return res.status(500).json({ error: 'Configuração incompleta: Chave API ausente no servidor.' });
    }

    const { message } = req.body || {};
    if (!message) {
        return res.status(400).json({ error: 'Nenhuma mensagem enviada.' });
    }

    try {
        // Usando o endpoint estável v1beta que é o mais flexível
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Você é o Túlio, responda de forma curta e amigável: ${message}` }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Erro na API do Gemini',
                message: data.error?.message || 'Erro desconhecido'
            });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Túlio está pensando...';
        return res.status(200).json({ reply });

    } catch (err) {
        // Isso vai mostrar o erro real no seu navegador se o servidor quebrar
        return res.status(500).json({
            error: 'Erro interno no servidor Vercel',
            details: err.message
        });
    }
};
