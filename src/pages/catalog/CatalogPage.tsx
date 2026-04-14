import { useNavigate } from 'react-router-dom';
import { Smartphone, Layers, GitBranch, Cpu, Wrench, Package, ChevronRight, LayoutGrid } from 'lucide-react';
import { useDevices } from '../../hooks/useDevices';
import { useBrands, useAllSeries, useAllModels } from '../../hooks/useCatalog';
import { usePricing } from '../../hooks/usePricing';
import { useAddons } from '../../hooks/useAddons';

export default function CatalogPage() {
  const navigate = useNavigate();
  const { devices } = useDevices();
  const { brands } = useBrands();
  const { series } = useAllSeries();
  const { models } = useAllModels();
  const { repairTypes } = usePricing();
  const { addons } = useAddons();

  const activeDevices  = devices.filter(d => d.isActive).length;
  const activeBrands   = brands.filter(b => b.isActive).length;
  const activeModels   = models.filter(m => m.isActive).length;
  const activeRepairs  = repairTypes.filter(r => r.isActive).length;

  const STAT_CARDS = [
    { label: 'Devices',  value: devices.length,     active: activeDevices,                              icon: Smartphone, gradient: 'from-red-500 to-rose-500',       glow: 'shadow-red-100',    path: '/devices' },
    { label: 'Brands',   value: brands.length,      active: activeBrands,                               icon: Layers,     gradient: 'from-blue-500 to-indigo-500',    glow: 'shadow-blue-100',   path: '/brands' },
    { label: 'Series',   value: series.length,      active: series.length,                              icon: GitBranch,  gradient: 'from-violet-500 to-purple-500',  glow: 'shadow-purple-100', path: '/series' },
    { label: 'Models',   value: models.length,      active: activeModels,                               icon: Cpu,        gradient: 'from-emerald-400 to-green-500',  glow: 'shadow-green-100',  path: '/models' },
    { label: 'Repairs',  value: repairTypes.length, active: activeRepairs,                              icon: Wrench,     gradient: 'from-orange-400 to-amber-500',   glow: 'shadow-orange-100', path: '/repairs' },
    { label: 'Add-ons',  value: addons.length,      active: addons.filter(a => a.isActive).length,      icon: Package,    gradient: 'from-yellow-400 to-orange-400',  glow: 'shadow-yellow-100', path: '/addons' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-black text-[#202124] tracking-tight">Catalogue</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md">
              <LayoutGrid size={13} className="text-white/70" />
              <span className="text-[12px] font-semibold text-white/70">Total Items</span>
              <span className="text-[18px] font-black text-white leading-none">{devices.length + brands.length + series.length + models.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 shadow-md shadow-green-200">
              <span className="text-[12px] font-semibold text-white/80">Active</span>
              <span className="text-[18px] font-black text-white leading-none">{activeDevices + activeBrands + series.length + activeModels}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {STAT_CARDS.map(s => {
          const pct = s.value ? Math.round((s.active / s.value) * 100) : 0;
          return (
            <button key={s.label} onClick={() => navigate(s.path)}
              className={`group relative overflow-hidden rounded-2xl border border-[#e8eaed] bg-white text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-gray-300 ${s.glow}`}>
              <div className={`h-1 w-full bg-gradient-to-r ${s.gradient}`} />
              <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.07]`} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-sm`}>
                    <s.icon size={18} className="text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#9aa0a6] bg-gray-100 rounded-full px-2 py-0.5">{pct}%</span>
                    <ChevronRight size={13} className="text-[#d1d5db] group-hover:text-red-400 transition-colors" />
                  </div>
                </div>
                <p className="text-[32px] font-black text-[#202124] leading-none tracking-tight">{s.value}</p>
                <p className="text-[12px] font-semibold text-[#5f6368] mt-1">{s.label}</p>
                <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${s.gradient} transition-all duration-500`} style={{ width: `${Math.max(pct, 3)}%` }} />
                </div>
                <p className="mt-1.5 text-[10px] text-[#9aa0a6]">{s.active} of {s.value} active</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick nav */}
      <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
          <LayoutGrid size={13} className="text-red-600" />
          <h2 className="text-[13px] font-bold text-[#202124]">Quick Navigation</h2>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {STAT_CARDS.map(item => {
            const pct = item.value ? Math.round((item.active / item.value) * 100) : 0;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-[#fafbfc] transition-colors group">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-sm`}>
                  <item.icon size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#202124] group-hover:text-red-600 transition-colors">{item.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 w-20 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`} style={{ width: `${Math.max(pct, 3)}%` }} />
                    </div>
                    <span className="text-[10px] text-[#9aa0a6]">{item.active}/{item.value} active</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[22px] font-black text-[#202124]">{item.value}</span>
                  <ChevronRight size={13} className="text-[#d1d5db] group-hover:text-red-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
