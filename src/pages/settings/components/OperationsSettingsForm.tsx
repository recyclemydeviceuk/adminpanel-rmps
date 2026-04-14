import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Calendar, Wrench, Truck, Timer, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSettings, updateOperationsSettings } from '../../../lib/settings';
import type { Settings, BusinessHour } from '../../../lib/settings';
import { useToast } from '../../../hooks/useToast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_HOURS: BusinessHour[] = DAYS.map((day, i) => ({
  day, open: i < 5, from: '09:00', to: '18:00',
}));

interface ToggleDef {
  key:         keyof Settings['operations'];
  label:       string;
  description: string;
  icon:        React.ElementType;
  iconBg:      string;
  iconColor:   string;
  dangerOn?:   boolean;
}

const TOGGLES: ToggleDef[] = [
  { key: 'maintenanceMode',    label: 'Maintenance Mode',      description: 'Temporarily disable the website for customers.',              icon: Wrench,   iconBg: 'bg-red-50',    iconColor: 'text-red-600',    dangerOn: true },
  { key: 'acceptNewBookings',  label: 'Accept New Bookings',   description: 'Allow customers to book repairs online.',                      icon: Calendar, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { key: 'sameDayRepairs',     label: 'Same-Day Repairs',      description: 'Show same-day availability to customers during checkout.',     icon: Clock,    iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'    },
  { key: 'collectionDelivery', label: 'Collection & Delivery', description: 'Offer mail-in / collection service as an option at checkout.', icon: Truck,    iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'   },
];

const timeCls = "rounded-xl border border-[#e8eaed] bg-[#fafbfc] px-2.5 py-2 text-[13px] text-[#202124] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all";
const inputCls = "w-full rounded-xl border border-[#e8eaed] bg-[#fafbfc] px-3.5 py-2.5 text-[13px] text-[#202124] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all";

const EMPTY_OPS: Settings['operations'] = {
  maintenanceMode:     false,
  maintenanceMessage:  '',
  acceptNewBookings:   true,
  sameDayRepairs:      true,
  collectionDelivery:  true,
  turnaroundTime:      '1-2 hours',
  businessHours:       DEFAULT_HOURS,
};

export default function OperationsSettingsForm() {
  const { success, error: toastError } = useToast();
  const [ops, setOps]           = useState<Settings['operations']>(EMPTY_OPS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    setLoading(true);
    setFetchError('');
    getSettings()
      .then(s => setOps({
        maintenanceMode:     s.operations.maintenanceMode    ?? false,
        maintenanceMessage:  s.operations.maintenanceMessage ?? '',
        acceptNewBookings:   s.operations.acceptNewBookings  ?? true,
        sameDayRepairs:      s.operations.sameDayRepairs     ?? true,
        collectionDelivery:  s.operations.collectionDelivery ?? true,
        turnaroundTime:      s.operations.turnaroundTime     ?? '1-2 hours',
        businessHours:       s.operations.businessHours?.length ? s.operations.businessHours : DEFAULT_HOURS,
      }))
      .catch(() => setFetchError('Failed to load settings. Check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const setToggle = (key: keyof Settings['operations']) =>
    setOps(p => ({ ...p, [key]: !p[key] }));

  const setHour = (idx: number, field: keyof BusinessHour, val: string | boolean) =>
    setOps(p => ({
      ...p,
      businessHours: p.businessHours.map((h, i) => i === idx ? { ...h, [field]: val } : h),
    }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateOperationsSettings(ops);
      setOps({
        maintenanceMode:     updated.operations.maintenanceMode    ?? false,
        maintenanceMessage:  updated.operations.maintenanceMessage ?? '',
        acceptNewBookings:   updated.operations.acceptNewBookings  ?? true,
        sameDayRepairs:      updated.operations.sameDayRepairs     ?? true,
        collectionDelivery:  updated.operations.collectionDelivery ?? true,
        turnaroundTime:      updated.operations.turnaroundTime     ?? '1-2 hours',
        businessHours:       updated.operations.businessHours?.length ? updated.operations.businessHours : DEFAULT_HOURS,
      });
      success('Operations settings saved');
    } catch (err: any) {
      toastError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-500" />
        <p className="text-[13px] text-[#9aa0a6]">Loading settings…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle size={22} className="text-red-500" />
        </div>
        <p className="text-[13px] font-semibold text-[#5f6368]">{fetchError}</p>
        <button onClick={() => window.location.reload()}
          className="rounded-xl bg-amber-50 px-4 py-2 text-[12px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const isMaintenanceOn = ops.maintenanceMode;

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Maintenance warning banner */}
      {isMaintenanceOn && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4 shadow-sm">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-red-800">Maintenance mode is ON</p>
            <p className="text-[12px] text-red-600 mt-0.5">The website is currently hidden from customers. Remember to turn this off when done.</p>
          </div>
        </div>
      )}

      {/* Site Controls */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 border-b border-[#e8eaed]">
          <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Site Controls</p>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {TOGGLES.map(t => {
            const Icon = t.icon;
            const isOn    = !!ops[t.key];
            const isDanger = t.dangerOn && isOn;
            return (
              <label key={t.key} className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-[#fafbfc] transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${isDanger ? 'bg-red-100' : t.iconBg}`}>
                    <Icon size={15} className={isDanger ? 'text-red-600' : t.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[13px] font-semibold ${isDanger ? 'text-red-700' : 'text-[#202124]'}`}>{t.label}</p>
                    <p className="text-[11px] text-[#9aa0a6] truncate">{t.description}</p>
                  </div>
                </div>
                <div onClick={() => setToggle(t.key)}
                  className={`relative flex-shrink-0 h-6 w-11 rounded-full transition-all duration-200 cursor-pointer shadow-inner ${
                    isOn ? (isDanger ? 'bg-red-600' : 'bg-amber-500') : 'bg-gray-200'
                  }`}>
                  <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${isOn ? 'translate-x-5' : ''}`} />
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Maintenance Message */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 border-b border-[#e8eaed]">
          <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Maintenance Message</p>
        </div>
        <div className="p-5">
          <textarea
            rows={3}
            value={ops.maintenanceMessage}
            onChange={e => setOps(p => ({ ...p, maintenanceMessage: e.target.value }))}
            className="w-full rounded-xl border border-[#e8eaed] bg-[#fafbfc] px-3.5 py-2.5 text-[13px] text-[#202124] resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
          />
          <p className="mt-1.5 text-[11px] text-[#9aa0a6]">Shown to customers when maintenance mode is active.</p>
        </div>
      </div>

      {/* Turnaround Time */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 border-b border-[#e8eaed]">
          <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Repair Turnaround</p>
        </div>
        <div className="p-5">
          <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-[#5f6368] uppercase tracking-wide">
            <Timer size={11} /> Estimated Turnaround Time
          </label>
          <input
            value={ops.turnaroundTime}
            onChange={e => setOps(p => ({ ...p, turnaroundTime: e.target.value }))}
            className={inputCls}
            placeholder="e.g. 1-2 hours"
          />
          <p className="mt-1.5 text-[11px] text-[#9aa0a6]">Displayed to customers on the booking and checkout pages.</p>
        </div>
      </div>

      {/* Business Hours */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 border-b border-[#e8eaed]">
          <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Business Hours</p>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {ops.businessHours.map((h, idx) => (
            <div key={h.day} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 hover:bg-[#fafbfc] transition-colors">
              <div className="flex items-center gap-3 w-40 flex-shrink-0">
                <div
                  onClick={() => setHour(idx, 'open', !h.open)}
                  className={`relative flex-shrink-0 h-6 w-11 rounded-full transition-all duration-200 cursor-pointer shadow-inner ${h.open ? 'bg-amber-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${h.open ? 'translate-x-5' : ''}`} />
                </div>
                <span className={`text-[13px] font-semibold ${h.open ? 'text-[#202124]' : 'text-[#9aa0a6]'}`}>{h.day}</span>
              </div>
              {h.open ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={h.from} onChange={e => setHour(idx, 'from', e.target.value)} className={timeCls} />
                  <span className="text-[12px] font-semibold text-[#9aa0a6]">→</span>
                  <input type="time" value={h.to}   onChange={e => setHour(idx, 'to',   e.target.value)} className={timeCls} />
                </div>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-[#9aa0a6]">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-amber-600 hover:to-orange-700 disabled:opacity-60 transition-all">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={14} /> Save Operations Settings</>}
        </button>
      </div>
    </form>
  );
}
