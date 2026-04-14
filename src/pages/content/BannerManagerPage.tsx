import { useState } from 'react';
import { Plus, Image, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

const INITIAL_BANNERS: Banner[] = [
  { id: 'banner-001', title: 'Same Day Screen Repair', subtitle: 'Get your phone fixed in under 2 hours', imageUrl: '', linkUrl: '/repairs', isActive: true, sortOrder: 1 },
  { id: 'banner-002', title: 'Free Quote in 60 Seconds', subtitle: 'No commitment — instant price check', imageUrl: '', linkUrl: '/quote', isActive: true, sortOrder: 2 },
  { id: 'banner-003', title: 'UK-Wide Collection Service', subtitle: 'We come to you, repair, and return', imageUrl: '', isActive: false, sortOrder: 3 },
];

export default function BannerManagerPage() {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '' });
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  const openCreate = () => {
    setEditBanner(null);
    setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '' });
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditBanner(banner);
    setForm({ title: banner.title, subtitle: banner.subtitle ?? '', imageUrl: banner.imageUrl, linkUrl: banner.linkUrl ?? '' });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    if (editBanner) {
      setBanners(prev => prev.map(b => b.id === editBanner.id ? { ...b, ...form } : b));
      success('Banner updated');
    } else {
      setBanners(prev => [...prev, { id: `banner-${Date.now()}`, ...form, isActive: true, sortOrder: prev.length + 1 }]);
      success('Banner added');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = (banner: Banner) => {
    if (!confirm(`Delete "${banner.title}"?`)) return;
    setBanners(prev => prev.filter(b => b.id !== banner.id));
    success('Banner deleted');
  };

  const handleToggle = (banner: Banner) => {
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Banners"
        subtitle="Manage homepage and promotional banners"
        breadcrumbs={[{ label: 'Content', to: '/content' }, { label: 'Banners' }]}
        actions={
          <Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={openCreate}>
            Add Banner
          </Button>
        }
      />

      <Card padding="md">
        <CardHeader title="Active Banners" subtitle="Banners are displayed in order on the website" />
        {banners.length === 0 ? (
          <EmptyState icon={Image} title="No banners" description="Add a banner to display on your website." actionLabel="Add Banner" onAction={openCreate} />
        ) : (
          <div className="space-y-3">
            {banners.map(banner => (
              <div key={banner.id} className={`flex items-center gap-4 p-4 rounded-xl border ${banner.isActive ? 'border-[#e8eaed]' : 'border-dashed border-[#e8eaed] opacity-60'}`}>
                <div className="flex h-14 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-[#e8eaed] overflow-hidden">
                  {banner.imageUrl ? (
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <Image size={20} className="text-[#9aa0a6]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[13px] text-[#202124] truncate">{banner.title}</p>
                    <Badge variant={banner.isActive ? 'success' : 'default'} dot>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {banner.subtitle && <p className="text-[12px] text-[#5f6368] truncate mt-0.5">{banner.subtitle}</p>}
                  {banner.linkUrl && <p className="text-[11px] text-blue-600 truncate mt-0.5">→ {banner.linkUrl}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggle(banner)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f6368] hover:bg-gray-100 transition-colors">
                    {banner.isActive ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => openEdit(banner)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f6368] hover:bg-gray-100 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(banner)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f6368] hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editBanner ? 'Edit Banner' : 'Add Banner'} size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" size="md" form="banner-form" type="submit" loading={saving}>
              {editBanner ? 'Save Changes' : 'Add Banner'}
            </Button>
          </div>
        }
      >
        <form id="banner-form" onSubmit={handleSave} className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Same Day Screen Repair" required />
          <Input label="Subtitle" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Optional subtitle text" />
          <Input label="Image URL" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." hint="Link to banner image" />
          <Input label="Link URL" value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="/repairs or https://..." hint="Where clicking the banner takes the user" />
        </form>
      </Modal>
    </div>
  );
}
