import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Cpu, Upload, X, CheckCircle2, PoundSterling } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import ModelPricingSection from './components/ModelPricingSection';
import { useDevices } from '../../hooks/useDevices';
import { useBrands, useModelPricing } from '../../hooks/useCatalog';
import { getModelById, createModel, updateModel, getSeriesByBrand } from '../../lib/catalog';
import { uploadImage } from '../../lib/upload';
import { getRepairTypes } from '../../lib/pricing';
import { useToast } from '../../context/ToastContext';
import type { Series } from '../../types/catalog';
import type { RepairType } from '../../types/pricing';

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function ModelFormPage() {
  const navigate = useNavigate();
  const { modelId } = useParams<{ modelId: string }>();
  const isEdit = !!modelId;
  const { devices } = useDevices();
  const { brands } = useBrands();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [deviceTypeId, setDeviceTypeId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Cascading
  const [filteredBrands, setFilteredBrands] = useState(brands);
  const [seriesOptions, setSeriesOptions] = useState<Series[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);

  // Pricing
  const { pricing: existingPricing, loading: pricingLoading, save: savePricing } = useModelPricing(modelId ?? '');
  const [pricingRows, setPricingRows] = useState<{ repairTypeId: string; repairTypeName: string; category: string; price: string; originalPrice: string; isActive: boolean }[]>([]);

  useEffect(() => { getRepairTypes().then(setRepairTypes); }, []);

  useEffect(() => {
    setFilteredBrands(deviceTypeId ? brands.filter(b => b.deviceTypeId === deviceTypeId) : brands);
  }, [deviceTypeId, brands]);

  useEffect(() => {
    if (brandId) getSeriesByBrand(brandId).then(setSeriesOptions);
    else setSeriesOptions([]);
  }, [brandId]);

  // Load existing model
  useEffect(() => {
    if (!modelId) return;
    setLoading(true);
    getModelById(modelId).then(m => {
      if (m) {
        setDeviceTypeId(m.deviceTypeId); setBrandId(m.brandId);
        setSeriesId(m.seriesId ?? ''); setName(m.name); setSlug(m.slug);
        setImageUrl(m.imageUrl ?? ''); setReleaseYear(String(m.releaseYear ?? ''));
        setIsActive(m.isActive);
      }
    }).finally(() => setLoading(false));
  }, [modelId]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imgDragOver, setImgDragOver] = useState(false);

  useEffect(() => { setImagePreview(imageUrl); }, [imageUrl]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    // Upload to server
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'models');
      setImageUrl(url);
    } catch {
      toastError('Failed to upload image. Try again.');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleDeviceChange = (v: string) => { setDeviceTypeId(v); setBrandId(''); setSeriesId(''); };
  const handleBrandChange = (v: string) => { setBrandId(v); setSeriesId(''); };
  const handleNameChange = (v: string) => { setName(v); if (!isEdit) setSlug(toSlug(v)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceTypeId || !brandId || !name.trim()) return;
    setSaving(true);
    try {
      const dt = devices.find(d => d.id === deviceTypeId);
      const brand = brands.find(b => b.id === brandId);
      const series = seriesOptions.find(s => s.id === seriesId);

      const data = {
        deviceTypeId, deviceTypeName: dt?.name ?? '',
        brandId, brandName: brand?.name ?? '',
        seriesId: seriesId || undefined, seriesName: series?.name,
        name: name.trim(), slug: slug.trim(), imageUrl: imageUrl.trim(),
        repairCount: 0, isActive,
        releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      };

      if (isEdit && modelId) {
        await updateModel(modelId, data);
        // Save pricing
        if (pricingRows.length > 0) {
          const validRows = pricingRows.filter(r => r.price && parseFloat(r.price) > 0).map(r => ({
            repairTypeId: r.repairTypeId, repairTypeName: r.repairTypeName, category: r.category,
            price: parseFloat(r.price), originalPrice: r.originalPrice ? parseFloat(r.originalPrice) : undefined, isActive: r.isActive,
          }));
          if (validRows.length > 0) await savePricing(validRows, name.trim(), brand?.name ?? '');
        }
        success('Model updated');
      } else {
        await createModel(data);
        success('Model created');
      }
      navigate('/models');
    } catch {
      toastError('Failed to save model.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const deviceOptions = [{ value: '', label: 'Select device type...' }, ...devices.map(d => ({ value: d.id, label: d.name }))];
  const brandOpts = [{ value: '', label: 'Select brand...' }, ...filteredBrands.map(b => ({ value: b.id, label: b.name }))];
  const seriesOpts = [{ value: '', label: 'No series (optional)' }, ...seriesOptions.map(s => ({ value: s.id, label: s.name }))];
  const yearOptions = [{ value: '', label: '—' }, ...Array.from({ length: 10 }, (_, i) => { const y = new Date().getFullYear() - i; return { value: String(y), label: String(y) }; })];

  const sc = "w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-40";
  const lc = "block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2";
  const ic = "w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/models')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Models
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[12px] font-bold text-[#202124]">{isEdit ? `Edit "${name}"` : 'New Model'}</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-green-500" />
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-md shadow-green-200">
            <Cpu size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">{isEdit ? 'Edit Model' : 'New Model'}</h1>
            <p className="text-[12px] text-[#9aa0a6] mt-0.5">{isEdit ? `Editing "${name}"` : 'Add a new device model to your catalogue'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Classification — cascading */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5 flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#202124]">Classification</span>
            {!deviceTypeId && <span className="text-[11px] text-amber-600 font-semibold">Start with Device Type</span>}
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={lc}>Device Type <span className="text-red-500">*</span></label>
              <select value={deviceTypeId} onChange={e => handleDeviceChange(e.target.value)} required className={sc}>
                {deviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Brand <span className="text-red-500">*</span></label>
              <select value={brandId} onChange={e => handleBrandChange(e.target.value)} required disabled={!deviceTypeId} className={sc}>
                {brandOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Series <span className="text-[#9aa0a6] normal-case font-normal text-[10px]">optional</span></label>
              <select value={seriesId} onChange={e => setSeriesId(e.target.value)} disabled={!brandId} className={sc}>
                {seriesOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Model Details */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Model Details</span>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lc}>Model Name <span className="text-red-500">*</span></label>
                <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. iPhone 15 Pro" required className={ic} />
              </div>
              <div>
                <label className={lc}>Slug <span className="text-red-500">*</span></label>
                <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. iphone-15-pro" required className={ic + ' font-mono'} />
                <p className="mt-1.5 text-[10px] text-[#9aa0a6]">Auto-generated · URL-friendly</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lc}>Release Year</label>
                <select value={releaseYear} onChange={e => setReleaseYear(e.target.value)} className={sc}>
                  {yearOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div />
            </div>
          </div>
        </div>

        {/* Model Image */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Model Image</span>
            <span className="ml-2 text-[11px] text-[#9aa0a6]">Optional</span>
          </div>
          <div className="p-6">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {imagePreview ? (
              <div className="flex items-center gap-5">
                <div className="relative h-24 w-24 flex-shrink-0 rounded-2xl border-2 border-[#e8eaed] bg-gray-50 overflow-hidden shadow-sm">
                  <img src={imagePreview} alt="Preview" className={`h-full w-full object-contain p-2 transition-opacity ${uploading ? 'opacity-40' : ''}`} />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                      <Spinner size="sm" />
                    </div>
                  )}
                  {!uploading && (
                    <button type="button" onClick={() => { setImagePreview(''); setImageUrl(''); }}
                      className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
                      <X size={9} />
                    </button>
                  )}
                </div>
                <div>
                  {uploading
                    ? <div className="flex items-center gap-1.5"><Spinner size="sm" /><span className="text-[12px] font-semibold text-[#9aa0a6]">Uploading…</span></div>
                    : <>
                        <div className="flex items-center gap-1.5 mb-1.5"><CheckCircle2 size={13} className="text-emerald-500" /><span className="text-[12px] font-semibold text-emerald-700">Image uploaded</span></div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700">Replace</button>
                      </>
                  }
                </div>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setImgDragOver(true); }}
                onDragLeave={() => setImgDragOver(false)}
                onDrop={e => { e.preventDefault(); setImgDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all ${imgDragOver ? 'border-emerald-400 bg-emerald-50' : 'border-[#e8eaed] hover:border-emerald-300 hover:bg-emerald-50/40'}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${imgDragOver ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <Upload size={18} className={imgDragOver ? 'text-emerald-500' : 'text-[#9aa0a6]'} />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-[#202124]">Drop image here or <span className="text-emerald-600">browse</span></p>
                  <p className="text-[11px] text-[#9aa0a6] mt-1">PNG, JPG, WebP up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Repair Pricing — edit mode only */}
        {isEdit && (
          <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5 flex items-center gap-2">
              <PoundSterling size={13} className="text-emerald-600" />
              <span className="text-[13px] font-bold text-[#202124]">Repair Pricing</span>
              <span className="ml-auto text-[11px] text-[#9aa0a6]">Set price per repair type</span>
            </div>
            <div className="p-6">
              {pricingLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <ModelPricingSection repairTypes={repairTypes} existingPricing={existingPricing} onChange={setPricingRows} />
              )}
            </div>
          </div>
        )}

        {/* Active Status */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#202124]">Active Status</p>
              <p className="text-[11px] text-[#9aa0a6] mt-0.5">Active models are shown on the website</p>
            </div>
            <div onClick={() => setIsActive(p => !p)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isActive ? 'bg-emerald-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => navigate('/models')}
            className="rounded-xl border border-[#e8eaed] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading || !name.trim() || !deviceTypeId || !brandId}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? <Spinner size="sm" /> : null}
            {isEdit ? 'Save Changes' : 'Create Model'}
          </button>
        </div>
      </form>
    </div>
  );
}
