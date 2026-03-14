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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchCounters() {
    try {
      const res = await fetch('/api/counters');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as Counters;
      setCounters(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    }
  }

  useEffect(() => {
    fetchCounters();
    const id = setInterval(fetchCounters, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top navigation bar */}
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
              <span className="text-accent text-xs font-mono font-bold">AI</span>
            </div>
            <span className="font-sans text-sm font-semibold text-zinc-300 tracking-wide">
              Platform
            </span>
          </div>

          <LanguageSwitcher currentLocale={locale} />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            {/* Live pulse dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-[10px] font-mono font-medium text-accent tracking-[0.2em] uppercase">
              Live
            </span>
            {lastUpdated && (
              <span className="text-[10px] font-mono text-zinc-600 ms-1">
                · {lastUpdated.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-bold text-zinc-50 tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-zinc-500 mt-2 font-sans text-sm">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Two-column layout: counters + session panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Left column */}
          <div className="space-y-6">
            {/* Counter cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CounterCard
                label={t('counters.requests')}
                value={counters.requestsMade}
                icon="⬡"
                trend="up"
              />
              <CounterCard
                label={t('counters.tokens')}
                value={counters.tokensUsed}
                icon="◈"
                trend="up"
              />
              <CounterCard
                label={t('counters.connections')}
                value={counters.activeConnections}
                icon="⟡"
                trend="stable"
              />
            </div>

            {/* Status bar */}
            <div className="glass rounded-xl px-5 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500">
                <span>Polling every <span className="text-zinc-400">10s</span></span>
                <span className="text-zinc-700">·</span>
                <span>In-memory state</span>
              </div>
              {error ? (
                <span className="text-[11px] font-mono text-red-400">⚠ {error}</span>
              ) : (
                <span className="text-[11px] font-mono text-emerald-400">● Healthy</span>
              )}
            </div>
          </div>

          {/* Right column: session panel */}
          <div>
            <SessionPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
