import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // GET: Fetch transfer
    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing ID' });

        try {
            const transfer = await kv.get(`transfer:${id}`);
            if (transfer) {
                return res.status(200).json(transfer);
            } else {
                return res.status(404).json({ error: 'Transfer not found' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // POST: Create or Verify
    if (req.method === 'POST') {
        const { action } = req.query;
        const data = req.body;

        // Verify Password Action
        if (action === 'verify') {
            const { id, password } = data;
            if (!id || !password) return res.status(400).json({ error: 'Missing parameters' });

            try {
                const transfer = await kv.get(`transfer:${id}`);
                if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

                // @ts-ignore
                if (transfer.security?.password === password) { // Simple plaintext check for now
                    // Return full data including files (in real app, we might mask files until verify)
                    // But current architecture saves everything in KV.
                    return res.status(200).json(transfer);
                } else {
                    return res.status(403).json({ error: 'Incorrect password' });
                }
            } catch (error) {
                return res.status(500).json({ error: 'Verification failed' });
            }
        }

        // Create New Transfer
        if (data.id) {
            try {
                // Set with expiration (Example: 7 days = 604800s)
                // Default 7 days, or parse from settings
                await kv.set(`transfer:${data.id}`, data, { ex: 604800 });
                return res.status(200).json({ success: true, id: data.id });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Failed to save transfer' });
            }
        }

        return res.status(400).json({ error: 'Invalid Request' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
