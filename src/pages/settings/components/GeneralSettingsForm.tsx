import { useState, useEffect, useRef } from 'react';
import { Globe, Mail, Phone, MapPin, MessageCircle, Tag, Loader2, CheckCircle2, AlertCircle, Upload, X, Image } from 'lucide-react';
import { getSettings, updateGeneralSettings } from '../../../lib/settings';
import type { Settings } from '../../../lib/settings';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-[#5f6368] uppercase tracking-wide">
        <Icon size={11} />
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-[#e8eaed] bg-[#fafbfc] px-3.5 py-2.5 text-[13px] text-[#202124] placeholder:text-[#c5c9ce] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent focus:bg-white transition-all";

const EMPTY: Settings['general'] = {
  businessName:   '',
  tagline:        '',
  phone:          '',
  email:          '',
  address:        '',
  whatsappNumber: '',
  logoUrl:        '',
};

export default function GeneralSettingsForm() {
  const { success, error: toastError } = useToast();
  const [form, setForm]           = useState<Settings['general']>(EMPTY);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview]     = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError('');
    getSettings()
      .then(s => {
        const g = s.general;
        setForm({
          businessName:   g.businessName   ?? '',
          tagline:        g.tagline        ?? '',
          phone:          g.phone          ?? '',
          email:          g.email          ?? '',
          address:        g.address        ?? '',
          whatsappNumber: g.whatsappNumber ?? '',
          logoUrl:        g.logoUrl        ?? '',
        });
        setLogoPreview(g.logoUrl ?? '');
      })
      .catch(() => setFetchError('Failed to load settings. Check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings['general'], val: string) =>
    setForm(p => ({ ...p, [key]: val }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post<{ data: { url: string; key: string } }>(
        '/upload?folder=misc',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const url = res.data.data.url;
      setForm(p => ({ ...p, logoUrl: url }));
      setLogoPreview(url);
      success('Logo uploaded — click Save to apply');
    } catch (err: any) {
      toastError(err?.response?.data?.message || 'Logo upload failed');
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setForm(p => ({ ...p, logoUrl: '' }));
    setLogoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateGeneralSettings(form);
      const g = updated.general;
      setForm({
        businessName:   g.businessName   ?? '',
        tagline:        g.tagline        ?? '',
        phone:          g.phone          ?? '',
        email:          g.email          ?? '',
        address:        g.address        ?? '',
        whatsappNumber: g.whatsappNumber ?? '',
        logoUrl:        g.logoUrl        ?? '',
      });
      setLogoPreview(g.logoUrl ?? '');
      success('General settings saved');
    } catch (err: any) {
      toastError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-600" />
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
          className="rounded-xl bg-slate-100 px-4 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-slate-200 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Business Info */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-5 py-3 border-b border-[#e8eaed]">
          <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Business Information</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name" icon={Globe}>
            <input value={form.businessName} onChange={e => set('businessName', e.target.value)} required className={inputCls} placeholder="RepairMyPhoneScreen" />
          </Field>
          <Field label="Tagline" icon={Tag}>
            <input value={form.tagline} onChange={e => set('tagline', e.target.value)} className={inputCls} placeholder="Fast, affordable phone repairs" />
          </Field>
        </div>
      </div>

      {/* Contact Details */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-5 py-3 border-b border-[#e8eaed]">
          <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Contact Details</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email Address" icon={Mail}>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="hello@repairmyphonescreen.co.uk" />
          </Field>
          <Field label="Phone Number" icon={Phone}>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} placeholder="0333 224 4018" />
          </Field>
          <Field label="WhatsApp Number" icon={MessageCircle}>
            <input value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} className={inputCls} placeholder="+44 7700 900000" />
          </Field>
          <Field label="Business Address" icon={MapPin}>
            <input value={form.address} onChange={e => set('address', e.target.value)} className={inputCls} placeholder="12 Repair Lane, London, W1 1AA" />
          </Field>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-5 py-3 border-b border-[#e8eaed]">
          <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Logo</p>
        </div>
        <div className="p-5">
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} />

          {logoPreview ? (
            /* Preview with change/remove controls */
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 rounded-2xl border border-[#e8eaed] bg-[#fafbfc] p-3 flex items-center justify-center" style={{ minWidth: 120, minHeight: 80 }}>
                <img src={logoPreview} alt="Logo preview" className="h-16 w-auto max-w-[160px] object-contain" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-semibold text-[#202124]">Current Logo</p>
                <p className="text-[11px] text-[#9aa0a6] max-w-xs truncate">{form.logoUrl}</p>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={logoUploading}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-slate-200 disabled:opacity-50 transition-colors">
                    {logoUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {logoUploading ? 'Uploading…' : 'Change Logo'}
                  </button>
                  <button type="button" onClick={handleRemoveLogo}
                    className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors">
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload dropzone */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="w-full rounded-2xl border-2 border-dashed border-[#e8eaed] bg-[#fafbfc] px-6 py-10 flex flex-col items-center gap-3 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
            >
              {logoUploading ? (
                <>
                  <Loader2 size={28} className="animate-spin text-slate-400" />
                  <p className="text-[13px] font-semibold text-[#5f6368]">Uploading…</p>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Image size={22} className="text-slate-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-[#202124]">Click to upload logo</p>
                    <p className="text-[11px] text-[#9aa0a6] mt-0.5">PNG, JPG or WebP — max 5 MB</p>
                  </div>
                </>
              )}
            </button>
          )}
          <p className="mt-2 text-[11px] text-[#9aa0a6]">Displayed in the website header, footer, and all customer emails.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving || logoUploading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-800 px-5 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-slate-700 hover:to-slate-900 disabled:opacity-60 transition-all">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={14} /> Save General Settings</>}
        </button>
      </div>
    </form>
  );
}
