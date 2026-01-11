import { put } from '@vercel/blob';

export const config = {
    api: {
        bodyParser: false, // Disabling body parser to handle streams/raw files manually if needed, 
        // but @vercel/blob put can accept request object directly in some cases?
        // Actually "put" expects a file/blob/string.
        // Ideally, with `bodyParser: false`, we stream `req` to `put`.
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Manually parse query params in case req.query is incomplete
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filename = url.searchParams.get('filename') || req.query?.filename;

        if (!filename) {
            return res.status(400).json({ error: 'Filename is missing' });
        }

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            throw new Error('BLOB_READ_WRITE_TOKEN is not defined');
        }

        const blob = await put(filename, req, {
            access: 'public',
            token: token,
        });

        return res.status(200).json(blob);
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Upload failed', details: error.message });
    }
}
