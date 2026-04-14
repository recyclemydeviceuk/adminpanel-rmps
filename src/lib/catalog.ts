import type { Brand, Series, DeviceModel } from '../types/catalog';
import api from './api';

const mapBrand   = (d: any): Brand       => ({ ...d, id: d._id || d.id });
const mapSeries  = (d: any): Series      => ({ ...d, id: d._id || d.id });
const mapModel   = (d: any): DeviceModel => ({ ...d, id: d._id || d.id });

/* ── Brand CRUD ──────────────────────────────────────────────── */

export async function getBrands(): Promise<Brand[]> {
  const res = await api.get<{ data: any[] }>('/brands');
  return (res.data.data ?? []).map(mapBrand);
}

export async function getBrandsByDevice(deviceTypeId: string): Promise<Brand[]> {
  const res = await api.get<{ data: any[] }>('/brands', { params: { deviceTypeId } });
  return (res.data.data ?? []).map(mapBrand);
}

export async function getBrand(slug: string): Promise<Brand | null> {
  const all = await getBrands();
  return all.find(b => b.slug === slug) ?? null;
}

export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const res = await api.get<{ data: any }>(`/brands/${id}`);
    return mapBrand(res.data.data);
  } catch { return null; }
}

export async function createBrand(data: Omit<Brand, 'id' | 'createdAt' | 'modelCount'>): Promise<Brand> {
  const res = await api.post<{ data: any }>('/brands', data);
  return mapBrand(res.data.data);
}

export async function updateBrand(id: string, patch: Partial<Brand>): Promise<Brand> {
  const res = await api.put<{ data: any }>(`/brands/${id}`, patch);
  return mapBrand(res.data.data);
}

export async function deleteBrand(id: string): Promise<void> {
  await api.delete(`/brands/${id}`);
}

/* ── Series CRUD ─────────────────────────────────────────────── */

export async function getAllSeries(): Promise<Series[]> {
  const res = await api.get<{ data: any[] }>('/series');
  return (res.data.data ?? []).map(mapSeries);
}

export async function getSeriesById(id: string): Promise<Series | null> {
  try {
    const res = await api.get<{ data: any }>(`/series/${id}`);
    return mapSeries(res.data.data);
  } catch { return null; }
}

export async function getSeriesByBrand(brandId: string): Promise<Series[]> {
  const all = await getAllSeries();
  return all.filter(s => s.brandId === brandId);
}

export async function createSeries(data: Omit<Series, 'id' | 'createdAt' | 'modelCount'>): Promise<Series> {
  const res = await api.post<{ data: any }>('/series', data);
  return mapSeries(res.data.data);
}

export async function updateSeries(id: string, patch: Partial<Series>): Promise<Series> {
  const res = await api.put<{ data: any }>(`/series/${id}`, patch);
  return mapSeries(res.data.data);
}

export async function deleteSeries(id: string): Promise<void> {
  await api.delete(`/series/${id}`);
}

/* ── Model CRUD ──────────────────────────────────────────────── */

export async function getAllModels(): Promise<DeviceModel[]> {
  const res = await api.get<{ data: any[] }>('/models');
  return (res.data.data ?? []).map(mapModel);
}

export async function getModelById(id: string): Promise<DeviceModel | null> {
  try {
    const res = await api.get<{ data: any }>(`/models/${id}`);
    return mapModel(res.data.data);
  } catch { return null; }
}

export async function getModelsByBrand(brandId: string): Promise<DeviceModel[]> {
  const all = await getAllModels();
  return all.filter(m => m.brandId === brandId);
}

export async function getModelsByDevice(deviceTypeId: string): Promise<DeviceModel[]> {
  const all = await getAllModels();
  return all.filter(m => m.deviceTypeId === deviceTypeId);
}

export async function createModel(data: Omit<DeviceModel, 'id' | 'createdAt'>): Promise<DeviceModel> {
  const res = await api.post<{ data: any }>('/models', data);
  return mapModel(res.data.data);
}

export async function updateModel(id: string, patch: Partial<DeviceModel>): Promise<DeviceModel> {
  const res = await api.put<{ data: any }>(`/models/${id}`, patch);
  return mapModel(res.data.data);
}

export async function deleteModel(id: string): Promise<void> {
  await api.delete(`/models/${id}`);
}
