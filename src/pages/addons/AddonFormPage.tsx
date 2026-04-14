import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Upload, X, CheckCircle2, PoundSterling } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { getAddon, createAddon, updateAddon, getAddons } from '../../lib/addons';
import { uploadImage } from '../../lib/upload';
import type { AddonCategory } from '../../types/addon';

export default function AddonFormPage() {
  const navigate = useNavigate();
  const { addonId } = useParams<{ addonId: string }>();
  const isEdit = !!addonId;
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imgDragOver, setImgDragOver] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [sortOrder, setSortOrder] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!addonId) {
      getAddons().then(all => setSortOrder(all.length + 1));
      return;
    }
    setLoading(true);
    getAddon(addonId).then(a => {
      if (a) {
        setName(a.name); setDescription(a.description);
        setPrice(String(a.price)); setIsActive(a.isActive);
        setIsRequired(!!a.isRequired); setSortOrder(a.sortOrder);
        if ((a as any).imageUrl) { setImageUrl((a as any).imageUrl); setImagePreview((a as any).imageUrl); }
      }
    }).finally(() => setLoading(false));
  }, [addonId]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Show instant local preview while uploading to S3
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'addons');
      setImageUrl(url);
      setImagePreview(url); // replace local preview with real S3 URL
      success('Image uploaded — click Save to apply');
    } catch {
      toastError('Image upload failed. Please try again.');
      setImagePreview(imageUrl); // revert to previous if upload fails
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setSaving(true);
    try {
      const data: Parameters<typeof createAddon>[0] = {
        name: name.trim(), description: description.trim(),
        category: 'other' as AddonCategory,
        price: parseFloat(price), isActive, isRequired, sortOrder,
        ...(imageUrl ? { imageUrl } : {}),
      };
      if (isEdit && addonId) {
        await updateAddon(addonId, data);
        success('Add-on updated');
      } else {
        await createAddon(data);
        success('Add-on created');
      }
      navigate('/addons');
    } catch {
      toastError('Failed to save add-on.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const ic = "w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all";
  const lc = "block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2";

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/addons')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Add-ons
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[12px] font-bold text-[#202124]">{isEdit ? `Edit "${name}"` : 'New Add-on'}</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-md shadow-pink-200">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">
              {isEdit ? 'Edit Add-on' : 'New Add-on'}
            </h1>
            <p className="text-[12px] text-[#9aa0a6] mt-0.5">
              {isEdit ? `Editing "${name}"` : 'Create an optional add-on service'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Add-on Details */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Add-on Details</span>
          </div>
          <div className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className={lc}>Name <span className="text-red-500">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Tempered Glass Screen Protector" required className={ic} />
            </div>
            {/* Description */}
            <div>
              <label className={lc}>Description <span className="text-red-500">*</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of this add-on..." rows={4} required
                className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none transition-all" />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Add-on Image</span>
            <span className="ml-2 text-[11px] text-[#9aa0a6]">Optional</span>
          </div>
          <div className="p-6">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {imagePreview ? (
              <div className="flex items-center gap-5">
                <div className="relative h-24 w-24 flex-shrink-0 rounded-2xl border-2 border-[#e8eaed] bg-gray-50 overflow-hidden shadow-sm">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-2" />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
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
                  {uploading ? (
                    <p className="text-[12px] text-[#9aa0a6] mb-1.5">Uploading to S3…</p>
                  ) : (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-[12px] font-semibold text-emerald-700">Uploaded to S3</span>
                    </div>
                  )}
                  {!uploading && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[11px] font-semibold text-pink-600 hover:text-pink-700">
                      Replace
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setImgDragOver(true); }}
                onDragLeave={() => setImgDragOver(false)}
                onDrop={e => { e.preventDefault(); setImgDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all ${imgDragOver ? 'border-pink-400 bg-pink-50' : 'border-[#e8eaed] hover:border-pink-300 hover:bg-pink-50/40'}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${imgDragOver ? 'bg-pink-100' : 'bg-gray-100'}`}>
                  <Upload size={18} className={imgDragOver ? 'text-pink-500' : 'text-[#9aa0a6]'} />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-[#202124]">Drop image here or <span className="text-pink-600">browse</span></p>
                  <p className="text-[11px] text-[#9aa0a6] mt-1">PNG, JPG, WebP · max 5 MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5 flex items-center gap-2">
            <PoundSterling size={13} className="text-pink-500" />
            <span className="text-[13px] font-bold text-[#202124]">Pricing</span>
          </div>
          <div className="p-6">
            <label className={lc}>Price (£) <span className="text-red-500">*</span></label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#9aa0a6]">£</span>
              <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="0.00" required
                className="w-full rounded-xl border border-[#e8eaed] bg-white pl-8 pr-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" />
            </div>
            <p className="mt-2 text-[10px] text-[#9aa0a6]">Price charged to customer for this add-on</p>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Settings</span>
            <p className="text-[11px] text-[#9aa0a6] mt-0.5">Control visibility and behavior</p>
          </div>
          <div className="divide-y divide-[#f1f3f4]">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-[13px] font-bold text-[#202124]">Active</p>
                <p className="text-[11px] text-[#9aa0a6] mt-0.5">Visible to customers during checkout</p>
              </div>
              <div onClick={() => setIsActive(p => !p)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isActive ? 'bg-pink-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-[13px] font-bold text-[#202124]">Required</p>
                <p className="text-[11px] text-[#9aa0a6] mt-0.5">Automatically added to all orders</p>
              </div>
              <div onClick={() => setIsRequired(p => !p)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isRequired ? 'bg-pink-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isRequired ? 'translate-x-5' : ''}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => navigate('/addons')}
            className="rounded-xl border border-[#e8eaed] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading || !name.trim() || !price}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {(saving || uploading) ? <Spinner size="sm" /> : null}
            {uploading ? 'Uploading image…' : saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Add-on'}
          </button>
        </div>
      </form>
    </div>
  );
}
