import { buffer } from 'micro';
import Stripe from 'stripe';
import { getDb } from './_db.js';

// Disable body parsing for webhook verification
export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const db = getDb();
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const uid = session.metadata?.uid;

        if (uid) {
            console.log(`Payment successful for user ${uid}. Upgrading to PRO...`);

            try {
                // 1. Get User
                const user: any = await db.get(`user:${uid}`);
                if (user) {
                    // 2. Update Plan
                    user.plan = 'pro';
                    // 3. Save
                    await db.set(`user:${uid}`, user);
                }
            } catch (e) {
                console.error("Failed to upgrade user in DB", e);
                return res.status(500).json({ error: 'DB Update Failed' });
            }
        }
    }

    res.status(200).json({ received: true });
}
