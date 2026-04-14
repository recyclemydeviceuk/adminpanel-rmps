import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, SlidersHorizontal, X, ChevronRight, Clock, CheckCircle2, AlertCircle, RefreshCw, ShoppingBag, Lock } from 'lucide-react';
import DatePicker from '../../components/ui/DatePicker';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../lib/currency';
import type { Order, OrderStatus } from '../../types/order';

const PAGE_SIZE = 12;

const STATUS_OPTS: OrderStatus[] = ['pending','paid','processing','completed','failed','refunded','cancelled'];

const STATUS_STAT_CONFIG = [
  {
    key: 'pending',
    label: 'Pending',
    icon: Clock,
    gradient: 'from-amber-400 to-orange-400',
    softBg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-700',
    barColor: 'bg-amber-400',
    glow: 'shadow-amber-100',
  },
  {
    key: 'paid',
    label: 'Paid',
    icon: CheckCircle2,
    gradient: 'from-blue-500 to-indigo-500',
    softBg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-700',
    barColor: 'bg-blue-400',
    glow: 'shadow-blue-100',
  },
  {
    key: 'processing',
    label: 'Processing',
    icon: RefreshCw,
    gradient: 'from-violet-500 to-purple-500',
    softBg: 'bg-violet-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    textColor: 'text-violet-700',
    barColor: 'bg-violet-400',
    glow: 'shadow-violet-100',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    gradient: 'from-emerald-400 to-green-500',
    softBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-700',
    barColor: 'bg-emerald-400',
    glow: 'shadow-emerald-100',
  },
  {
    key: 'failed',
    label: 'Failed',
    icon: AlertCircle,
    gradient: 'from-red-400 to-rose-500',
    softBg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-700',
    barColor: 'bg-red-400',
    glow: 'shadow-red-100',
  },
  {
    key: 'refunded',
    label: 'Refunded',
    icon: RefreshCw,
    gradient: 'from-orange-400 to-amber-500',
    softBg: 'bg-orange-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    textColor: 'text-orange-700',
    barColor: 'bg-orange-400',
    glow: 'shadow-orange-100',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    icon: AlertCircle,
    gradient: 'from-gray-400 to-gray-500',
    softBg: 'bg-gray-50',
    border: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
    textColor: 'text-gray-600',
    barColor: 'bg-gray-400',
    glow: 'shadow-gray-100',
  },
];

const PAYMENT_COLORS: Record<string, string> = {
  paid:     'bg-green-50 text-green-700 border border-green-200',
  unpaid:   'bg-amber-50 text-amber-700 border border-amber-200',
  refunded: 'bg-gray-100 text-gray-600 border border-gray-200',
};

