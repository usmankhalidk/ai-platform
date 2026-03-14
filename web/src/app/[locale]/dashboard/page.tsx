'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CounterCard } from '@/components/CounterCard';
import { SessionPanel } from '@/components/SessionPanel';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useParams } from 'next/navigation';

interface Counters {
  requestsMade: number;
  tokensUsed: number;
  activeConnections: number;
}

export default function DashboardPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  const [counters, setCounters] = useState<Counters>({
    requestsMade: 0,
    tokensUsed: 0,
    activeConnections: 0,
  });
  const [error, setError] = useState<string | null>(null);

  async function fetchCounters() {
    try {
      const res = await fetch('/api/counters');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as Counters;
      setCounters(data);
      setError(null);
    } catch (err) {
      // Keep last known values, show subtle error
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    }
  }

  useEffect(() => {
    // Fetch immediately on mount, then every 10 seconds
    fetchCounters();
    const id = setInterval(fetchCounters, 10_000);
    return () => clearInterval(id); // Cleanup on unmount
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* Live counters */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-4">
          <CounterCard label={t('counters.requests')} value={counters.requestsMade} />
          <CounterCard label={t('counters.tokens')} value={counters.tokensUsed} />
          <CounterCard label={t('counters.connections')} value={counters.activeConnections} />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-2">Could not refresh: {error}</p>
        )}
      </section>

      {/* Session / Stripe panel */}
      <section className="max-w-sm">
        <SessionPanel />
      </section>
    </main>
  );
}
