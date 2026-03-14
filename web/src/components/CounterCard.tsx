interface CounterCardProps {
  label: string;
  value: number;
  icon: string;       // emoji / unicode icon
  trend?: 'up' | 'stable';
}

export function CounterCard({ label, value, icon, trend = 'up' }: CounterCardProps) {
  return (
    <div className="group relative flex-1 min-w-[200px] glass rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_32px_rgba(34,211,238,0.06)]">
      {/* Thin cyan gradient line across the top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      {/* Hover radial glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(34,211,238,0.04) 0%, transparent 60%)' }}
      />

      {/* Icon + trend */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xl leading-none">{icon}</span>
        {trend === 'up' && (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
            ↑ LIVE
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-3">
        {label}
      </p>

      {/* Value */}
      <p className="font-mono text-[2.25rem] font-medium tabular-nums leading-none text-zinc-50 tracking-tight">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