function avatarColor(name: string) {
  const colors = ['bg-red-500','bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function exportOrdersCSV(orders: Order[]) {
  const headers = ['Order #', 'Customer', 'Email', 'Phone', 'Device', 'Repair', 'Total', 'Status', 'Payment', 'Date'];
  const rows = orders.map(o => [
    o.orderNumber, o.customerName, o.customerEmail, o.customerPhone,
    o.device, o.repairType, `£${o.total.toFixed(2)}`, o.status,
    o.paymentStatus, new Date(o.createdAt).toLocaleDateString('en-GB'),
  ]);
  const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, loading, updateStatus } = useOrders();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const q = search.toLowerCase();
      const matchSearch = !q || o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.device.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q);
      const matchStatus = !statusFilter || o.status === statusFilter;
      const orderDate = new Date(o.createdAt);
      const matchFrom = !dateFrom || orderDate >= new Date(dateFrom);
      const matchTo   = !dateTo   || orderDate <= new Date(dateTo + 'T23:59:59');
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // Total value of ALL orders (bookings), regardless of payment status
  const totalOrderValue  = orders.reduce((s, o) => s + o.total, 0);
  // Revenue confirmed via PayPal webhook
  const confirmedRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const paidCount        = orders.filter(o => o.paymentStatus === 'paid').length;
  const activeFilters    = [search, statusFilter, dateFrom, dateTo].filter(Boolean).length;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    try {
      await updateStatus(id, e.target.value as OrderStatus);
      success('Status updated');
    } catch {
      toastError('Failed to update status.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-black text-[#202124] tracking-tight">Orders</h1>
          {/* Highlighted stats bar */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Total orders */}
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md">
              <ShoppingBag size={14} className="text-white/70" />
              <span className="text-[12px] font-semibold text-white/70">Orders</span>
              <span className="text-[18px] font-black text-white leading-none">{orders.length}</span>
            </div>
            {/* Total bookings value (all orders) */}
            <div className="flex flex-col rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-1.5 shadow-md shadow-purple-200">
              <span className="text-[10px] font-semibold text-white/70 leading-none">Total Value</span>
              <span className="text-[16px] font-black text-white leading-tight">{formatCurrency(totalOrderValue)}</span>
            </div>
            {/* Confirmed revenue (PayPal paid) */}
            <div className="flex flex-col rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-1.5 shadow-md shadow-green-200">
              <span className="text-[10px] font-semibold text-white/70 leading-none">Confirmed</span>
              <span className="text-[16px] font-black text-white leading-tight">{formatCurrency(confirmedRevenue)}</span>
            </div>
            {/* Paid orders count */}
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 shadow-md shadow-blue-200">
              <Lock size={12} className="text-white/70" />
              <span className="text-[12px] font-semibold text-white/80">PayPal Paid</span>
              <span className="text-[18px] font-black text-white leading-none">{paidCount}</span>
            </div>
          </div>
        </div>
        <Button variant="secondary" size="md" leftIcon={<Download size={15} />}
          onClick={() => { exportOrdersCSV(filtered); success('Exported', `${filtered.length} orders.`); }}>
          Export CSV
        </Button>
      </div>

      {/* Status metric cards — all 7 statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
        {STATUS_STAT_CONFIG.map(s => {
          const count = orders.filter(o => o.status === s.key).length;
          const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
          const isActive = statusFilter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => { setStatusFilter(isActive ? '' : s.key as OrderStatus); setPage(1); }}
              className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                isActive
                  ? `${s.softBg} ${s.border} shadow-lg ${s.glow}`
                  : 'bg-white border-[#e8eaed] hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {/* Gradient top stripe */}
              <div className={`h-1 w-full bg-gradient-to-r ${s.gradient}`} />

              {/* Decorative circle background */}
              <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.07]`} />

              <div className="p-5">
                {/* Icon + label row */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-sm`}>
                    <s.icon size={18} className="text-white" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    isActive ? `${s.iconBg} ${s.textColor}` : 'bg-gray-100 text-[#9aa0a6]'
                  }`}>
                    {pct}%
                  </span>
                </div>

                {/* Count */}
                <p className="text-[32px] font-black text-[#202124] leading-none tracking-tight">{count}</p>
                <p className={`text-[12px] font-semibold mt-1 ${isActive ? s.textColor : 'text-[#5f6368]'}`}>{s.label}</p>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${s.gradient} transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-[#9aa0a6]">{count} of {orders.length} orders</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order, customer, device..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] text-[#202124] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
            showFilters || activeFilters > 0 ? 'border-red-300 bg-red-50 text-red-700' : 'border-[#e8eaed] bg-white text-[#5f6368] hover:bg-gray-50'
          }`}>
          <SlidersHorizontal size={14} />
          Filters {activeFilters > 0 && <span className="ml-0.5 rounded-full bg-red-600 px-1.5 py-px text-[10px] font-bold text-white">{activeFilters}</span>}
        </button>
        {activeFilters > 0 && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
            className="flex items-center gap-1 rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[12px] text-[#5f6368] hover:bg-gray-50">
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-[12px] text-[#9aa0a6]">
          {filtered.length !== orders.length ? `${filtered.length} of ${orders.length}` : `${orders.length} orders`}
        </span>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm">
          {/* Filter header */}
          <div className="flex items-center justify-between border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-[#5f6368]" />
              <span className="text-[12px] font-bold text-[#202124] uppercase tracking-wide">Filter Orders</span>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors">
                <X size={11} /> Clear filters
              </button>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* Status pills */}
            <div>
              <p className="text-[11px] font-bold text-[#9aa0a6] uppercase tracking-wide mb-3">Order Status</p>
              <div className="flex flex-wrap gap-2">
                {[{ value: '', label: 'All', icon: null }, ...STATUS_OPTS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1), icon: null }))].map(opt => {
                  const isSelected = statusFilter === opt.value;
                  const cfg = STATUS_STAT_CONFIG.find(c => c.key === opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => { setStatusFilter(opt.value as OrderStatus | ''); setPage(1); }}
                      className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all duration-150 ${
                        isSelected
                          ? cfg
                            ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-md`
                            : 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-md'
                          : 'bg-gray-50 text-[#5f6368] border border-[#e8eaed] hover:bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      {cfg && isSelected && <cfg.icon size={12} className="text-white/80" />}
                      {opt.label}
                      {opt.value && (
                        <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-[#9aa0a6]'
                        }`}>
                          {orders.filter(o => o.status === opt.value).length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range */}
            <div>
              <p className="text-[11px] font-bold text-[#9aa0a6] uppercase tracking-wide mb-3">Date Range</p>
              <div className="flex flex-wrap items-center gap-3">
                <DatePicker
                  value={dateFrom}
                  onChange={v => { setDateFrom(v); setPage(1); }}
                  label="From"
                  placeholder="Start date"
                />
                <div className="flex items-center gap-1 text-[#d1d5db]">
                  <div className="h-px w-5 bg-[#e8eaed]" />
                  <ChevronRight size={12} />
                  <div className="h-px w-5 bg-[#e8eaed]" />
                </div>
                <DatePicker
                  value={dateTo}
                  onChange={v => { setDateTo(v); setPage(1); }}
                  label="To"
                  placeholder="End date"
                />
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
                    className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors">
                    <X size={12} /> Clear dates
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50"><ShoppingBag size={24} className="text-[#d1d5db]" /></div>
            <p className="text-[14px] font-semibold text-[#5f6368]">No orders found</p>
            <p className="text-[12px] text-[#9aa0a6]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2fr_2.5fr_2fr_1fr_1.2fr_1fr_1.2fr_36px] gap-3 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-2.5">
              {['Order', 'Customer', 'Device / Repair', 'Total', 'Status'].map(h => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">{h}</span>
              ))}
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">
                Payment <Lock size={9} className="opacity-60" />
              </span>
              {['Date', ''].map(h => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#f8fafc]">
              {paginated.map(row => (
                <div key={row.id}
                  onClick={() => navigate(`/orders/${row.id}`)}
                  className="grid grid-cols-[2fr_2.5fr_2fr_1fr_1.2fr_1fr_1.2fr_36px] gap-3 items-center px-5 py-3.5 hover:bg-[#fafbfc] cursor-pointer transition-colors group">

                  {/* Order # */}
                  <div>
                    <span className="font-mono text-[11px] font-bold text-[#5f6368] bg-gray-100 px-1.5 py-0.5 rounded">{row.orderNumber}</span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold ${avatarColor(row.customerName)}`}>
                      {row.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#202124] truncate">{row.customerName}</p>
                      <p className="text-[11px] text-[#9aa0a6] truncate">{row.customerEmail}</p>
                    </div>
                  </div>

                  {/* Device */}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#202124] truncate">{row.device}</p>
                    <p className="text-[11px] text-[#9aa0a6] truncate">{row.repairType}</p>
                  </div>

                  {/* Total */}
                  <span className="text-[13px] font-bold text-[#202124]">{formatCurrency(row.total)}</span>

                  {/* Status */}
                  <div onClick={e => e.stopPropagation()}>
                    <select value={row.status} onChange={e => handleStatusChange(e, row.id)}
                      className="w-full rounded-lg border border-[#e8eaed] bg-white px-2 py-1.5 text-[11px] font-medium text-[#5f6368] focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer">
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>

                  {/* Payment — read-only, system-managed */}
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${PAYMENT_COLORS[row.paymentStatus] ?? PAYMENT_COLORS.unpaid}`}>
                    <Lock size={9} className="opacity-50" />
                    {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
                  </span>

                  {/* Date */}
                  <span className="text-[11px] text-[#9aa0a6]">{new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>

                  {/* Arrow */}
                  <ChevronRight size={14} className="text-[#d1d5db] group-hover:text-red-400 transition-colors" />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="border-t border-[#f3f4f6] px-5 py-4">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
