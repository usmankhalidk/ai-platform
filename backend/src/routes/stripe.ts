import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();

// Stripe client is initialized once per process using the secret key from env.
// The apiVersion is pinned to avoid unexpected breaking changes from Stripe upgrades.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// POST /api/stripe/create-intent
// Body: { amount: number }  — amount in cents (e.g. 1099 = $10.99)
// Returns: { payment_intent_id: string }
router.post('/stripe/create-intent', async (req: Request, res: Response) => {
  const { amount } = req.body as { amount: unknown };

  // Validate that amount is present and numeric before hitting the Stripe API
  if (amount === undefined || amount === null || typeof amount !== 'number') {
    res.status(400).json({ error: 'amount is required and must be a number' });
    return;
  }

  try {
    // Stripe requires a minimum charge of 50 cents (USD)
    const safeAmount = Math.max(50, amount);

    const intent = await stripe.paymentIntents.create({
      amount: safeAmount,
      currency: 'usd',
    });

    res.json({ payment_intent_id: intent.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
