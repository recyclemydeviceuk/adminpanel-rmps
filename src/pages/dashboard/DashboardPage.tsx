import { useNavigate } from 'react-router-dom';
import {
  Clock, Plus, Users, Tag, ArrowRight,
  CheckCircle, XCircle, RefreshCw, LayoutDashboard,
  ShoppingBag, Wrench,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import QuickStatsRow from './components/QuickStatsRow';
import RecentOrdersTable from './components/RecentOrdersTable';
import RevenueChart from './components/RevenueChart';
import TopRepairsChart from './components/TopRepairsChart';
import { getOrders } from '../../lib/orders';
import type { Order } from '../../types/order';

const STATUS_CONFIG: Record<string, { colors: string; dot: string; icon: React.ReactNode }> = {
  pending:    { colors: 'bg-amber-50  border-amber-200  text-amber-700',   dot: 'bg-amber-500',   icon: <Clock size={12} /> },
  paid:       { colors: 'bg-blue-50   border-blue-200   text-blue-700',    dot: 'bg-blue-500',    icon: <CheckCircle size={12} /> },
  processing: { colors: 'bg-purple-50 border-purple-200 text-purple-700',  dot: 'bg-purple-500',  icon: <RefreshCw size={12} /> },
  completed:  { colors: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500', icon: <CheckCircle size={12} /> },
  failed:     { colors: 'bg-red-50    border-red-200    text-red-700',     dot: 'bg-red-500',     icon: <XCircle size={12} /> },
  refunded:   { colors: 'bg-orange-50 border-orange-200 text-orange-700',  dot: 'bg-orange-500',  icon: <RefreshCw size={12} /> },
  cancelled:  { colors: 'bg-gray-50   border-gray-200   text-gray-600',    dot: 'bg-gray-400',    icon: <XCircle size={12} /> },
};

const statusBreakdown = [
  { key: 'pending',    label: 'Pending' },
  { key: 'paid',       label: 'Paid' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed',  label: 'Completed' },
  { key: 'failed',     label: 'Failed' },
  { key: 'cancelled',  label: 'Cancelled' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1117] via-[#1a1d2e] to-[#0f1117] px-7 py-6 shadow-xl">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute -bottom-8 left-20 h-36 w-36 rounded-full bg-blue-600/15 blur-2xl" />
        <div className="absolute top-0 left-1/2 h-24 w-24 rounded-full bg-purple-600/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-900/40">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-black text-white tracking-tight">Dashboard</h1>
              <p className="text-[13px] text-white/50 mt-0.5">RepairMyPhoneScreen Admin</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {[
              {
                icon: ShoppingBag,
                label: `${orders.length} Orders`,
                color: 'from-red-500/20 to-rose-500/10 border-red-500/20 text-red-400',
              },
              {
                icon: RefreshCw,
                label: `${(statusCounts['pending'] ?? 0) + (statusCounts['paid'] ?? 0) + (statusCounts['processing'] ?? 0)} Active`,
                color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-400',
              },
              {
                icon: CheckCircle,
                label: `${statusCounts['completed'] ?? 0} Done`,
                color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
              },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className={`flex items-center gap-2 rounded-xl border bg-gradient-to-r ${color} px-3 py-2`}>
                <Icon size={13} />
                <span className="text-[12px] font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────── */}
      <QuickStatsRow />

      {/* ── Order Status Breakdown ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-[0_1px_3px_0_rgba(0,0,0,.06)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#202124]">Order Status Breakdown</h2>
            <p className="text-[12px] text-[#9aa0a6] mt-0.5">Current distribution across all orders</p>
          </div>
          <button onClick={() => navigate('/orders')}
            className="flex items-center gap-1 rounded-xl border border-[#e8eaed] px-3 py-1.5 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
            View All <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {statusBreakdown.map(({ key, label }) => {
            const count = statusCounts[key] ?? 0;
            const cfg = STATUS_CONFIG[key];
            return (
              <button key={key} onClick={() => navigate('/orders')}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 transition-all duration-200 hover:scale-[1.04] hover:shadow-md ${cfg.colors}`}>
                <div className="flex items-center gap-1 opacity-80">
                  {cfg.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
                </div>
                <span className="text-[22px] font-black leading-none">{count}</span>
              </button>
            );
          })}
          <button onClick={() => navigate('/orders')}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 px-3 py-3.5 text-gray-600 transition-all duration-200 hover:scale-[1.04] hover:shadow-md">
            <div className="flex items-center gap-1 opacity-70">
              <ArrowRight size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wide">All</span>
            </div>
            <span className="text-[22px] font-black leading-none">{orders.length}</span>
          </button>
        </div>
      </div>

      {/* ── Charts Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#e8eaed] shadow-[0_1px_3px_0_rgba(0,0,0,.06)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-md shadow-red-200">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#202124]">Monthly Revenue</h2>
              <p className="text-[12px] text-[#9aa0a6]">Revenue trends — last 30 days</p>
            </div>
          </div>
          <RevenueChart />
        </div>
        <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-[0_1px_3px_0_rgba(0,0,0,.06)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-200">
              <Wrench size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#202124]">Top Repair Types</h2>
              <p className="text-[12px] text-[#9aa0a6]">By order volume</p>
            </div>
          </div>
          <TopRepairsChart />
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Plus, label: 'Add Pricing Rule', sub: 'Set price for a repair',
            path: '/models', gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-200',
            border: 'border-red-100', hover: 'hover:border-red-200',
          },
          {
            icon: Users, label: 'View Customers', sub: 'Browse all customer records',
            path: '/customers', gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200',
            border: 'border-blue-100', hover: 'hover:border-blue-200',
          },
          {
            icon: Tag, label: 'Manage Add-ons', sub: 'Configure repair add-ons',
            path: '/addons', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-purple-200',
            border: 'border-purple-100', hover: 'hover:border-purple-200',
          },
        ].map(action => {
          const Icon = action.icon;
          return (
            <button key={action.path} onClick={() => navigate(action.path)}
              className={`group flex items-center gap-4 rounded-2xl border ${action.border} ${action.hover} bg-white p-5 text-left hover:shadow-lg transition-all duration-200`}>
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#202124]">{action.label}</p>
                <p className="text-[12px] text-[#9aa0a6] mt-0.5">{action.sub}</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-[#d1d5db] group-hover:text-[#5f6368] group-hover:translate-x-0.5 transition-all duration-200" />
            </button>
          );
        })}
      </div>

      {/* ── Recent Orders ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-[0_1px_3px_0_rgba(0,0,0,.06)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#f3f4f6] flex items-center justify-between bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-md">
              <ShoppingBag size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#202124]">Recent Orders</h2>
              <p className="text-[12px] text-[#9aa0a6]">Latest orders across all customers</p>
            </div>
          </div>
          <button onClick={() => navigate('/orders')}
            className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[12px] font-bold text-red-600 hover:bg-red-100 transition-colors">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <RecentOrdersTable />
      </div>

    </div>
  );
}
