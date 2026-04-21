import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, X, Smartphone, ChevronDown, ChevronUp, Hash, Trash2 } from 'lucide-react';
import { getWarrantySubmissions, deleteWarrantySubmission } from '../../lib/forms';
import type { WarrantySubmission } from '../../types/forms';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 10;

const STATUS_STYLE: Record<WarrantySubmission['status'], { pill: string; dot: string; label: string }> = {
  pending:  { pill: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500',     label: 'Pending'  },
  approved: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500',   label: 'Approved' },
  rejected: { pill: 'bg-red-50 text-red-600 border-red-200',             dot: 'bg-red-500',       label: 'Rejected' },
  resolved: { pill: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-500',      label: 'Resolved' },
};

const BRAND_COLORS: Record<string, string> = {
  Apple:   'bg-gray-100 text-gray-700',
  Samsung: 'bg-blue-50 text-blue-700',
  Google:  'bg-green-50 text-green-700',
  OnePlus: 'bg-red-50 text-red-700',
};

function avatarColor(name: string) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function WarrantyPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<'all' | WarrantySubmission['status']>('all');
  const [page, setPage]             = useState(1);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete warranty claim from "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteWarrantySubmission(id);
      setSubs((prev) => prev.filter((r: any) => r.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete warranty claim.');
    } finally {
      setDeletingId(null);
    }
  };

  const load = () => {
    setLoading(true);
    setFetchError('');
    getWarrantySubmissions()
      .then((data) => setSubs(data))
      .catch((err) => {
        setSubs([]);
        setFetchError(err?.response?.data?.message || 'Failed to load warranty claims. Check your connection and try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subs.filter((r: any) => {
      const matchSearch = !q
        || (r.name ?? '').toLowerCase().includes(q)
        || (r.email ?? '').toLowerCase().includes(q)
        || (r.deviceBrand ?? '').toLowerCase().includes(q)
        || (r.deviceModel ?? '').toLowerCase().includes(q)
        || (r.orderReference?.toLowerCase().includes(q) ?? false)
        || (r.claimInfo ?? '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, subs]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount  = subs.filter(r => r.status === 'pending').length;
  const approvedCount = subs.filter(r => r.status === 'approved').length;
  const resolvedCount = subs.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-5">

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1117] via-[#1a1d2e] to-[#0f1117] px-7 py-6 shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-8 left-16 h-32 w-32 rounded-full bg-teal-600/15 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-black text-white tracking-tight">Warranty Claims</h1>
              <p className="text-[13px] text-white/50 mt-0.5">All warranty claim submissions from customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md border border-white/5">
              <span className="text-[12px] font-semibold text-white/60">Total</span>
              <span className="text-[18px] font-black text-white leading-none">{subs.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 shadow-md shadow-amber-200/30">
              <span className="text-[12px] font-semibold text-white/80">Pending</span>
              <span className="text-[18px] font-black text-white leading-none">{pendingCount}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 shadow-md shadow-emerald-200/30">
              <span className="text-[12px] font-semibold text-white/80">Approved</span>
              <span className="text-[18px] font-black text-white leading-none">{approvedCount}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 shadow-md shadow-blue-200/30">
              <span className="text-[12px] font-semibold text-white/80">Resolved</span>
              <span className="text-[18px] font-black text-white leading-none">{resolvedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, device, order ref..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }}
            className="flex items-center gap-1 rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[12px] text-[#5f6368] hover:bg-gray-50">
            <X size={12} /> Clear
          </button>
        )}
        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-xl border border-[#e8eaed] bg-white p-1">
          {(['all', 'pending', 'approved', 'rejected', 'resolved'] as const).map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all capitalize ${statusFilter === s ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#5f6368] hover:bg-gray-50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[12px] text-[#9aa0a6]">
          {filtered.length !== subs.length
            ? `${filtered.length} of ${subs.length}`
            : `${subs.length} claims`}
        </span>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{fetchError}</p>
          <button onClick={load} className="rounded-lg bg-red-100 px-3 py-1.5 text-[12px] font-semibold text-red-700 hover:bg-red-200 transition-colors">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.8fr_1fr_1fr_72px] gap-3 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-2.5">
          {['Customer', 'Device', 'Status', 'Submitted', ''].map(h => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-600" />
            <p className="text-[13px] text-[#9aa0a6]">Loading warranty claims…</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <ShieldCheck size={24} className="text-[#d1d5db]" />
            </div>
            <p className="text-[14px] font-semibold text-[#5f6368]">{fetchError ? 'Failed to load warranty claims' : 'No warranty claims found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f8fafc]">
            {paginated.map(row => {
              const st = STATUS_STYLE[row.status as WarrantySubmission['status']];
              const isExpanded = expanded === row.id;
              const brandCls = BRAND_COLORS[row.deviceBrand] ?? 'bg-gray-100 text-gray-700';
              return (
                <div key={row.id}>
                  {/* Row */}
                  <div className="grid grid-cols-[2fr_1.8fr_1fr_1fr_72px] gap-3 items-center px-5 py-3.5 hover:bg-[#fafbfc] transition-colors">
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
                    {/* Device */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                        <Smartphone size={12} className="text-[#9aa0a6]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-[#202124] truncate">{row.deviceModel}</p>
                        <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${brandCls}`}>{row.deviceBrand}</span>
                      </div>
                    </div>
                    {/* Status */}
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${st.pill}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    {/* Date */}
                    <span className="text-[11px] text-[#9aa0a6]">
                      {new Date(row.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => setExpanded(isExpanded ? null : row.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9aa0a6] hover:bg-gray-100 hover:text-[#5f6368] transition-colors">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(row.id, row.name)}
                        disabled={deletingId === row.id}
                        title="Delete warranty claim"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9aa0a6] hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded claim details */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 bg-[#fafbfc] border-t border-[#f1f3f4]">
                      <div className="rounded-xl border border-[#e8eaed] bg-white p-4 space-y-3">
                        {row.orderReference && (
                          <div className="flex items-center gap-2">
                            <Hash size={12} className="text-[#9aa0a6]" />
                            <span className="text-[11px] font-bold uppercase tracking-wide text-[#9aa0a6]">Order Reference</span>
                            <span className="ml-1 rounded-lg bg-gray-100 px-2 py-0.5 text-[11px] font-mono font-bold text-[#5f6368]">{row.orderReference}</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            <span className="text-[11px] font-bold uppercase tracking-wide text-[#9aa0a6]">Claim Details</span>
                          </div>
                          <p className="text-[13px] text-[#202124] leading-relaxed">{row.claimInfo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-[#f3f4f6] px-5 py-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
          </div>
        )}
      </div>
    </div>
  );
}
