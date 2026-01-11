import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia', // Use latest stable
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { uid, email } = req.body;

    if (!uid || !email) {
        return res.status(400).json({ error: 'Missing user details' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Stripe not configured (Missing STRIPE_SECRET_KEY)' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'WeShare AI - Pro Plan',
                            description: '1TB Storage, Permanent Links, 4K Video',
                        },
                        unit_amount: 999, // $9.99
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // or 'subscription' if using recurring
            success_url: `${req.headers.origin}/#/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/#/?canceled=true`,
            customer_email: email,
            metadata: {
                uid: uid // Important: Pass UID to webhook to identify user
            }
        });

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating checkout session', details: err.message });
    }
}
