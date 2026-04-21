import { useState, useEffect } from 'react';
import { Bell, ShoppingBag, Wrench, ShieldCheck, MessageSquare, Newspaper, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSettings, updateNotificationsSettings } from '../../../lib/settings';
import type { Settings } from '../../../lib/settings';
import { useToast } from '../../../hooks/useToast';

interface ToggleDef {
  key:         keyof Settings['notifications'];
  label:       string;
  description: string;
  icon:        React.ElementType;
  iconColor:   string;
  iconBg:      string;
}

const TOGGLES: ToggleDef[] = [
  { key: 'emailOnNewOrder',      label: 'New Order',           description: 'Send email when a new repair order is placed',         icon: ShoppingBag, iconColor: 'text-blue-600',    iconBg: 'bg-blue-50'    },
  { key: 'emailOnOrderComplete', label: 'Repair Completed',    description: 'Send email when a repair is marked complete',          icon: Wrench,      iconColor: 'text-purple-600',  iconBg: 'bg-purple-50'  },
  { key: 'emailOnWarrantyClaim', label: 'Warranty Claim',      description: 'Send email when a customer submits a warranty claim',  icon: ShieldCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { key: 'emailOnContactForm',   label: 'Contact Form',        description: 'Send email when a customer sends a contact message',   icon: MessageSquare, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
  { key: 'emailOnNewsletter',    label: 'Newsletter Sign-Up',  description: 'Send email when someone subscribes to the newsletter', icon: Newspaper,   iconColor: 'text-teal-600',    iconBg: 'bg-teal-50'    },
];

const EMPTY_NOTIF: Settings['notifications'] = {
  emailOnNewOrder:      true,
  emailOnOrderComplete: true,
  emailOnWarrantyClaim: true,
  emailOnContactForm:   true,
  emailOnNewsletter:    false,
};

export default function NotificationsSettingsForm() {
  const { success, error: toastError } = useToast();
  const [notif, setNotif]       = useState<Settings['notifications']>(EMPTY_NOTIF);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    setLoading(true);
    setFetchError('');
    getSettings()
      .then(s => setNotif({
        emailOnNewOrder:      s.notifications.emailOnNewOrder      ?? true,
        emailOnOrderComplete: s.notifications.emailOnOrderComplete ?? true,
        emailOnWarrantyClaim: s.notifications.emailOnWarrantyClaim ?? true,
        emailOnContactForm:   s.notifications.emailOnContactForm   ?? true,
        emailOnNewsletter:    s.notifications.emailOnNewsletter    ?? false,
      }))
      .catch(() => setFetchError('Failed to load settings. Check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleKey = (key: keyof Settings['notifications']) =>
    setNotif(p => ({ ...p, [key]: !p[key] }));

  const activeCount = TOGGLES.filter(t => notif[t.key]).length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateNotificationsSettings(notif);
      setNotif({
        emailOnNewOrder:      updated.notifications.emailOnNewOrder      ?? true,
        emailOnOrderComplete: updated.notifications.emailOnOrderComplete ?? true,
        emailOnWarrantyClaim: updated.notifications.emailOnWarrantyClaim ?? true,
        emailOnContactForm:   updated.notifications.emailOnContactForm   ?? true,
        emailOnNewsletter:    updated.notifications.emailOnNewsletter    ?? false,
      });
      success('Notification settings saved');
    } catch (err: any) {
      toastError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />
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
          className="rounded-xl bg-violet-50 px-4 py-2 text-[12px] font-semibold text-violet-700 hover:bg-violet-100 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Toggle events */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-3 border-b border-[#e8eaed] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={12} className="text-violet-600" />
            <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Email Notification Events</p>
          </div>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{activeCount} active</span>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {TOGGLES.map(t => {
            const Icon = t.icon;
            const isOn = notif[t.key];
            return (
              <label key={t.key} className="flex items-center justify-between gap-4 px-5 py-3.5 cursor-pointer hover:bg-[#fafbfc] transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${t.iconBg} transition-transform duration-200 group-hover:scale-105`}>
                    <Icon size={14} className={t.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#202124]">{t.label}</p>
                    <p className="text-[11px] text-[#9aa0a6] truncate">{t.description}</p>
                  </div>
                </div>
                <div onClick={() => toggleKey(t.key)}
                  className={`relative flex-shrink-0 h-6 w-11 rounded-full transition-all duration-200 cursor-pointer shadow-inner ${isOn ? 'bg-violet-600' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${isOn ? 'translate-x-5' : ''}`} />
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 transition-all">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={14} /> Save Notification Settings</>}
        </button>
      </div>
    </form>
  );
}
