import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Smartphone, Upload, X, CheckCircle2 } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { getDeviceTypeById, createDeviceType, updateDeviceType } from '../../lib/devices';

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function DeviceFormPage() {
  const navigate = useNavigate();
  const { deviceId } = useParams<{ deviceId: string }>();
  const isEdit = !!deviceId;
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!deviceId) return;
    setLoading(true);
    getDeviceTypeById(deviceId).then(device => {
      if (device) {
        setName(device.name); setSlug(device.slug);
        setImageUrl(device.imageUrl ?? '');
        setImagePreview(device.imageUrl ?? '');
        setIsActive(device.isActive);
      }
    }).finally(() => setLoading(false));
  }, [deviceId]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(toSlug(v));
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isEdit && deviceId) {
        // Never send slug on update — it's immutable after creation
        await updateDeviceType(deviceId, { name: name.trim(), imageUrl, isActive });
        success('Device updated', `${name} has been saved.`);
      } else {
        await createDeviceType({ name: name.trim(), slug: slug.trim(), imageUrl, isActive });
        success('Device created', `${name} has been added.`);
      }
      navigate('/devices');
    } catch {
      toastError('Failed to save device.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/devices')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Devices
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[12px] font-bold text-[#202124]">{isEdit ? `Edit "${name}"` : 'New Device'}</span>
      </div>

      {/* Hero header */}
      <div className="relative rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-400" />
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 shadow-md shadow-red-200">
            <Smartphone size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">{isEdit ? 'Edit Device' : 'New Device'}</h1>
            <p className="text-[12px] text-[#9aa0a6] mt-0.5">{isEdit ? `Editing "${name}"` : 'Add a new device type to your catalogue'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Device Details */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Device Details</span>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2">Device Name <span className="text-red-500">*</span></label>
                <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Phone, Tablet, Watch" required
                  className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2">
                  Slug <span className="text-red-500">*</span>
                  {isEdit && <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wide">Locked</span>}
                </label>
                <input
                  value={slug}
                  onChange={e => !isEdit && setSlug(e.target.value)}
                  placeholder="e.g. phone"
                  required
                  readOnly={isEdit}
                  className={`w-full rounded-xl border px-4 py-3 text-[13px] font-mono placeholder:text-[#c4c9d0] focus:outline-none transition-all ${
                    isEdit
                      ? 'border-[#e8eaed] bg-[#f8fafc] text-[#9aa0a6] cursor-not-allowed'
                      : 'border-[#e8eaed] bg-white text-[#202124] focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  }`}
                />
                <p className="mt-1.5 text-[10px] text-[#9aa0a6]">
                  {isEdit
                    ? 'Slug is immutable after creation — changing it would break customer URLs and the Book-a-Repair flow.'
                    : 'Auto-generated from name · URL-friendly identifier'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Device Image</span>
            <span className="ml-2 text-[11px] text-[#9aa0a6]">Optional</span>
          </div>
          <div className="p-6">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {imagePreview ? (
              <div className="flex items-center gap-5">
                <div className="relative h-28 w-28 flex-shrink-0 rounded-2xl border-2 border-[#e8eaed] bg-gray-50 overflow-hidden shadow-sm">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-3" />
                  <button type="button" onClick={() => { setImagePreview(''); setImageUrl(''); }}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors">
                    <X size={11} />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[13px] font-semibold text-emerald-700">Image uploaded</span>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-[12px] font-semibold text-red-600 hover:text-red-700 transition-colors">
                    Replace image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all ${
                  dragOver ? 'border-red-400 bg-red-50' : 'border-[#e8eaed] hover:border-red-300 hover:bg-red-50/50'
                }`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${dragOver ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <Upload size={20} className={dragOver ? 'text-red-500' : 'text-[#9aa0a6]'} />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-[#202124]">Drop image here or <span className="text-red-600">browse</span></p>
                  <p className="text-[11px] text-[#9aa0a6] mt-1">PNG, JPG, WebP up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Status */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#202124]">Active Status</p>
              <p className="text-[11px] text-[#9aa0a6] mt-0.5">Active devices are visible on the website</p>
            </div>
            <div onClick={() => setIsActive(p => !p)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isActive ? 'bg-red-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => navigate('/devices')}
            className="rounded-xl border border-[#e8eaed] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || !name.trim()}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? <Spinner size="sm" /> : null}
            {isEdit ? 'Save Changes' : 'Create Device'}
          </button>
        </div>
      </form>
    </div>
  );
}
