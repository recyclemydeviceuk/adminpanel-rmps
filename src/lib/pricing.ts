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
