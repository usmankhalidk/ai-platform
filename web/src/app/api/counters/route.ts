import { NextResponse } from 'next/server';

// In-memory counters — intentionally ephemeral for this demo.
// A production system would use a shared store (Redis, PostgreSQL).
let requestsMade = 1000;
let tokensUsed = 50000;
let activeConnections = 12;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function GET() {
  // Increment counters with slight randomization on each poll
  requestsMade += randInt(1, 5);
  tokensUsed += randInt(50, 200);
  // Connections fluctuate: ±1, clamped to [0, 50]
  activeConnections = Math.min(50, Math.max(0, activeConnections + randInt(-1, 1)));

  return NextResponse.json({ requestsMade, tokensUsed, activeConnections });
}
