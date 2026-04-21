import { Settings, Building2 } from 'lucide-react';
import GeneralSettingsForm from './components/GeneralSettingsForm';
import NotificationsSettingsForm from './components/NotificationsSettingsForm';
import OperationsSettingsForm from './components/OperationsSettingsForm';

export default function SettingsPage() {
  return (
    <div className="space-y-5">

      {/* ── Hero Header ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1117] via-[#1a1d2e] to-[#0f1117] px-7 py-6 shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-slate-500/20 blur-3xl" />
        <div className="absolute -bottom-8 left-16 h-32 w-32 rounded-full bg-blue-600/15 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-black text-white tracking-tight">Settings</h1>
            <p className="text-[13px] text-white/50 mt-0.5">Configure your admin panel and business details</p>
          </div>
        </div>
      </div>

      {/* ── General (single tab containing all settings) ─── */}
      <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 border-b border-[#f3f4f6] bg-gradient-to-r from-gray-50/80 to-white px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-md">
            <Settings size={17} className="text-white" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#202124]">General</h2>
            <p className="text-[12px] text-[#9aa0a6]">Business info, operations & notifications</p>
          </div>
        </div>
        <div className="p-6 space-y-10">
          <GeneralSettingsForm />
          <div className="border-t border-[#f3f4f6]" />
          <OperationsSettingsForm />
          <div className="border-t border-[#f3f4f6]" />
          <NotificationsSettingsForm />
        </div>
      </div>

    </div>
  );
}
