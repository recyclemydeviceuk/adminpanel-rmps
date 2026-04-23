import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { getPricingRuleById, createPricingRule, updatePricingRule, getRepairTypes } from '../../lib/pricing';
import { getAllModels } from '../../lib/catalog';
import type { RepairType } from '../../types/pricing';
import type { DeviceModel } from '../../types/catalog';

export default function PricingFormPage() {
  const navigate = useNavigate();
  const { ruleId } = useParams<{ ruleId: string }>();
  const isEdit = !!ruleId;
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);

  const [modelId, setModelId] = useState('');
  const [repairTypeId, setRepairTypeId] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    Promise.all([getAllModels(), getRepairTypes()]).then(([m, rt]) => {
      setModels(m); setRepairTypes(rt);
      if (ruleId) {
        getPricingRuleById(ruleId).then(rule => {
          if (rule) {
            setModelId(rule.modelId); setRepairTypeId(rule.repairTypeId);
            setPrice(String(rule.price));
            setIsActive(rule.isActive);
          }
        });
      }
      setLoading(false);
    });
  }, [ruleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelId || !repairTypeId || !price) return;
    setSaving(true);
    try {
      const model = models.find(m => m.id === modelId)!;
      const rt = repairTypes.find(r => r.id === repairTypeId)!;
      const data = {
        modelId, modelName: model.name, brandName: model.brandName,
        repairTypeId, repairTypeName: rt.name, category: rt.category,
        price: parseFloat(price),
        isActive,
      };
      if (isEdit && ruleId) {
        await updatePricingRule(ruleId, data);
        success('Pricing rule updated');
      } else {
        await createPricingRule(data);
        success('Pricing rule created');
      }
      navigate('/pricing');
    } catch {
      toastError('Failed to save pricing rule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const modelOptions = [{ value: '', label: 'Select model...' }, ...models.map(m => ({ value: m.id, label: `${m.brandName} ${m.name}` }))];
  const rtOptions = [{ value: '', label: 'Select repair type...' }, ...repairTypes.map(r => ({ value: r.id, label: r.name }))];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Pricing Rule' : 'New Pricing Rule'}
        subtitle={isEdit ? 'Update price for a model + repair type combination' : 'Set a price for a specific repair on a device model'}
        backTo="/pricing"
        breadcrumbs={[{ label: 'Pricing', to: '/pricing' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <form onSubmit={handleSubmit}>
        <Card padding="lg" className="mb-5">
          <CardHeader title="Assignment" subtitle="Which model and repair type does this price apply to?" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select label="Device Model" options={modelOptions} value={modelId} onChange={e => setModelId(e.target.value)} required />
            <Select label="Repair Type" options={rtOptions} value={repairTypeId} onChange={e => setRepairTypeId(e.target.value)} required />
          </div>
        </Card>

        <Card padding="lg" className="mb-5">
          <CardHeader title="Pricing" subtitle="This is the price shown to customers on the repair booking page" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Price (£)" type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" required />
          </div>
        </Card>

        <Card padding="lg" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#202124]">Active Status</p>
              <p className="text-[12px] text-[#9aa0a6] mt-0.5">Inactive pricing rules are hidden from customers</p>
            </div>
            <div onClick={() => setIsActive(p => !p)} className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isActive ? 'bg-red-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="md" type="button" onClick={() => navigate('/pricing')}>Cancel</Button>
          <Button variant="primary" size="lg" type="submit" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Pricing Rule'}
          </Button>
        </div>
      </form>
    </div>
  );
}
