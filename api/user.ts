import { getDb } from './_db.js';

export default async function handler(req, res) {
    const db = getDb();

    // GET: Fetch User Profile
    if (req.method === 'GET') {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: 'Missing UID' });

        try {
            const user = await db.get(`user:${uid}`);
            if (!user) return res.status(404).json({ error: 'User not found' });

            // Sanitize (remove password)
            // @ts-ignore
            const { password, ...safeUser } = user;
            return res.status(200).json(safeUser);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // POST: Register or Login
    if (req.method === 'POST') {
        const { action } = req.query; // 'login' or 'register'
        const { email, password, uid } = req.body;

        if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

        try {
            if (action === 'register') {
                // Check if exists? (Requires scanning or secondary index 'user:email:{email}')
                // For simplicity/speed in KV: We'll rely on client-side generated UID or check email index.
                // Let's create a email mapping: `email:{email}` -> `{uid}`

                const existingUid = await db.get(`email:${email}`);
                if (existingUid) {
                    return res.status(409).json({ error: 'User already exists' });
                }

                const newUid = uid || Date.now().toString();
                const newUser = {
                    uid: newUid,
                    email,
                    password, // In real prod, this MUST be hashed (bcrypt). Storing plaintext for demo/MVP only.
                    plan: 'free',
                    joinedAt: Date.now()
                };

                await db.set(`user:${newUid}`, newUser);
                await db.set(`email:${email}`, newUid);

                const { password: _, ...safeUser } = newUser;
                return res.status(201).json(safeUser);
            }

            if (action === 'login') {
                const userUid = await db.get(`email:${email}`);
                if (!userUid) return res.status(404).json({ error: 'User not found' });

                const user: any = await db.get(`user:${userUid}`);

                if (user && user.password === password) {
                    const { password: _, ...safeUser } = user;
                    return res.status(200).json(safeUser);
                } else {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Auth failed' });
        }
    }

    // PUT: Update Profile (e.g. Upgrade)
    if (req.method === 'PUT') {
        const { uid, plan } = req.body;
        if (!uid) return res.status(400).json({ error: 'Missing UID' });

        try {
            const user: any = await db.get(`user:${uid}`);
            if (!user) return res.status(404).json({ error: 'User not found' });

            const updatedUser = { ...user, plan: plan || user.plan };
            await db.set(`user:${uid}`, updatedUser);

            const { password: _, ...safeUser } = updatedUser;
            return res.status(200).json(safeUser);
        } catch (error) {
            return res.status(500).json({ error: 'Update failed' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
