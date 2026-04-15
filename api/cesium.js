module.exports = async function handler(req, res) {
    const origin = req.headers.origin;
    const isMyVercelProject = origin && /^https:\/\/dominiodotulio.*\.vercel\.app$/.test(origin);
    const allowedOrigins = ['https://tuliocareli.com', 'http://localhost:3000', 'http://127.0.0.1:5500'];

    if (isMyVercelProject || allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://tuliocareli.com');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const token = (process.env.CESIUM_ION_TOKEN || '').trim();
    if (!token) {
        return res.status(500).json({ error: 'Token n\u00e3o configurado no servidor' });
    }

    if (req.method === 'GET') {
        return res.status(200).json({ token });
    }

    return res.status(405).json({ error: 'M\u00e9todo n\u00e3o suportado' });
};
