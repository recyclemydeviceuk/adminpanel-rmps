import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wrench, Pencil, Trash2, Search, Monitor, BatteryCharging, Camera, Square, Stethoscope, Volume2, MoreHorizontal, ToggleLeft, ToggleRight } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { usePricing } from '../../hooks/usePricing';
import { useToast } from '../../context/ToastContext';
import { updateRepairType, deleteRepairType } from '../../lib/pricing';
import type { RepairType } from '../../types/pricing';

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  screen:       { label: 'Screen',        color: 'text-red-700',    bg: 'bg-red-50',     icon: Monitor },
  battery:      { label: 'Battery',       color: 'text-green-700',  bg: 'bg-green-50',   icon: BatteryCharging },
  camera:       { label: 'Camera',        color: 'text-purple-700', bg: 'bg-purple-50',  icon: Camera },
  back_glass:   { label: 'Back Cover',    color: 'text-blue-700',   bg: 'bg-blue-50',    icon: Square },
  charging_port:{ label: 'Diagnostics',   color: 'text-orange-700', bg: 'bg-orange-50',  icon: Stethoscope },
  speaker:      { label: 'Speaker',       color: 'text-pink-700',   bg: 'bg-pink-50',    icon: Volume2 },
  other:        { label: 'Other',         color: 'text-gray-600',   bg: 'bg-gray-100',   icon: MoreHorizontal },
};

export default function RepairsPage() {
  const navigate = useNavigate();
  const { repairTypes, loading, reload } = usePricing();
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState('');

  const filtered = repairTypes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const activeCount = repairTypes.filter(r => r.isActive).length;

  const handleToggle = async (rt: RepairType) => {
    try { await updateRepairType(rt.id, { isActive: !rt.isActive }); success(`${rt.name} ${rt.isActive ? 'deactivated' : 'activated'}`); reload(); }
    catch { toastError('Failed to update.'); }
  };

  const handleDelete = async (rt: RepairType) => {
    if (!confirm(`Delete "${rt.name}"?`)) return;
    try { await deleteRepairType(rt.id); success('Repair type deleted'); reload(); }
    catch { toastError('Failed to delete.'); }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-md shadow-red-200">
            <Wrench size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">Repairs</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-[#5f6368]">
                {repairTypes.length} types
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />{activeCount} active
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/repairs/new')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-orange-600 hover:to-red-600 transition-all">
          <Plus size={15} /> Add Repair Type
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search repair types..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
        </div>
        <span className="text-[12px] text-[#9aa0a6]">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-2xl border border-[#e8eaed]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border border-red-100">
            <Wrench size={24} className="text-red-300" />
          </div>
          <p className="text-[14px] font-semibold text-[#5f6368]">No repair types found</p>
          <button onClick={() => navigate('/repairs/new')}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-[12px] font-bold text-white hover:from-orange-600 hover:to-red-600 transition-all">
            <Plus size={13} /> Add Repair Type
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(rt => {
            const cfg = CATEGORY_CONFIG[rt.category] ?? CATEGORY_CONFIG.other;
            const Icon = cfg.icon;
            return (
              <div key={rt.id} className="group bg-white rounded-2xl border border-[#e8eaed] overflow-hidden hover:border-red-200 hover:shadow-lg transition-all duration-200">
                {/* Top accent bar */}
                <div className={`h-1 ${rt.isActive ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gray-200'}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    {rt.imageUrl ? (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#f5f7fb] overflow-hidden">
                        <img
                          src={rt.imageUrl}
                          alt={rt.name}
                          className="h-9 w-9 object-contain"
                        />
                      </div>
                    ) : (
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                        <Icon size={18} className={cfg.color} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-bold text-[#202124] leading-tight">{rt.name}</h3>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          rt.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${rt.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {rt.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9aa0a6] font-mono mt-0.5">/{rt.slug}</p>
                    </div>
                  </div>

                  {/* Category chip */}
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.color} mb-3`}>
                    <Icon size={10} />{cfg.label}
                  </span>

                  {rt.description && (
                    <p className="text-[12px] text-[#5f6368] leading-relaxed mt-2 mb-4 line-clamp-2">{rt.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-[#f8fafc] mt-2">
                    <button onClick={() => handleToggle(rt)}
                      className={`flex flex-1 items-center justify-center gap-1.5 h-9 rounded-xl text-[12px] font-semibold transition-all ${
                        rt.isActive ? 'bg-gray-50 text-[#5f6368] hover:bg-gray-100 border border-[#e8eaed]' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}>
                      {rt.isActive ? <><ToggleLeft size={13} />Deactivate</> : <><ToggleRight size={13} />Activate</>}
                    </button>
                    <button onClick={() => navigate(`/repairs/${rt.id}/edit`)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] transition-all">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(rt)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
