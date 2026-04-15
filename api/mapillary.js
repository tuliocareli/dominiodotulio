export default function handler(req, res) {
    // Configura os headers do CORS
    const allowedOrigins = ['http://localhost:3000', 'https://dominiodotulio.vercel.app'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde ao preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        const token = process.env.MAPILLARY_CLIENT_TOKEN;
        
        if (!token) {
            return res.status(500).json({ error: 'Token MAPILLARY não configurado no servidor' });
        }
        
        return res.status(200).json({ token: token });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
