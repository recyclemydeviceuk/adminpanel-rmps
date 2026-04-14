import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, GitBranch } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useBrands } from '../../hooks/useCatalog';
import { useToast } from '../../context/ToastContext';
import { getSeriesById, createSeries, updateSeries } from '../../lib/catalog';

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function SeriesFormPage() {
  const navigate = useNavigate();
  const { seriesId } = useParams<{ seriesId: string }>();
  const isEdit = !!seriesId;
  const { brands } = useBrands();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [brandId, setBrandId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!seriesId) return;
    setLoading(true);
    getSeriesById(seriesId).then(s => {
      if (s) { setBrandId(s.brandId); setName(s.name); setSlug(s.slug); setIsActive(s.isActive); }
    }).finally(() => setLoading(false));
  }, [seriesId]);

  const handleNameChange = (v: string) => { setName(v); if (!isEdit) setSlug(toSlug(v)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId || !name.trim()) return;
    setSaving(true);
    try {
      const brand = brands.find(b => b.id === brandId);
      const data = { brandId, brandName: brand?.name ?? '', name: name.trim(), slug: slug.trim(), isActive };
      if (isEdit && seriesId) { await updateSeries(seriesId, data); success('Series updated'); }
      else { await createSeries(data); success('Series created'); }
      navigate('/series');
    } catch { toastError('Failed to save series.'); }
    finally { setSaving(false); }
  };

  const brandOptions = [{ value: '', label: 'Select brand...' }, ...brands.filter(b => b.isActive).map(b => ({ value: b.id, label: `${b.name} (${b.deviceTypeName})` }))];

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/series')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Series
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[12px] font-bold text-[#202124]">{isEdit ? `Edit "${name}"` : 'New Series'}</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-purple-200">
            <GitBranch size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">{isEdit ? 'Edit Series' : 'New Series'}</h1>
            <p className="text-[12px] text-[#9aa0a6] mt-0.5">{isEdit ? `Editing "${name}"` : 'Group models into a series'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Brand Selector */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Brand <span className="text-red-500">*</span></span>
          </div>
          <div className="p-6">
            <select value={brandId} onChange={e => setBrandId(e.target.value)} required
              className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
              {brandOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="mt-2 text-[10px] text-[#9aa0a6]">Select which brand this series belongs to</p>
          </div>
        </div>

        {/* Series Details */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Series Details</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2">Series Name <span className="text-red-500">*</span></label>
              <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. iPhone 15 Series" required
                className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2">Slug <span className="text-red-500">*</span></label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. iphone-15-series" required
                className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] font-mono placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
              <p className="mt-1.5 text-[10px] text-[#9aa0a6]">Auto-generated · URL-friendly</p>
            </div>
          </div>
        </div>

        {/* Active Status */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#202124]">Active Status</p>
              <p className="text-[11px] text-[#9aa0a6] mt-0.5">Active series are visible on the website</p>
            </div>
            <div onClick={() => setIsActive(p => !p)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isActive ? 'bg-violet-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => navigate('/series')}
            className="rounded-xl border border-[#e8eaed] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || !name.trim() || !brandId}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? <Spinner size="sm" /> : null}
            {isEdit ? 'Save Changes' : 'Create Series'}
          </button>
        </div>
      </form>
    </div>
  );
}
