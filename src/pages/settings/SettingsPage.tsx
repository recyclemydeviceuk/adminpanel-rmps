import { useState } from 'react';
import { Settings, Bell, Zap, Building2 } from 'lucide-react';
import GeneralSettingsForm from './components/GeneralSettingsForm';
import NotificationsSettingsForm from './components/NotificationsSettingsForm';
import OperationsSettingsForm from './components/OperationsSettingsForm';

const TABS = [
  { key: 'general',       label: 'General',       icon: Settings, gradient: 'from-slate-500 to-slate-700',   desc: 'Business info & site config' },
  { key: 'operations',    label: 'Operations',    icon: Zap,      gradient: 'from-amber-500 to-orange-600',  desc: 'Hours, bookings & maintenance' },
  { key: 'notifications', label: 'Notifications', icon: Bell,     gradient: 'from-violet-500 to-purple-600', desc: 'Email alert preferences' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const active = TABS.find(t => t.key === activeTab)!;

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

      {/* ── Tab Navigation ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:shadow-md ${
                isActive
                  ? 'border-transparent bg-white shadow-lg ring-2 ring-offset-1 ring-red-500/20'
                  : 'border-[#e8eaed] bg-white hover:border-gray-300'
              }`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tab.gradient} shadow-sm transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Icon size={17} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-[13px] font-bold truncate ${isActive ? 'text-[#202124]' : 'text-[#5f6368]'}`}>{tab.label}</p>
                <p className="text-[10px] text-[#9aa0a6] truncate">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Card ─────────────────────────────── */}
      <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-4 border-b border-[#f3f4f6] bg-gradient-to-r from-gray-50/80 to-white px-6 py-5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${active.gradient} shadow-md`}>
            <active.icon size={17} className="text-white" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#202124]">{active.label}</h2>
            <p className="text-[12px] text-[#9aa0a6]">{active.desc}</p>
          </div>
        </div>
        {/* Form content */}
        <div className="p-6">
          {activeTab === 'general'       && <GeneralSettingsForm />}
          {activeTab === 'operations'    && <OperationsSettingsForm />}
          {activeTab === 'notifications' && <NotificationsSettingsForm />}
        </div>
      </div>

    </div>
  );
}
