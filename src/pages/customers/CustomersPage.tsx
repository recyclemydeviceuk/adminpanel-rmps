import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Download, Search, X, ShoppingBag, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useCustomers } from '../../hooks/useCustomers';
import { deleteCustomer } from '../../lib/customers';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../lib/currency';
import type { Customer } from '../../types/customer';

const PAGE_SIZE = 12;


function avatarColor(name: string) {
  const colors = ['bg-red-500','bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function exportCustomersCSV(customers: Customer[]) {
  const headers = ['Name','Email','Phone','Orders','Total Spent','Joined'];
  const rows = customers.map(c => [c.name,c.email,c.phone,c.totalOrders,`£${c.totalSpent.toFixed(2)}`,new Date(c.createdAt).toLocaleDateString('en-GB')]);
  const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=`customers-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const { customers, loading, reload } = useCustomers();
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => customers.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
  }), [customers, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalRevenue  = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders   = customers.reduce((s, c) => s + c.totalOrders, 0);

  const handleDelete = async (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    if (!confirm(`Delete "${customer.name}"? This cannot be undone.`)) return;
    try {
      await deleteCustomer(customer.id);
      success('Customer deleted');
      reload();
    } catch { toastError('Failed to delete customer.'); }
  };


  return (
    <div className="space-y-5">

      {/* Header with highlighted pills */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-black text-[#202124] tracking-tight">Customers</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md">
              <Users size={14} className="text-white/70" />
              <span className="text-[12px] font-semibold text-white/70">Total</span>
              <span className="text-[18px] font-black text-white leading-none">{customers.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 shadow-md shadow-green-200">
              <span className="text-[12px] font-semibold text-white/80">Lifetime Revenue</span>
              <span className="text-[18px] font-black text-white leading-none">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 shadow-md shadow-blue-200">
              <span className="text-[12px] font-semibold text-white/80">Total Orders</span>
              <span className="text-[18px] font-black text-white leading-none">{totalOrders}</span>
            </div>
          </div>
        </div>
        <Button variant="secondary" size="md" leftIcon={<Download size={15} />}
          onClick={() => { exportCustomersCSV(filtered); success('Exported', `${filtered.length} customers.`); }}>
          Export CSV
        </Button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, gradient: 'from-slate-500 to-slate-700', icon: Users },
          { label: 'Total Orders',    value: totalOrders,      gradient: 'from-blue-500 to-indigo-500',  icon: ShoppingBag },
        ].map(s => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl border border-[#e8eaed] bg-white shadow-sm">
            <div className={`h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <div className="p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-sm mb-4`}>
                <s.icon size={18} className="text-white" />
              </div>
              <p className="text-[32px] font-black text-[#202124] leading-none tracking-tight">{s.value}</p>
              <p className="text-[12px] font-semibold mt-1 text-[#5f6368]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, phone..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-red-600" />
        </div>
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }}
            className="flex items-center gap-1 rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[12px] text-[#5f6368] hover:bg-gray-50">
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-[12px] text-[#9aa0a6]">
          {filtered.length !== customers.length ? `${filtered.length} of ${customers.length}` : `${customers.length} customers`}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50"><Users size={24} className="text-[#d1d5db]" /></div>
            <p className="text-[14px] font-semibold text-[#5f6368]">No customers found</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2.5fr_1.5fr_0.8fr_1fr_1fr_44px] gap-3 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-2.5">
              {['Customer', 'Phone', 'Orders', 'Spent', 'Joined', ''].map(h => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">{h}</span>
              ))}
            </div>

            <div className="divide-y divide-[#f8fafc]">
              {paginated.map(row => (
                <div key={row.id} onClick={() => navigate(`/customers/${row.id}`)}
                  className="grid grid-cols-[2.5fr_1.5fr_0.8fr_1fr_1fr_44px] gap-3 items-center px-5 py-3.5 cursor-pointer transition-colors hover:bg-[#fafbfc] group">

                  {/* Customer */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-[12px] font-bold ${avatarColor(row.name)}`}>
                      {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#202124] truncate">{row.name}</p>
                      <p className="text-[11px] text-[#9aa0a6] truncate">{row.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <span className="text-[12px] text-[#5f6368] font-mono">{row.phone}</span>

                  {/* Orders */}
                  <span className="text-[13px] font-bold text-[#202124]">{row.totalOrders}</span>

                  {/* Spent */}
                  <span className="text-[13px] font-bold text-[#202124]">{formatCurrency(row.totalSpent)}</span>

                  {/* Joined */}
                  <span className="text-[11px] text-[#9aa0a6]">
                    {new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>

                  {/* Delete only */}
                  <div className="flex items-center justify-end" onClick={e => e.stopPropagation()}>
                    <button onClick={e => handleDelete(e, row)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#d1d5db] hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
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
