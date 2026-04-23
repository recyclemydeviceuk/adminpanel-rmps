import type { PricingRule, RepairType } from '../types/pricing';
import api from './api';

const mapRule = (d: any): PricingRule => ({ ...d, id: d._id || d.id, updatedAt: d.updatedAt || d.createdAt || '' });
const mapRT   = (d: any): RepairType => ({ ...d, id: d._id || d.id });

/* ── Pricing Rules ───────────────────────────────────────────── */

export async function getPricing(): Promise<PricingRule[]> {
  const res = await api.get<{ data: any[] }>('/pricing');
  return (res.data.data ?? []).map(mapRule);
}

export async function getPricingByModel(modelId: string): Promise<PricingRule[]> {
  const res = await api.get<{ data: any[] }>(`/pricing/model/${modelId}`);
  return (res.data.data ?? []).map(mapRule);
}

export async function getPricingRuleById(id: string): Promise<PricingRule | null> {
  try {
    const res = await api.get<{ data: any }>(`/pricing/${id}`);
    return mapRule(res.data.data);
  } catch { return null; }
}

export async function createPricingRule(data: Omit<PricingRule, 'id' | 'updatedAt'>): Promise<PricingRule> {
  const res = await api.post<{ data: any }>('/pricing', data);
  return mapRule(res.data.data);
}

export async function updatePricingRule(id: string, patch: Partial<PricingRule>): Promise<PricingRule> {
  const res = await api.put<{ data: any }>(`/pricing/${id}`, patch);
  return mapRule(res.data.data);
}

export async function deletePricingRule(id: string): Promise<void> {
  await api.delete(`/pricing/${id}`);
}

/**
 * Upsert a full list of repair-type prices for a single device model.
 *
 * For each row:
 *   - if a PricingRule already exists for (modelId, repairTypeId) → update it
 *   - otherwise, if the price is > 0 → create a new rule
 *   - if the price is empty/0 and no rule exists → skip (nothing to delete)
 *
 * Works for both the "Edit Model" and "Create Model" flows — the caller
 * passes the modelId (new or existing) after the DeviceModel has been saved.
 */
export async function saveModelPricing(
  modelId:   string,
  modelName: string,
  brandName: string,
  rows: {
    repairTypeId:   string;
    repairTypeName: string;
    category:       string;
    price:          number;
    isActive:       boolean;
  }[],
  existing: PricingRule[],
): Promise<void> {
  for (const row of rows) {
    const match = existing.find(p => p.repairTypeId === row.repairTypeId);
    if (match) {
      // Update even if price didn't change — the isActive toggle may have.
      await updatePricingRule(match.id, {
        price:    row.price,
        isActive: row.isActive,
      });
    } else if (row.price > 0) {
      await createPricingRule({
        modelId,
        modelName,
        brandName,
        repairTypeId:   row.repairTypeId,
        repairTypeName: row.repairTypeName,
        category:       row.category as PricingRule['category'],
        price:          row.price,
        isActive:       row.isActive,
      });
    }
  }
}

/* ── Repair Types ────────────────────────────────────────────── */

export async function getRepairTypes(): Promise<RepairType[]> {
  const res = await api.get<{ data: any[] }>('/repair-types');
  return (res.data.data ?? []).map(mapRT);
}

export async function getRepairTypeById(id: string): Promise<RepairType | null> {
  try {
    const res = await api.get<{ data: any }>(`/repair-types/${id}`);
    return mapRT(res.data.data);
  } catch { return null; }
}

export async function createRepairType(data: Omit<RepairType, 'id'>): Promise<RepairType> {
  const res = await api.post<{ data: any }>('/repair-types', data);
  return mapRT(res.data.data);
}

export async function updateRepairType(id: string, patch: Partial<RepairType>): Promise<RepairType> {
  const res = await api.put<{ data: any }>(`/repair-types/${id}`, patch);
  return mapRT(res.data.data);
}

export async function deleteRepairType(id: string): Promise<void> {
  await api.delete(`/repair-types/${id}`);
}
