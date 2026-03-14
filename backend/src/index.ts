import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import stripeRouter from './routes/stripe';

const app = express();
const PORT = process.env.PORT ?? 4000;

// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from the frontend dev server
app.use(cors({ origin: 'http://localhost:3000' }));

// Stripe-related routes are mounted under /api
app.use('/api', stripeRouter);

// Simple liveness probe used by Docker healthcheck
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
