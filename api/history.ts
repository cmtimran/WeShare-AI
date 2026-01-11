import { getDb } from './_db.js';

export default async function handler(req, res) {
    const db = getDb();

    // GET: Fetch History
    if (req.method === 'GET') {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: 'Missing UID' });

        try {
            // Get last 500 items
            const history = await db.lrange(`user:${uid}:transfers`, 0, 499);
            // history is already parsed JSON objects if using our helper
            return res.status(200).json(history || []);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // POST: Add to History
    if (req.method === 'POST') {
        const { uid, transfer } = req.body;

        if (!uid || !transfer) return res.status(400).json({ error: 'Missing parameters' });

        try {
            const item = {
                id: transfer.id,
                name: transfer.name || 'Untitled Transfer',
                size: transfer.totalSize,
                createdAt: Date.now(),
                url: window?.location?.origin ? `${window.location.origin}/#/transfer/${transfer.id}` : transfer.url,
                // Better to store just ID and reconstruct URL, or store what we have.
                // Let's store minimal metadata.
            };

            // If transfer object is complex, we just pick what we need for the table
            const historyItem = {
                id: transfer.id,
                name: transfer.files?.[0]?.name || 'Files', // Use first file name or "Batch"
                fileCount: transfer.files?.length || 1,
                totalSize: transfer.totalSize || 0,
                date: Date.now(),
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days approx
            };

            await db.lpush(`user:${uid}:transfers`, historyItem);
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to save history' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
