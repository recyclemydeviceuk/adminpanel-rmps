import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Wrench, Upload, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { getRepairTypeById, createRepairType, updateRepairType } from '../../lib/pricing';
import { uploadImage } from '../../lib/upload';
import type { RepairCategory, WarrantyOption } from '../../types/pricing';

function categoryFromName(name: string): RepairCategory {
  const n = name.toLowerCase();
  if (n.includes('screen') || n.includes('front')) return 'screen';
  if (n.includes('battery') || n.includes('charging')) return 'battery';
  if (n.includes('camera')) return 'camera';
  if (n.includes('back') || n.includes('cover') || n.includes('glass')) return 'back_glass';
  if (n.includes('diagnostic')) return 'charging_port';
  if (n.includes('speaker') || n.includes('earpiece')) return 'speaker';
  return 'other';
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function RepairFormPage() {
  const navigate = useNavigate();
  const { repairId } = useParams<{ repairId: string }>();
  const isEdit = !!repairId;
  const { success, error: toastError } = useToast();

  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName]           = useState('');
  const [slug, setSlug]           = useState('');
  const [description, setDescription] = useState('');
  // Every repair on the site now carries a single standard 12-month
  // warranty — we still keep the field in state so the API payload is
  // unchanged, but admin can't pick anything else.
  const [warranty, setWarranty]   = useState<WarrantyOption>('12 Months');
  const [imageUrl, setImageUrl]   = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imgDragOver, setImgDragOver]   = useState(false);
  const [isActive, setIsActive]   = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!repairId) return;
    setLoading(true);
    getRepairTypeById(repairId).then(rt => {
      if (rt) {
        setName(rt.name);
        setSlug(rt.slug);
        setDescription(rt.description ?? '');
        // All repairs now carry a 12-month warranty regardless of stored value.
        setWarranty('12 Months');
        setImageUrl(rt.imageUrl ?? '');
        setImagePreview(rt.imageUrl ?? '');
        setIsActive(rt.isActive);
      }
    }).finally(() => setLoading(false));
  }, [repairId]);

  // Keep preview in sync when imageUrl is set externally (on load)
  useEffect(() => { setImagePreview(imageUrl); }, [imageUrl]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(toSlug(v));
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    // Instant local preview
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    // Upload to S3
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'repairs');
      setImageUrl(url);
    } catch {
      toastError('Failed to upload image. Try again.');
      setImagePreview(imageUrl); // revert to previous
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data = {
        name:        name.trim(),
        slug:        slug.trim(),
        category:    categoryFromName(name.trim()),
        description: description.trim() || undefined,
        warranty:    warranty || undefined,
        imageUrl:    imageUrl.trim() || undefined,
        isActive,
      };
      if (isEdit && repairId) {
        await updateRepairType(repairId, data);
        success('Repair type updated');
      } else {
        await createRepairType(data);
        success('Repair type created');
      }
      navigate('/repairs');
    } catch {
      toastError('Failed to save repair type.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const ic = "w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all";
  const lc = "block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2";

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/repairs')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Repairs
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[12px] font-bold text-[#202124]">{isEdit ? `Edit "${name}"` : 'New Repair Type'}</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-red-500" />
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-md shadow-red-200">
            <Wrench size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">
              {isEdit ? 'Edit Repair Type' : 'New Repair Type'}
            </h1>
            <p className="text-[12px] text-[#9aa0a6] mt-0.5">
              {isEdit ? `Editing "${name}"` : 'Add a new repair service type'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Repair Details */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Repair Details</span>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lc}>Name <span className="text-red-500">*</span></label>
                <input
                  value={name} onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Front Screen" required className={ic}
                />
              </div>
              <div>
                <label className={lc}>Slug <span className="text-red-500">*</span></label>
                <input
                  value={slug} onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. front-screen" required className={ic + ' font-mono'}
                />
                <p className="mt-1.5 text-[10px] text-[#9aa0a6]">Auto-generated · URL-friendly</p>
              </div>
            </div>
            <div>
              <label className={lc}>
                Repair Description
                <span className="text-[#9aa0a6] normal-case font-normal text-[10px] ml-1">shown on the website repair card</span>
              </label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Cracked or damaged display? We can replace the screen and restore touch response and clarity."
                rows={4}
                className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
              />
            </div>

            {/* Warranty Duration — fixed site-wide */}
            <div className="rounded-xl border border-[#e8eaed] bg-[#fafbfc] p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={15} className="text-orange-500" />
                <span className={lc + ' mb-0'}>Warranty Duration</span>
                <span className="text-[10px] text-[#9aa0a6]">fixed for every repair on the site</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5">
                <ShieldCheck size={15} className="text-orange-600" />
                <span className="text-[13px] font-bold text-orange-700">12 Months</span>
              </div>
              <p className="mt-2.5 text-[11px] text-[#5f6368] leading-relaxed">
                Every repair is covered by our standard 12-month warranty. This is applied automatically — no other options are supported.
              </p>
            </div>
          </div>
        </div>

        {/* Repair Image */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Repair Image</span>
            <span className="ml-2 text-[11px] text-[#9aa0a6]">Optional · Shows on the repair selection page</span>
          </div>
          <div className="p-6 max-w-xs">
            <input
              ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {imagePreview ? (
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl border-2 border-[#e8eaed] bg-gray-50 overflow-hidden shadow-sm">
                  <img src={imagePreview} alt="Repair" className="h-full w-full object-contain p-2" />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Spinner size="sm" />
                    </div>
                  )}
                  {!uploading && (
                    <button type="button" onClick={() => { setImageUrl(''); setImagePreview(''); }}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
                      <X size={9} />
                    </button>
                  )}
                </div>
                <div>
                  {!uploading && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-[12px] font-semibold text-emerald-700">Uploaded</span>
                    </div>
                  )}
                  {uploading && <p className="text-[12px] text-[#9aa0a6] mb-1">Uploading…</p>}
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-orange-600 hover:text-orange-700">
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setImgDragOver(true); }}
                onDragLeave={() => setImgDragOver(false)}
                onDrop={e => { e.preventDefault(); setImgDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all ${imgDragOver ? 'border-orange-400 bg-orange-50' : 'border-[#e8eaed] hover:border-orange-300 hover:bg-orange-50/40'}`}>
                <Upload size={18} className={imgDragOver ? 'text-orange-500' : 'text-[#9aa0a6]'} />
                <p className="text-[12px] font-semibold text-[#5f6368]">Drop or <span className="text-orange-600">browse</span></p>
                <p className="text-[10px] text-[#9aa0a6]">PNG, JPG, WebP</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Status */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#202124]">Active Status</p>
              <p className="text-[11px] text-[#9aa0a6] mt-0.5">Active repair types are available for pricing</p>
            </div>
            <div onClick={() => setIsActive(p => !p)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isActive ? 'bg-orange-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => navigate('/repairs')}
            className="rounded-xl border border-[#e8eaed] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading || !name.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {saving ? <Spinner size="sm" /> : null}
            {isEdit ? 'Save Changes' : 'Create Repair Type'}
          </button>
        </div>
      </form>
    </div>
  );
}
