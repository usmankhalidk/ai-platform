interface CounterCardProps {
  label: string;
  value: number;
  // Optional: 'number' formats with commas; 'decimal' shows two decimal places
  format?: 'number' | 'decimal';
}

export function CounterCard({ label, value, format = 'number' }: CounterCardProps) {
  const display =
    format === 'decimal'
      ? value.toFixed(2)
      : value.toLocaleString();

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 min-w-[180px]">
      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-4xl font-bold text-gray-900 tabular-nums">{display}</span>
    </div>
  );
}
