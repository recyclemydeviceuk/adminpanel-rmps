import { useState, useEffect } from 'react';
import { getAnalyticsData } from '../../../lib/analytics';
import type { ChartDataPoint } from '../../../types/analytics';

const SIZE = 160;
const STROKE = 22;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const CX = SIZE / 2;
const CY = SIZE / 2;

const COLORS = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function TopRepairsChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    getAnalyticsData()
      .then(d => setData(d.repairTypes ?? []))
      .catch(() => setData([]));
  }, []);

  if (data.length === 0) {
    return <p className="text-[13px] text-[#9aa0a6] py-8 text-center">No repair data yet</p>;
  }

  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let cumPct = 0;
  const segments = data.map((item, i) => {
    const pct = item.value / total;
    const offset = CIRC * (1 - cumPct);
    const dash = CIRC * pct;
    cumPct += pct;
    return { ...item, color: item.color ?? COLORS[i % COLORS.length], pct, dash, offset };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="drop-shadow-sm" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${seg.dash} ${CIRC - seg.dash}`}
                strokeDashoffset={-CIRC + seg.offset}
                strokeLinecap="butt"
                className="transition-all duration-700"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[20px] font-black text-[#202124] leading-none">{total.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-[#9aa0a6] mt-0.5 uppercase tracking-wide">Repairs</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5 min-w-0">
          {segments.map((seg) => {
            const pct = Math.round(seg.pct * 100);
            return (
              <div key={seg.label} className="flex items-center gap-2 group">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full shadow-sm" style={{ backgroundColor: seg.color }} />
                <span className="text-[11px] font-medium text-[#5f6368] truncate flex-1 group-hover:text-[#202124] transition-colors">
                  {seg.label}
                </span>
                <span className="text-[11px] font-black text-[#202124] flex-shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex h-2 w-full rounded-full overflow-hidden gap-px">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="h-full transition-all duration-700"
            style={{ width: `${seg.pct * 100}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-[#9aa0a6]">
        <span>Repair distribution</span>
        <span className="font-bold text-[#5f6368]">{total.toLocaleString()} total</span>
      </div>
    </div>
  );
}
