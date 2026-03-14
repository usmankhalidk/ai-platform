'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface SessionState {
  active: boolean;
  startTime: number | null;
  elapsed: number;          // seconds
  finalCost: string | null; // dollar string of the actual charged amount (respects Stripe minimum)
  paymentIntentId: string | null;
  error: string | null;
  processing: boolean;
}

const RATE_PER_SECOND = 0.02; // $0.02 per second

export function SessionPanel() {
  const t = useTranslations('session');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  const [session, setSession] = useState<SessionState>({
    active: false,
    startTime: null,
    elapsed: 0,
    finalCost: null,
    paymentIntentId: null,
    error: null,
    processing: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick every second while session is active
  useEffect(() => {
    if (session.active && session.startTime) {
      intervalRef.current = setInterval(() => {
        setSession((prev) => ({
          ...prev,
          elapsed: (Date.now() - (prev.startTime ?? Date.now())) / 1000,
        }));
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [session.active, session.startTime]);

  function handleStart() {
    setSession({ active: true, startTime: Date.now(), elapsed: 0, finalCost: null, paymentIntentId: null, error: null, processing: false });
  }

  async function handleEnd() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const elapsed = session.elapsed;
    // Convert to cents: $0.02/s = 2 cents/s. Minimum 50 cents (Stripe requirement).
    const amountCents = Math.max(50, Math.ceil(elapsed * 2));
    // Store the actual dollar amount that will be charged (respects Stripe minimum).
    // This may differ from elapsed * 0.02 for very short sessions.
    const chargedDollars = (amountCents / 100).toFixed(2);
    setSession((prev) => ({ ...prev, active: false, processing: true }));

    try {
      const res = await fetch(`${apiUrl}/api/stripe/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountCents }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { payment_intent_id: string };
      setSession((prev) => ({ ...prev, processing: false, paymentIntentId: data.payment_intent_id, finalCost: chargedDollars }));
    } catch (err) {
      setSession((prev) => ({ ...prev, processing: false, error: err instanceof Error ? err.message : 'Unknown error' }));
    }
  }

  const cost = (session.elapsed * RATE_PER_SECOND).toFixed(2);
  const minutes = Math.floor(session.elapsed / 60);
  const seconds = Math.floor(session.elapsed % 60);
  const durationDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${session.active ? 'glass-accent' : 'glass'}`}>
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-sans font-semibold uppercase tracking-[0.18em] text-zinc-400">
            {t('title')}
          </h2>
          {session.active && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
          )}
        </div>

        {/* Idle state */}
        {!session.active && !session.processing && !session.paymentIntentId && !session.error && (
          <p className="text-sm text-zinc-600 font-mono">{t('idle')}</p>
        )}

        {/* Active session: big timer + cost */}
        {session.active && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-zinc-600 mb-1">
                {t('duration')}
              </p>
              <p className="font-mono text-5xl font-medium text-zinc-50 tabular-nums tracking-tight">
                {durationDisplay}
              </p>
            </div>
            <div className="separator pt-3">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-zinc-600 mb-1">
                {t('cost')}
              </p>
              <p className="font-mono text-3xl font-medium text-emerald-400 tabular-nums">
                ${cost}
              </p>
            </div>
          </div>
        )}

        {/* Processing */}
        {session.processing && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <p className="text-sm font-mono text-zinc-400">{t('processing')}</p>
          </div>
        )}

        {/* Success */}
        {session.paymentIntentId && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm">✓</span>
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-emerald-400">
                {t('paymentId')}
              </p>
            </div>
            <p className="font-mono text-xs text-zinc-300 break-all leading-relaxed">
              {session.paymentIntentId}
            </p>
            <p className="font-mono text-xs text-zinc-500">
              {t('total')}: <span className="text-emerald-400">${session.finalCost ?? cost}</span>
            </p>
          </div>
        )}

        {/* Error */}
        {session.error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3">
            <p className="font-mono text-xs text-red-400">{session.error}</p>
          </div>
        )}

        {/* Action button */}
        {!session.active ? (
          <button
            onClick={handleStart}
            disabled={session.processing}
            className="w-full py-3 px-4 rounded-xl font-sans text-sm font-semibold transition-all duration-200
              bg-accent text-zinc-950 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:scale-[1.02]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
              active:scale-[0.98]"
          >
            {t('start')}
          </button>
        ) : (
          <button
            onClick={handleEnd}
            className="w-full py-3 px-4 rounded-xl font-sans text-sm font-semibold transition-all duration-200
              border border-red-400/40 text-red-400 hover:bg-red-400/10 hover:border-red-400/60
              active:scale-[0.98]"
          >
            {t('end')}
          </button>
        )}
      </div>
    </div>
  );
}
