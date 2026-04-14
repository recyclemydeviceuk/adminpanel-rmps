import { useNavigate } from 'react-router-dom';
import { Plus, Package, Pencil, Trash2, AlertCircle, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { useState } from 'react';
import Spinner from '../../components/ui/Spinner';
import { useAddons } from '../../hooks/useAddons';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/currency';
import type { Addon } from '../../types/addon';

export default function AddonsPage() {
  const navigate = useNavigate();
  const { addons, loading, update, remove } = useAddons();
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState('');

  const filtered = addons.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeCount = addons.filter(a => a.isActive).length;

  const handleToggle = async (addon: Addon) => {
    try { await update(addon.id, { isActive: !addon.isActive }); success(`${addon.name} ${addon.isActive ? 'deactivated' : 'activated'}`); }
    catch { toastError('Failed to update.'); }
  };

  const handleDelete = async (addon: Addon) => {
    if (!confirm(`Delete "${addon.name}"?`)) return;
    try { await remove(addon.id); success('Add-on deleted'); }
    catch { toastError('Failed to delete.'); }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-md shadow-pink-200">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">Add-ons</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-[#5f6368]">
                {addons.length} services
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />{activeCount} active
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/addons/new')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-pink-600 hover:to-rose-600 transition-all">
          <Plus size={15} /> Add Add-on
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search add-ons..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
        </div>
        <span className="text-[12px] text-[#9aa0a6]">{sorted.length} result{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-2xl border border-[#e8eaed]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
            <Package size={24} className="text-pink-300" />
          </div>
          <p className="text-[14px] font-semibold text-[#5f6368]">No add-ons found</p>
          <button onClick={() => navigate('/addons/new')}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-[12px] font-bold text-white hover:from-pink-600 hover:to-rose-600 transition-all">
            <Plus size={13} /> Add Add-on
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(addon => (
            <div key={addon.id} className={`group bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-200 ${
              addon.isActive ? 'border-pink-100 hover:border-pink-200' : 'border-[#e8eaed] opacity-75'
            }`}>
              {/* Top accent */}
              <div className={`h-1 ${addon.isActive ? 'bg-gradient-to-r from-pink-500 to-rose-400' : 'bg-gray-200'}`} />

              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                      <Package size={16} className="text-pink-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold text-[#202124] leading-tight">{addon.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          addon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${addon.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {addon.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {addon.isRequired && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            <AlertCircle size={9} /> Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-[18px] font-black text-[#202124]">{formatCurrency(addon.price)}</span>
                  </div>
                </div>

                {/* Description */}
                {addon.description && (
                  <p className="text-[12px] text-[#5f6368] leading-relaxed line-clamp-2 mb-4">{addon.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-[#f8fafc]">
                  <button onClick={() => handleToggle(addon)}
                    className={`flex flex-1 items-center justify-center gap-1.5 h-9 rounded-xl text-[12px] font-semibold transition-all ${
                      addon.isActive ? 'bg-gray-50 text-[#5f6368] hover:bg-gray-100 border border-[#e8eaed]' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}>
                    {addon.isActive ? <><ToggleLeft size={13} />Deactivate</> : <><ToggleRight size={13} />Activate</>}
                  </button>
                  <button onClick={() => navigate(`/addons/${addon.id}/edit`)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] transition-all">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(addon)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
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
