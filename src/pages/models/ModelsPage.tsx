import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Cpu, Pencil, Trash2, Search, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import { useAllModels, useBrands, useAllSeries } from '../../hooks/useCatalog';
import { useDevices } from '../../hooks/useDevices';
import { useToast } from '../../context/ToastContext';
import type { DeviceModel } from '../../types/catalog';

const PAGE_SIZE = 15;

export default function ModelsPage() {
  const navigate = useNavigate();
  const { models, loading, update, remove } = useAllModels();
  const { brands } = useBrands();
  const { series } = useAllSeries();
  const { devices } = useDevices();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [page, setPage] = useState(1);

  const brandMap = useMemo(() => Object.fromEntries(brands.map(b => [b.id, b])), [brands]);
  const filteredBrands = useMemo(() => deviceFilter ? brands.filter(b => b.deviceTypeId === deviceFilter) : brands, [brands, deviceFilter]);
  const filteredSeries = useMemo(() => brandFilter ? series.filter(s => s.brandId === brandFilter) : series, [series, brandFilter]);

  const filtered = useMemo(() => models.filter(m => {
    const q = search.toLowerCase();
    return (!q || m.name.toLowerCase().includes(q) || m.brandName.toLowerCase().includes(q))
      && (!deviceFilter || m.deviceTypeId === deviceFilter)
      && (!brandFilter || m.brandId === brandFilter)
      && (!seriesFilter || m.seriesId === seriesFilter);
  }), [models, search, deviceFilter, brandFilter, seriesFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDeviceFilter = (v: string) => { setDeviceFilter(v); setBrandFilter(''); setSeriesFilter(''); setPage(1); };
  const handleBrandFilter  = (v: string) => { setBrandFilter(v); setSeriesFilter(''); setPage(1); };

  const handleDelete = async (m: DeviceModel) => {
    if (!confirm(`Delete "${m.name}"?`)) return;
    try { await remove(m.id); success('Model deleted'); }
    catch { toastError('Failed to delete.'); }
  };

  const handleToggle = async (e: React.MouseEvent, m: DeviceModel) => {
    e.stopPropagation();
    try { await update(m.id, { isActive: !m.isActive }); success(`${m.name} ${m.isActive ? 'deactivated' : 'activated'}`); }
    catch { toastError('Failed to update.'); }
  };

  const activeCount = models.filter(m => m.isActive).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-black text-[#202124] tracking-tight">Models</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md">
              <Cpu size={13} className="text-white/70" />
              <span className="text-[12px] font-semibold text-white/70">Total</span>
              <span className="text-[18px] font-black text-white leading-none">{models.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 shadow-md shadow-green-200">
              <span className="text-[12px] font-semibold text-white/80">Active</span>
              <span className="text-[18px] font-black text-white leading-none">{activeCount}</span>
            </div>
          </div>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={() => navigate('/models/new')}>Add Model</Button>
      </div>

      {/* Cascading Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search models..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-red-600" />
        </div>
        <select value={deviceFilter} onChange={e => handleDeviceFilter(e.target.value)}
          className="rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[13px] text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-red-600 w-36">
          <option value="">All Devices</option>
          {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={brandFilter} onChange={e => handleBrandFilter(e.target.value)}
          className="rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[13px] text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-red-600 w-36">
          <option value="">All Brands</option>
          {filteredBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={seriesFilter} onChange={e => { setSeriesFilter(e.target.value); setPage(1); }} disabled={!brandFilter}
          className="rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[13px] text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-red-600 w-40 disabled:opacity-50">
          <option value="">All Series</option>
          {filteredSeries.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="self-center text-[12px] text-[#9aa0a6] ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : (
        <div className="rounded-2xl border border-[#e8eaed] bg-white overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50"><Cpu size={24} className="text-[#d1d5db]" /></div>
              <p className="text-[14px] font-semibold text-[#5f6368]">No models found</p>
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => navigate('/models/new')}>Add Model</Button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_70px_100px_72px] gap-3 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3">
                {['Model', 'Device', 'Brand', 'Series', 'Year', 'Status', ''].map(h => (
                  <span key={h} className="text-[10px] font-bold uppercase tracking-wide text-[#9aa0a6]">{h}</span>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-[#f8fafc]">
                {paginated.map(row => {
                  const brand = brandMap[row.brandId];
                  const displayImage = row.imageUrl || brand?.showcaseImageUrl;
                  return (
                  <div key={row.id}
                    className="grid grid-cols-[2.5fr_1fr_1fr_1fr_70px_100px_72px] gap-3 items-center px-5 py-3.5 hover:bg-[#fafbfc] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/models/${row.id}/edit`)}>

                    {/* Model name + thumbnail */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 flex-shrink-0 rounded-xl border border-[#f1f3f4] bg-gradient-to-br from-gray-50 to-white overflow-hidden flex items-center justify-center shadow-sm">
                        {displayImage
                          ? <img src={displayImage} alt={row.name} className="h-full w-full object-contain p-0.5" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
                          : null}
                        <span className={`text-[11px] font-black text-[#c4c9d0] ${displayImage ? 'hidden' : 'flex'}`}>{row.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#202124] truncate">{row.name}</p>
                        <p className="text-[10px] text-[#9aa0a6] font-mono truncate">/{row.slug}</p>
                      </div>
                    </div>

                    {/* Device type */}
                    <span className="text-[11px] font-medium text-[#5f6368] truncate">{row.deviceTypeName}</span>

                    {/* Brand */}
                    <span className="inline-flex items-center rounded-lg bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700 w-fit truncate">{row.brandName}</span>

                    {/* Series */}
                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold w-fit truncate ${row.seriesName ? 'bg-violet-50 border border-violet-100 text-violet-700' : 'text-[#d1d5db]'}`}>
                      {row.seriesName ?? '—'}
                    </span>

                    {/* Year */}
                    <span className={`text-[12px] font-bold ${row.releaseYear ? 'text-[#5f6368]' : 'text-[#d1d5db]'}`}>
                      {row.releaseYear ?? '—'}
                    </span>

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
                      <button onClick={() => navigate(`/models/${row.id}/edit`)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5f6368] hover:bg-gray-100 transition-colors"><Pencil size={12} /></button>
                      <button onClick={() => handleDelete(row)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9aa0a6] hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                      <ChevronRight size={12} className="text-[#e2e8f0] group-hover:text-red-400 transition-colors" />
                    </div>
                  </div>
                  );
                })}
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
