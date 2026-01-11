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
        const { filename } = req.query;

        // Upload to Vercel Blob
        // We pass the request object directly if we want streaming, but "put" usually takes content.
        // If bodyParser is false, req is a stream.

        // NOTE: For simplicity in this Node function, let's trust "put" to handle the stream
        // or we read the buffer. 

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            throw new Error('BLOB_READ_WRITE_TOKEN is not defined');
        }

        const blob = await put(filename, req, {
            access: 'public',
            // Ensure we use the correct token from env
        });

        return res.status(200).json(blob);
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Upload failed', details: error.message });
    }
}
