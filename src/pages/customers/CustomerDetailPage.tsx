import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, ShoppingBag, PoundSterling, Calendar, ArrowLeft, TrendingUp, Clock } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useCustomer } from '../../hooks/useCustomers';
import CustomerOrderHistory from './components/CustomerOrderHistory';
import { formatCurrency } from '../../lib/currency';
import { formatDate } from '../../lib/dates';

function avatarColor(name: string) {
  const colors = ['bg-red-500','bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const STATUS_CONFIG = {
  active:   { label: 'Active',   dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 border-green-200' },
  inactive: { label: 'Inactive', dot: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-600 border-gray-200' },
  banned:   { label: 'Banned',   dot: 'bg-red-500',   badge: 'bg-red-100 text-red-700 border-red-200' },
};

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { customer, loading, error } = useCustomer(customerId ?? '');

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="font-semibold text-[#202124]">Customer not found</p>
        <p className="text-[13px] text-[#5f6368]">{error ?? 'The requested customer does not exist.'}</p>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[customer.status] ?? STATUS_CONFIG.inactive;
  const avgOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;

  return (
    <div className="space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/customers')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Customers
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[12px] font-semibold text-[#202124]">{customer.name}</span>
      </div>

      {/* Hero header card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e8eaed] bg-white shadow-sm">
        {/* Gradient top stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-400 to-red-600" />
        {/* Decorative bg blob */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-red-500 to-orange-400 opacity-[0.05]" />

        <div className="flex items-center justify-between gap-6 px-6 py-5 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Big avatar */}
            <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-white text-[22px] font-black shadow-lg ${avatarColor(customer.name)}`}>
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[22px] font-black text-[#202124] tracking-tight">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${cfg.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
                <span className="text-[12px] text-[#9aa0a6]">·</span>
                <span className="text-[12px] text-[#9aa0a6]">Customer since {formatDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>
          {/* Quick contact chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <a href={`mailto:${customer.email}`}
              className="flex items-center gap-1.5 rounded-xl bg-gray-50 border border-[#e8eaed] px-3 py-2 text-[12px] font-medium text-[#5f6368] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
              <Mail size={13} />{customer.email}
            </a>
            <a href={`tel:${customer.phone}`}
              className="flex items-center gap-1.5 rounded-xl bg-gray-50 border border-[#e8eaed] px-3 py-2 text-[12px] font-medium text-[#5f6368] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
              <Phone size={13} />{customer.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Gradient metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders',   value: customer.totalOrders,   display: String(customer.totalOrders),      gradient: 'from-red-500 to-rose-500',     glow: 'shadow-red-100',     icon: ShoppingBag },
          { label: 'Total Spent',    value: customer.totalSpent,    display: formatCurrency(customer.totalSpent), gradient: 'from-emerald-400 to-green-500', glow: 'shadow-green-100',   icon: PoundSterling },
          { label: 'Avg Order',      value: avgOrderValue,          display: formatCurrency(avgOrderValue),      gradient: 'from-blue-500 to-indigo-500',   glow: 'shadow-blue-100',    icon: TrendingUp },
          { label: 'Member Since',   value: 0,                      display: formatDate(customer.createdAt),     gradient: 'from-purple-500 to-violet-500', glow: 'shadow-purple-100',  icon: Clock },
        ].map(s => (
          <div key={s.label}
            className={`relative overflow-hidden rounded-2xl border border-[#e8eaed] bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${s.glow}`}>
            <div className={`h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.07]`} />
            <div className="p-5">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-sm`}>
                <s.icon size={18} className="text-white" />
              </div>
              <p className="text-[26px] font-black text-[#202124] leading-none tracking-tight">{s.display}</p>
              <p className="mt-1 text-[12px] font-semibold text-[#5f6368]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Order history — 2/3 width */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
              <ShoppingBag size={14} className="text-red-600" />
              <span className="text-[13px] font-bold text-[#202124]">Order History</span>
              <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">{customer.totalOrders}</span>
            </div>
            <CustomerOrderHistory customerId={customer.id} />
          </div>
        </div>

        {/* Contact & info sidebar — 1/3 width */}
        <div className="space-y-4">

          {/* Contact card */}
          <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
              <Phone size={13} className="text-[#5f6368]" />
              <span className="text-[13px] font-bold text-[#202124]">Contact Details</span>
            </div>
            <div className="p-5 space-y-3">
              <a href={`mailto:${customer.email}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-[12px] font-medium text-[#5f6368] hover:bg-red-50 hover:text-red-600 transition-all group">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-[#e8eaed] group-hover:border-red-200 group-hover:bg-red-50">
                  <Mail size={12} className="text-[#9aa0a6] group-hover:text-red-500" />
                </div>
                <span className="truncate">{customer.email}</span>
              </a>
              <a href={`tel:${customer.phone}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-[12px] font-medium text-[#5f6368] hover:bg-red-50 hover:text-red-600 transition-all group">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-[#e8eaed] group-hover:border-red-200 group-hover:bg-red-50">
                  <Phone size={12} className="text-[#9aa0a6] group-hover:text-red-500" />
                </div>
                {customer.phone}
              </a>
              {customer.address && (
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-[#e8eaed]">
                    <MapPin size={12} className="text-[#9aa0a6]" />
                  </div>
                  <div className="text-[12px] text-[#5f6368] leading-relaxed">
                    <p className="font-medium text-[#202124]">{customer.address.line1}</p>
                    {customer.address.line2 && <p>{customer.address.line2}</p>}
                    <p>{customer.address.city}{customer.address.county ? `, ${customer.address.county}` : ''}</p>
                    <p>{customer.address.postcode}</p>
                    <p>{customer.address.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
              <TrendingUp size={13} className="text-[#5f6368]" />
              <span className="text-[13px] font-bold text-[#202124]">Activity</span>
            </div>
            <div className="divide-y divide-[#f8fafc]">
              {[
                { label: 'Member Since',   value: formatDate(customer.createdAt),   icon: Calendar },
                { label: 'Last Order',     value: customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '—', icon: Clock },
                { label: 'Avg Order Value',value: formatCurrency(avgOrderValue),     icon: PoundSterling },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <item.icon size={12} className="text-[#9aa0a6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aa0a6]">{item.label}</p>
                    <p className="text-[13px] font-semibold text-[#202124] mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
