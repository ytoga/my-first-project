import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel?: string;
  invertChange?: boolean; // true = decrease is good (e.g., cancellations)
  icon: React.ReactNode;
  accentColor: string;
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  invertChange = false,
  icon,
  accentColor,
}: KpiCardProps) {
  const isPositive = invertChange ? change < 0 : change > 0;
  const isNeutral = Math.abs(change) < 0.5;

  const changeColor = isNeutral
    ? 'text-slate-500 bg-slate-50'
    : isPositive
      ? 'text-emerald-700 bg-emerald-50'
      : 'text-rose-700 bg-rose-50';

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  const displayChange = changeLabel
    ? changeLabel
    : `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: accentColor + '15', color: accentColor }}
        >
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${changeColor}`}
        >
          <TrendIcon className="w-3 h-3" />
          {displayChange}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}
