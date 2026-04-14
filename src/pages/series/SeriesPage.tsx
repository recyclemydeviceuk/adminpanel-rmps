import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GitBranch, Pencil, Trash2, Search, Cpu, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import { useAllSeries, useBrands } from '../../hooks/useCatalog';
import { useToast } from '../../context/ToastContext';
import type { Series } from '../../types/catalog';

const PAGE_SIZE = 15;

export default function SeriesPage() {
  const navigate = useNavigate();
  const { series, loading, update, remove } = useAllSeries();
  const { brands } = useBrands();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => series.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.brandName.toLowerCase().includes(q))
      && (!brandFilter || s.brandId === brandFilter);
  }), [series, search, brandFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (s: Series) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    try { await remove(s.id); success('Series deleted'); }
    catch { toastError('Failed to delete.'); }
  };

  const handleToggle = async (e: React.MouseEvent, s: Series) => {
    e.stopPropagation();
    try { await update(s.id, { isActive: !s.isActive }); success(`${s.name} ${s.isActive ? 'deactivated' : 'activated'}`); }
    catch { toastError('Failed to update.'); }
  };

  const activeCount = series.filter(s => s.isActive).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-black text-[#202124] tracking-tight">Series</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md">
              <GitBranch size={13} className="text-white/70" />
              <span className="text-[12px] font-semibold text-white/70">Total</span>
              <span className="text-[18px] font-black text-white leading-none">{series.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 shadow-md shadow-green-200">
              <span className="text-[12px] font-semibold text-white/80">Active</span>
              <span className="text-[18px] font-black text-white leading-none">{activeCount}</span>
            </div>
          </div>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={() => navigate('/series/new')}>Add Series</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search series or brand..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-red-600" />
        </div>
        <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[13px] text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-red-600 sm:w-52">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name} ({b.deviceTypeName})</option>)}
        </select>
        <span className="self-center text-[12px] text-[#9aa0a6]">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : (
        <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50"><GitBranch size={24} className="text-[#d1d5db]" /></div>
              <p className="text-[14px] font-semibold text-[#5f6368]">No series found</p>
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => navigate('/series/new')}>Add Series</Button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2.5fr_1.5fr_80px_100px_80px] gap-4 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3">
                {['Series', 'Brand', 'Models', 'Status', ''].map(h => (
                  <span key={h} className="text-[10px] font-bold uppercase tracking-wide text-[#9aa0a6]">{h}</span>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-[#f8fafc]">
                {paginated.map(row => (
                  <div key={row.id}
                    className="grid grid-cols-[2.5fr_1.5fr_80px_100px_80px] gap-4 items-center px-5 py-3.5 hover:bg-[#fafbfc] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/series/${row.id}/edit`)}>

                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                        <GitBranch size={13} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#202124] truncate">{row.name}</p>
                        <p className="text-[10px] text-[#9aa0a6] font-mono mt-0.5 truncate">/{row.slug}</p>
                      </div>
                    </div>

                    {/* Brand */}
                    <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 w-fit truncate">
                      {row.brandName}
                    </span>

                    {/* Model count */}
                    <div className="flex items-center gap-1.5">
                      <Cpu size={11} className="text-[#9aa0a6]" />
                      <span className="text-[13px] font-black text-[#202124]">{row.modelCount}</span>
                    </div>

                    {/* Status */}
                    <button onClick={e => { e.stopPropagation(); handleToggle(e, row); }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors w-fit ${
                        row.isActive
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${row.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {row.isActive ? 'Active' : 'Inactive'}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/series/${row.id}/edit`)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5f6368] hover:bg-gray-100 transition-colors"><Pencil size={12} /></button>
                      <button onClick={() => handleDelete(row)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9aa0a6] hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                      <ChevronRight size={12} className="text-[#e2e8f0] group-hover:text-red-400 transition-colors" />
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
      )}
    </div>
  );
}
