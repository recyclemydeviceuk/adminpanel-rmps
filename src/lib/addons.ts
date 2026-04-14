import type { Addon } from '../types/addon';
import api from './api';

const map = (d: any): Addon => ({ ...d, id: d._id || d.id });

export async function getAddons(): Promise<Addon[]> {
  const res = await api.get<{ data: any[] }>('/addons');
  return (res.data.data ?? []).map(map);
}

export async function getAddon(id: string): Promise<Addon | null> {
  try {
    const res = await api.get<{ data: any }>(`/addons/${id}`);
    return map(res.data.data);
  } catch { return null; }
}

export async function createAddon(data: Omit<Addon, 'id' | 'createdAt'>): Promise<Addon> {
  const res = await api.post<{ data: any }>('/addons', data);
  return map(res.data.data);
}

export async function updateAddon(id: string, patch: Partial<Addon>): Promise<Addon> {
  const res = await api.put<{ data: any }>(`/addons/${id}`, patch);
  return map(res.data.data);
}

export async function deleteAddon(id: string): Promise<void> {
  await api.delete(`/addons/${id}`);
}

export async function reorderAddons(ids: string[]): Promise<void> {
  await api.post('/addons/reorder', { ids });
}
