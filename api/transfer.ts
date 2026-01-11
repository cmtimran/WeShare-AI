import { kv } from '@vercel/kv';
import Redis from 'ioredis';

// Helper to abstract DB differences
const getDb = () => {
    // Priority 1: Vercel KV (HTTP - Serverless native)
    if (process.env.KV_REST_API_URL) {
        return {
            get: (key: string) => kv.get(key),
            set: (key: string, value: any, seconds: number) => kv.set(key, value, { ex: seconds })
        };
    }

    // Priority 2: Generic Redis (TCP - Redis Labs, etc.)
    if (process.env.REDIS_URL) {
        const redis = new Redis(process.env.REDIS_URL);
        return {
            get: async (key: string) => {
                const val = await redis.get(key);
                return val ? JSON.parse(val) : null;
            },
            set: async (key: string, value: any, seconds: number) => {
                await redis.set(key, JSON.stringify(value), 'EX', seconds);
            }
        };
    }

    throw new Error("No database configured (Missing KV_REST_API_URL or REDIS_URL)");
};

export default async function handler(req, res) {
    const db = getDb();

    // GET: Fetch transfer
    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing ID' });

        try {
            const transfer = await db.get(`transfer:${id}`);
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
                const transfer = await db.get(`transfer:${id}`);
                if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

                // @ts-ignore
                if (transfer.security?.password === password) {
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
                // Default 7 days (604800s)
                await db.set(`transfer:${data.id}`, data, 604800);
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
