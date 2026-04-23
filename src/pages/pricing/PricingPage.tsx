import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import Badge from '../../components/ui/Badge';
import Table, { type TableColumn } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import Tabs from '../../components/ui/Tabs';
import { usePricing } from '../../hooks/usePricing';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/currency';
import type { PricingRule, RepairCategory } from '../../types/pricing';

const PAGE_SIZE = 15;

const CATEGORIES: { key: RepairCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'screen', label: 'Screen' },
  { key: 'battery', label: 'Battery' },
  { key: 'camera', label: 'Camera' },
  { key: 'back_glass', label: 'Back Glass' },
  { key: 'charging_port', label: 'Charging Port' },
  { key: 'speaker', label: 'Speaker' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { pricing, loading, remove } = usePricing();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<RepairCategory | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => pricing.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.modelName.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q) || p.repairTypeName.toLowerCase().includes(q);
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  }), [pricing, search, category]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<RepairCategory | 'all', number>> = { all: pricing.length };
    pricing.forEach(p => { counts[p.category] = (counts[p.category] ?? 0) + 1; });
    return counts;
  }, [pricing]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (rule: PricingRule) => {
    if (!confirm(`Delete pricing for ${rule.modelName} — ${rule.repairTypeName}?`)) return;
    try { await remove(rule.id); success('Pricing rule deleted'); }
    catch { toastError('Failed to delete.'); }
  };

  const tabs = CATEGORIES.map(c => ({ key: c.key, label: c.label, count: categoryCounts[c.key] }));

  const columns: TableColumn<PricingRule>[] = [
    { key: 'brandName', header: 'Brand', render: row => <span className="font-medium text-[#202124]">{row.brandName}</span> },
    { key: 'modelName', header: 'Model', render: row => <span className="text-[#5f6368]">{row.modelName}</span> },
    { key: 'repairTypeName', header: 'Repair', render: row => <span className="text-[#5f6368]">{row.repairTypeName}</span> },
    {
      key: 'price', header: 'Price', align: 'right',
      render: row => (
        <div className="text-right">
          <span className="font-bold text-[#202124]">{formatCurrency(row.price)}</span>
        </div>
      ),
    },
    {
      key: 'isActive', header: 'Status',
      render: row => <Badge variant={row.isActive ? 'success' : 'default'} dot>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'id', header: '', align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => navigate(`/pricing/${row.id}/edit`)} className="flex h-8 w-8 items-center justify-center rounded-xl text-[#5f6368] hover:bg-gray-100 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => handleDelete(row)} className="flex h-8 w-8 items-center justify-center rounded-xl text-[#5f6368] hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pricing"
        subtitle={`${pricing.length} pricing rules`}
        actions={<Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={() => navigate('/pricing/new')}>Add Pricing Rule</Button>}
      />

      <div className="space-y-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by brand, model or repair..." className="max-w-md" />
        <Tabs tabs={tabs} active={category} onChange={k => { setCategory(k as RepairCategory | 'all'); setPage(1); }} variant="underline" />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Tag} title="No pricing rules found" actionLabel="Add Pricing Rule" onAction={() => navigate('/pricing/new')} />
      ) : (
        <Card padding="none">
          <Table<PricingRule> columns={columns} data={paginated} keyExtractor={row => row.id} />
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#f3f4f6]">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
