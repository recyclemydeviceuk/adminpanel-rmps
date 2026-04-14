import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title:       string;
  value:       string | number;
  icon:        LucideIcon;
  iconBg?:     string;
  iconColor?:  string;
  gradient?:   string;
  trend?:      number;
  trendLabel?: string;
  prefix?:     string;
  suffix?:     string;
  className?:  string;
  prevLabel?:  string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg    = 'bg-white/20',
  iconColor = 'text-white',
  gradient  = 'from-red-500 to-rose-600',
  trend,
  trendLabel = 'vs prev. period',
  prefix = '',
  suffix = '',
  className = '',
  prevLabel,
}: StatCardProps) {
  const trendUp   = trend !== undefined && trend > 0;
  const trendDown = trend !== undefined && trend < 0;
  const trendFlat = trend !== undefined && trend === 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg ${className}`}>
      {/* decorative circle */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} backdrop-blur-sm`}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm
            ${trendUp   ? 'bg-white/25 text-white' : ''}
            ${trendDown ? 'bg-black/15 text-white/80' : ''}
            ${trendFlat ? 'bg-white/15 text-white/70' : ''}
          `}>
            {trendUp   && <TrendingUp  size={11} />}
            {trendDown && <TrendingDown size={11} />}
            {trendFlat && <Minus        size={11} />}
            {trendUp ? '+' : ''}{Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-[30px] font-black text-white leading-none tracking-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="mt-1.5 text-[13px] font-medium text-white/80">{title}</p>
      </div>

      {(prevLabel || trendLabel) && trend !== undefined && (
        <p className="relative mt-3 text-[11px] text-white/60">
          {trendUp ? '↑' : trendDown ? '↓' : '→'} {Math.abs(trend).toFixed(1)}% {trendLabel}
          {prevLabel && <span className="ml-1 text-white/50">· Prev: {prevLabel}</span>}
        </p>
      )}
    </div>
  );
}
