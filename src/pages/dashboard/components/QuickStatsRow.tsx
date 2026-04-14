import { useState, useEffect } from 'react';
import { ShoppingBag, PoundSterling, Users, TrendingUp } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import { getAnalyticsData } from '../../../lib/analytics';
import type { AnalyticsSummary } from '../../../types/analytics';

export default function QuickStatsRow() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData()
      .then(d => setSummary(d.summary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Format a monetary number for display
  const fmt = (n: number) => n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Orders"
        value={loading ? '—' : (summary?.totalOrders ?? 0)}
        icon={ShoppingBag}
        gradient="from-red-500 to-rose-600"
        iconBg="bg-white/20"
        iconColor="text-white"
      />
      <StatCard
        title="Total Revenue"
        value={loading ? '—' : fmt(summary?.totalRevenue ?? 0)}
        icon={PoundSterling}
        gradient="from-emerald-500 to-teal-600"
        iconBg="bg-white/20"
        iconColor="text-white"
        prefix={loading ? '' : '£'}
      />
      <StatCard
        title="Active Customers"
        value={loading ? '—' : (summary?.totalCustomers ?? 0)}
        icon={Users}
        gradient="from-blue-500 to-indigo-600"
        iconBg="bg-white/20"
        iconColor="text-white"
      />
      <StatCard
        title="Avg Order Value"
        value={loading ? '—' : fmt(summary?.avgOrderValue ?? 0)}
        icon={TrendingUp}
        gradient="from-violet-500 to-purple-600"
        iconBg="bg-white/20"
        iconColor="text-white"
        prefix={loading ? '' : '£'}
      />
    </div>
  );
}
