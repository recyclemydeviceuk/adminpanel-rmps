import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Smartphone, Pencil, Trash2, Search, Layers } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useDevices } from '../../hooks/useDevices';
import { useToast } from '../../context/ToastContext';
import type { DeviceType } from '../../types/catalog';

export default function DevicesPage() {
  const navigate = useNavigate();
  const { devices, loading, update, remove } = useDevices();
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState('');

  const filtered = devices.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const activeCount = devices.filter(d => d.isActive).length;

  const handleDelete = async (device: DeviceType) => {
    if (!confirm(`Delete "${device.name}"? This will affect all brands under it.`)) return;
    try { await remove(device.id); success('Device deleted'); }
    catch { toastError('Failed to delete device.'); }
  };

  const handleToggle = async (e: React.MouseEvent, device: DeviceType) => {
    e.stopPropagation();
    try {
      await update(device.id, { isActive: !device.isActive });
      success(`${device.name} ${device.isActive ? 'deactivated' : 'activated'}`);
    } catch { toastError('Failed to update.'); }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-black text-[#202124] tracking-tight">Devices</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-2 shadow-md">
              <Smartphone size={13} className="text-white/70" />
              <span className="text-[12px] font-semibold text-white/70">Total</span>
              <span className="text-[18px] font-black text-white leading-none">{devices.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 shadow-md shadow-green-200">
              <span className="text-[12px] font-semibold text-white/80">Active</span>
              <span className="text-[18px] font-black text-white leading-none">{activeCount}</span>
            </div>
          </div>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={() => navigate('/devices/new')}>
          Add Device
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-red-600" />
        </div>
        <span className="text-[12px] text-[#9aa0a6]">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-2xl border border-[#e8eaed]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50"><Smartphone size={24} className="text-[#d1d5db]" /></div>
          <p className="text-[14px] font-semibold text-[#5f6368]">No devices found</p>
          <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => navigate('/devices/new')}>Add Device</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(device => (
            <div key={device.id}
              className="group relative bg-white rounded-2xl border border-[#e8eaed] overflow-hidden hover:border-red-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
              <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-400" />

              {/* Image banner */}
              <div className="relative h-28 bg-gradient-to-br from-gray-50 to-[#f8fafc] flex items-center justify-center">
                {device.imageUrl
                  ? <img src={device.imageUrl} alt={device.name} className="h-16 w-auto object-contain" />
                  : <Smartphone size={36} className="text-[#e2e8f0]" />
                }
                <span className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  device.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${device.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {device.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-[15px] font-bold text-[#202124]">{device.name}</h3>
                  <p className="text-[11px] text-[#9aa0a6] mt-0.5 font-mono">/{device.slug}</p>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1">
                    <Layers size={11} className="text-blue-500" />
                    <span className="text-[11px] font-bold text-blue-700">{device.brandCount} brand{device.brandCount !== 1 ? 's' : ''}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => handleToggle(e, device)}
                    className={`flex flex-1 items-center justify-center h-8 rounded-xl text-[11px] font-bold transition-all border ${
                      device.isActive
                        ? 'bg-gray-50 text-[#5f6368] hover:bg-gray-100 border-[#e8eaed]'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                    }`}>
                    {device.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => navigate(`/devices/${device.id}/edit`)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 transition-all">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(device)}
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
