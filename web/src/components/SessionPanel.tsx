'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface SessionState {
  active: boolean;
  startTime: number | null;
  elapsed: number; // seconds
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

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session.active, session.startTime]);

  function handleStart() {
    setSession({
      active: true,
      startTime: Date.now(),
      elapsed: 0,
      paymentIntentId: null,
      error: null,
      processing: false,
    });
  }

  async function handleEnd() {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const elapsed = session.elapsed;
    // Convert to cents: $0.02/s = 2 cents/s. Minimum 50 cents (Stripe requirement).
    const amountCents = Math.max(50, Math.ceil(elapsed * 2));

    setSession((prev) => ({ ...prev, active: false, processing: true }));

    try {
      const res = await fetch(`${apiUrl}/api/stripe/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountCents }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as { payment_intent_id: string };
      setSession((prev) => ({
        ...prev,
        processing: false,
        paymentIntentId: data.payment_intent_id,
      }));
    } catch (err) {
      setSession((prev) => ({
        ...prev,
        processing: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }

  const cost = (session.elapsed * RATE_PER_SECOND).toFixed(2);
  const minutes = Math.floor(session.elapsed / 60);
  const seconds = Math.floor(session.elapsed % 60);
  const durationDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Session</h2>

      {/* Idle state */}
      {!session.active && !session.processing && !session.paymentIntentId && !session.error && (
        <p className="text-gray-400 text-sm">{t('idle')}</p>
      )}

      {/* Active session: timer and cost */}
      {session.active && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('duration')}</span>
            <span className="font-mono font-bold text-gray-900">{durationDisplay}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('cost')}</span>
            <span className="font-mono font-bold text-green-600">${cost}</span>
          </div>
        </div>
      )}

      {/* Processing */}
      {session.processing && (
        <p className="text-blue-500 text-sm animate-pulse">{t('processing')}</p>
      )}

      {/* Success: show payment intent ID */}
      {session.paymentIntentId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium text-green-700">{t('paymentId')}</p>
          <p className="text-xs font-mono text-green-900 break-all">{session.paymentIntentId}</p>
          <p className="text-xs text-green-600">Total: ${cost}</p>
        </div>
      )}

      {/* Error */}
      {session.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700">{session.error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        {!session.active ? (
          <button
            onClick={handleStart}
            disabled={session.processing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('start')}
          </button>
        ) : (
          <button
            onClick={handleEnd}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('end')}
          </button>
        )}
      </div>
    </div>
  );
}
