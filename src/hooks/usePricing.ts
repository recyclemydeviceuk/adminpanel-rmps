import { useState, useEffect, useCallback } from 'react';
import type { PricingRule, RepairType } from '../types/pricing';
import * as pricingLib from '../lib/pricing';

export function usePricing() {
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, rt] = await Promise.all([pricingLib.getPricing(), pricingLib.getRepairTypes()]);
      setPricing(p);
      setRepairTypes(rt);
    } catch {
      setError('Failed to load pricing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Omit<PricingRule, 'id' | 'updatedAt'>) => {
    const rule = await pricingLib.createPricingRule(data);
    setPricing(prev => [...prev, rule]);
    return rule;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<PricingRule>) => {
    const rule = await pricingLib.updatePricingRule(id, patch);
    setPricing(prev => prev.map(p => p.id === id ? rule : p));
    return rule;
  }, []);

  const remove = useCallback(async (id: string) => {
    await pricingLib.deletePricingRule(id);
    setPricing(prev => prev.filter(p => p.id !== id));
  }, []);

  return { pricing, repairTypes, loading, error, reload: load, create, update, remove };
}
