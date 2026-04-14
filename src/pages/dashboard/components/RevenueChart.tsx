import { useState, useEffect } from 'react';
import { getAnalyticsData } from '../../../lib/analytics';
import { formatCompact } from '../../../lib/currency';
import type { TimeSeriesDataPoint } from '../../../types/analytics';

export default function RevenueChart() {
  const [data, setData] = useState<TimeSeriesDataPoint[]>([]);

  useEffect(() => {
    getAnalyticsData()
      .then(d => setData(d.revenueOverTime ?? []))
      .catch(() => setData([]));
  }, []);

  if (data.length === 0) {
    return <p className="text-[13px] text-[#9aa0a6] py-8 text-center">No revenue data yet</p>;
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      {/* Summary row */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-[22px] font-black text-[#202124] leading-none">£{formatCompact(total)}</p>
          <p className="text-[11px] text-[#9aa0a6] mt-0.5">Last 30 days</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold text-emerald-700">Peak: {formatCompact(maxVal)}</span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end justify-between gap-1.5" style={{ height: '140px' }}>
        {data.map((point) => {
          const heightPct = (point.value / maxVal) * 100;
          return (
            <div key={point.date} className="flex flex-col items-center gap-1 flex-1 group cursor-pointer" style={{ height: '140px' }}>
              <div className="relative w-full flex flex-col justify-end flex-1">
                <div
                  className="relative w-full rounded-t-lg overflow-hidden transition-all duration-300 group-hover:scale-x-105 group-hover:shadow-lg group-hover:shadow-red-200"
                  style={{ height: `${Math.max(heightPct, 5)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500 to-red-300 group-hover:from-red-600 group-hover:to-rose-400 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-[#202124] text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-xl pointer-events-none">
                    £{formatCompact(point.value)}
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-[#9aa0a6] font-medium group-hover:text-[#5f6368] transition-colors">{point.label ?? point.date?.slice(5)}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}
