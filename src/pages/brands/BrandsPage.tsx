import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layers, Pencil, Trash2, Smartphone, Search, Cpu } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useBrands } from '../../hooks/useCatalog';
import { useDevices } from '../../hooks/useDevices';
import { useToast } from '../../context/ToastContext';
import type { Brand } from '../../types/catalog';

export default function BrandsPage() {
  const navigate = useNavigate();
  const { brands, loading, update, remove } = useBrands();
  const { devices } = useDevices();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');

  const filtered = useMemo(() => brands.filter(b => {
    const q = search.toLowerCase();
    return (!q || b.name.toLowerCase().includes(q)) && (!deviceFilter || b.deviceTypeId === deviceFilter);
  }), [brands, search, deviceFilter]);

  const activeCount = brands.filter(b => b.isActive).length;

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Delete "${brand.name}"?`)) return;
    try { await remove(brand.id); success('Brand deleted'); }
    catch { toastError('Failed to delete.'); }
  };

  const handleToggle = async (e: React.MouseEvent, brand: Brand) => {
    e.stopPropagation();
    try { await update(brand.id, { isActive: !brand.isActive }); success(`${brand.name} ${brand.isActive ? 'deactivated' : 'activated'}`); }
    catch { toastError('Failed to update.'); }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-black text-[#202124] tracking-tight">Brands</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md">
              <Layers size={13} className="text-white/70" />
              <span className="text-[12px] font-semibold text-white/70">Total</span>
              <span className="text-[18px] font-black text-white leading-none">{brands.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 shadow-md shadow-green-200">
              <span className="text-[12px] font-semibold text-white/80">Active</span>
              <span className="text-[18px] font-black text-white leading-none">{activeCount}</span>
            </div>
          </div>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={() => navigate('/brands/new')}>Add Brand</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brands..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-red-600" />
        </div>
        <select value={deviceFilter} onChange={e => setDeviceFilter(e.target.value)}
          className="rounded-xl border border-[#e8eaed] bg-white px-3 py-2.5 text-[13px] text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-red-600 sm:w-44">
          <option value="">All Devices</option>
          {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <span className="self-center text-[12px] text-[#9aa0a6]">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-2xl border border-[#e8eaed]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50"><Layers size={24} className="text-[#d1d5db]" /></div>
          <p className="text-[14px] font-semibold text-[#5f6368]">No brands found</p>
          <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => navigate('/brands/new')}>Add Brand</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(brand => (
            <div key={brand.id} className="group relative bg-white rounded-2xl border border-[#e8eaed] overflow-hidden hover:border-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />

              {/* Logo banner */}
              <div className="relative h-24 bg-gradient-to-br from-gray-50 to-[#f8fafc] flex items-center justify-center">
                {brand.logoUrl
                  ? <img src={brand.logoUrl} alt={brand.name} className="h-12 w-auto object-contain" />
                  : <span className="text-[32px] font-black text-[#e2e8f0] select-none">{brand.name.charAt(0)}</span>
                }
                <span className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  brand.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${brand.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {brand.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-[15px] font-bold text-[#202124] mb-2">{brand.name}</h3>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                    <Smartphone size={10} />{brand.deviceTypeName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    <Cpu size={10} />{brand.modelCount} model{brand.modelCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => handleToggle(e, brand)}
                    className={`flex flex-1 items-center justify-center h-8 rounded-xl text-[11px] font-bold transition-all border ${
                      brand.isActive ? 'bg-gray-50 text-[#5f6368] hover:bg-gray-100 border-[#e8eaed]' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                    }`}>
                    {brand.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => navigate(`/brands/${brand.id}/edit`)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 transition-all">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(brand)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
