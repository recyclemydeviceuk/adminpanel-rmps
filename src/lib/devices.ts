import type { DeviceType } from '../types/catalog';
import api from './api';

// Map backend _id → frontend id
const map = (d: any): DeviceType => ({ ...d, id: d._id || d.id });

export async function getDeviceTypes(): Promise<DeviceType[]> {
  const res = await api.get<{ data: any[] }>('/device-types');
  return (res.data.data ?? []).map(map);
}

export async function getDeviceType(slug: string): Promise<DeviceType | null> {
  const all = await getDeviceTypes();
  return all.find(d => d.slug === slug) ?? null;
}

export async function getDeviceTypeById(id: string): Promise<DeviceType | null> {
  try {
    const res = await api.get<{ data: any }>(`/device-types/${id}`);
    return map(res.data.data);
  } catch { return null; }
}

export async function createDeviceType(data: Omit<DeviceType, 'id' | 'createdAt' | 'brandCount'>): Promise<DeviceType> {
  const res = await api.post<{ data: any }>('/device-types', data);
  return map(res.data.data);
}

export async function updateDeviceType(id: string, patch: Partial<DeviceType>): Promise<DeviceType> {
  const res = await api.put<{ data: any }>(`/device-types/${id}`, patch);
  return map(res.data.data);
}

export async function deleteDeviceType(id: string): Promise<void> {
  await api.delete(`/device-types/${id}`);
}
