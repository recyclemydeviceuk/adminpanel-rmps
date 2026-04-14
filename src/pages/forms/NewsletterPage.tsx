import { useState, useEffect, useMemo } from 'react';
import { Mail, Search, X, Download, Users, TrendingUp } from 'lucide-react';
import { getNewsletterSubmissions } from '../../lib/forms';
import type { NewsletterSubmission } from '../../types/forms';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 15;

const SOURCE_LABELS: Record<NewsletterSubmission['source'], string> = {
  footer: 'Footer',
  popup:  'Pop-up',
  page:   'Page',
};

const SOURCE_STYLE: Record<NewsletterSubmission['source'], string> = {
  footer: 'bg-blue-50 text-blue-700 border-blue-200',
  popup:  'bg-purple-50 text-purple-700 border-purple-200',
  page:   'bg-teal-50 text-teal-700 border-teal-200',
};

function exportCSV(rows: NewsletterSubmission[]) {
  const headers = ['Email', 'Source', 'Status', 'Subscribed At'];
  const data = rows.map(r => [
    r.email,
    SOURCE_LABELS[r.source],
    r.status,
    new Date(r.subscribedAt).toLocaleDateString('en-GB'),
  ]);
  const csv = [headers, ...data].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function NewsletterPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setFetchError('');
    getNewsletterSubmissions()
      .then((data) => setSubs(data))
      .catch((err) => {
        setSubs([]);
        setFetchError(err?.response?.data?.message || 'Failed to load subscribers. Check your connection and try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subs.filter((r: any) => {
      const matchSearch = !q || (r.email ?? '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, subs]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = subs.filter((r: any) => r.status === 'active').length;
  const unsubCount  = subs.filter((r: any) => r.status === 'unsubscribed').length;

  return (
    <div className="space-y-5">

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1117] via-[#1a1d2e] to-[#0f1117] px-7 py-6 shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-8 left-16 h-32 w-32 rounded-full bg-blue-600/15 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Mail size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-black text-white tracking-tight">Newsletter Subscribers</h1>
              <p className="text-[13px] text-white/50 mt-0.5">All email sign-ups from the customer website</p>
            </div>
          </div>
          {/* Stat pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md border border-white/5">
              <Users size={14} className="text-white/60" />
              <span className="text-[12px] font-semibold text-white/60">Total</span>
              <span className="text-[18px] font-black text-white leading-none">{subs.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 shadow-md shadow-green-200/30">
              <TrendingUp size={14} className="text-white/80" />
              <span className="text-[12px] font-semibold text-white/80">Active</span>
              <span className="text-[18px] font-black text-white leading-none">{activeCount}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-400 to-rose-500 px-4 py-2 shadow-md shadow-red-200/30">
              <span className="text-[12px] font-semibold text-white/80">Unsubscribed</span>
              <span className="text-[18px] font-black text-white leading-none">{unsubCount}</span>
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
            placeholder="Search email..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-violet-400"
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
          {(['all', 'active', 'unsubscribed'] as const).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all capitalize ${statusFilter === s ? 'bg-violet-600 text-white shadow-sm' : 'text-[#5f6368] hover:bg-gray-50'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => exportCSV(filtered)}
          className="ml-auto flex items-center gap-2 rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <Download size={13} /> Export CSV
        </button>
        <span className="text-[12px] text-[#9aa0a6]">
          {filtered.length !== subs.length
            ? `${filtered.length} of ${subs.length}`
            : `${subs.length} subscribers`}
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
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-2.5">
          {['Email Address', 'Source', 'Status', 'Subscribed'].map(h => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />
            <p className="text-[13px] text-[#9aa0a6]">Loading subscribers…</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <Mail size={24} className="text-[#d1d5db]" />
            </div>
            <p className="text-[14px] font-semibold text-[#5f6368]">{fetchError ? 'Failed to load subscribers' : 'No subscribers found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f8fafc]">
            {paginated.map(row => (
              <div key={row.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center px-5 py-3.5 hover:bg-[#fafbfc] transition-colors">
                {/* Email */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Mail size={13} />
                  </div>
                  <span className="text-[13px] font-medium text-[#202124] truncate">{row.email}</span>
                </div>
                {/* Source */}
                <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${SOURCE_STYLE[row.source as NewsletterSubmission['source']]}`}>
                  {SOURCE_LABELS[row.source as NewsletterSubmission['source']]}
                </span>
                {/* Status */}
                <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${row.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  {row.status === 'active' ? 'Active' : 'Unsubscribed'}
                </span>
                {/* Date */}
                <span className="text-[11px] text-[#9aa0a6]">
                  {new Date(row.subscribedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                </span>
              </div>
            ))}
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
