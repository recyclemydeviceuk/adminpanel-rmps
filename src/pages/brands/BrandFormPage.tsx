import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Layers, Upload, X, CheckCircle2 } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useDevices } from '../../hooks/useDevices';
import { useToast } from '../../context/ToastContext';
import { getBrandById, createBrand, updateBrand } from '../../lib/catalog';

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function BrandFormPage() {
  const navigate = useNavigate();
  const { brandId } = useParams<{ brandId: string }>();
  const isEdit = !!brandId;
  const { devices } = useDevices();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deviceTypeId, setDeviceTypeId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [showcaseImageUrl, setShowcaseImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const logoRef = useRef<HTMLInputElement>(null);
  const showcaseRef = useRef<HTMLInputElement>(null);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [showcaseDragOver, setShowcaseDragOver] = useState(false);

  useEffect(() => {
    if (!brandId) return;
    setLoading(true);
    getBrandById(brandId).then(brand => {
      if (brand) {
        setDeviceTypeId(brand.deviceTypeId); setName(brand.name); setSlug(brand.slug);
        setLogoUrl(brand.logoUrl ?? '');
        setShowcaseImageUrl(brand.showcaseImageUrl ?? '');
        setIsActive(brand.isActive);
      }
    }).finally(() => setLoading(false));
  }, [brandId]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(toSlug(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceTypeId || !name.trim()) return;
    setSaving(true);
    try {
      const dt = devices.find(d => d.id === deviceTypeId);
      const data = {
        deviceTypeId, deviceTypeName: dt?.name ?? '',
        name: name.trim(), slug: slug.trim(),
        logoUrl: logoUrl.trim(),
        showcaseImageUrl: showcaseImageUrl.trim(),
        isActive,
      };
      if (isEdit && brandId) {
        await updateBrand(brandId, data);
        success('Brand updated');
      } else {
        await createBrand(data);
        success('Brand created');
      }
      navigate('/brands');
    } catch {
      toastError('Failed to save brand.');
    } finally {
      setSaving(false);
    }
  };

  const readFile = (file: File, setter: (v: string) => void) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const deviceOptions = [{ value: '', label: 'Select device type...' }, ...devices.map(d => ({ value: d.id, label: d.name }))];

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const UploadZone = ({ label, preview, onFile, inputRef, dragOver, setDragOver, onClear }: {
    label: string; preview: string; onFile: (f: File) => void;
    inputRef: React.RefObject<HTMLInputElement>; dragOver: boolean;
    setDragOver: (v: boolean) => void; onClear: () => void;
  }) => (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2">{label}</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {preview ? (
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl border-2 border-[#e8eaed] bg-gray-50 overflow-hidden shadow-sm">
            <img src={preview} alt={label} className="h-full w-full object-contain p-2" />
            <button type="button" onClick={onClear}
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
              <X size={9} />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1"><CheckCircle2 size={13} className="text-emerald-500" /><span className="text-[12px] font-semibold text-emerald-700">Uploaded</span></div>
            <button type="button" onClick={() => inputRef.current?.click()} className="text-[11px] font-semibold text-red-600 hover:text-red-700">Replace</button>
          </div>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-[#e8eaed] hover:border-blue-300 hover:bg-blue-50/40'}`}>
          <Upload size={18} className={dragOver ? 'text-blue-500' : 'text-[#9aa0a6]'} />
          <p className="text-[12px] font-semibold text-[#5f6368]">Drop or <span className="text-blue-600">browse</span></p>
          <p className="text-[10px] text-[#9aa0a6]">PNG, JPG, WebP</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/brands')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Brands
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[12px] font-bold text-[#202124]">{isEdit ? `Edit "${name}"` : 'New Brand'}</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-200">
            <Layers size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">{isEdit ? 'Edit Brand' : 'New Brand'}</h1>
            <p className="text-[12px] text-[#9aa0a6] mt-0.5">{isEdit ? `Editing "${name}"` : 'Add a new brand to your catalogue'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Device Type */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Device Type <span className="text-red-500">*</span></span>
          </div>
          <div className="p-6">
            <select value={deviceTypeId} onChange={e => setDeviceTypeId(e.target.value)} required
              className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              {deviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="mt-2 text-[10px] text-[#9aa0a6]">Select which device category this brand belongs to</p>
          </div>
        </div>

        {/* Brand Details */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Brand Details</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2">Brand Name <span className="text-red-500">*</span></label>
              <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Apple" required
                className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2">Slug <span className="text-red-500">*</span></label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. apple" required
                className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] font-mono placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              <p className="mt-1.5 text-[10px] text-[#9aa0a6]">Auto-generated · URL-friendly</p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Brand Images</span>
            <span className="ml-2 text-[11px] text-[#9aa0a6]">Optional</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UploadZone label="Logo Image" preview={logoUrl} inputRef={logoRef}
              onFile={f => readFile(f, setLogoUrl)} dragOver={logoDragOver}
              setDragOver={setLogoDragOver} onClear={() => setLogoUrl('')} />
            <UploadZone label="Showcase Image (Thumbnail)" preview={showcaseImageUrl} inputRef={showcaseRef}
              onFile={f => readFile(f, setShowcaseImageUrl)} dragOver={showcaseDragOver}
              setDragOver={setShowcaseDragOver} onClear={() => setShowcaseImageUrl('')} />
          </div>
          <div className="px-6 pb-5 -mt-2">
            <p className="text-[10px] text-[#9aa0a6]">Showcase image is the large phone thumbnail shown on the "Choose brand" page.</p>
          </div>
        </div>

        {/* Active Status */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#202124]">Active Status</p>
              <p className="text-[11px] text-[#9aa0a6] mt-0.5">Active brands are visible on the website</p>
            </div>
            <div onClick={() => setIsActive(p => !p)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => navigate('/brands')}
            className="rounded-xl border border-[#e8eaed] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || !name.trim() || !deviceTypeId}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? <Spinner size="sm" /> : null}
            {isEdit ? 'Save Changes' : 'Create Brand'}
          </button>
        </div>
      </form>
    </div>
  );
}
