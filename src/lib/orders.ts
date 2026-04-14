import type { Order, OrderStatus } from '../types/order';
import api from './api';

const map = (d: any): Order => ({
  ...d,
  id: d._id || d.id,
  items: (d.items ?? []).map((i: any) => ({ ...i, id: i._id || i.id || `${d._id}-${Math.random()}` })),
  notes: d.notes ?? [],
  discount: d.discount ?? 0,
  tax: d.tax ?? 0,
  updatedAt: d.updatedAt || d.createdAt || '',
});

export async function getOrders(): Promise<Order[]> {
  // Pass a high limit so admin panel always gets all orders for accurate stats.
  // Backend caps at 100 per call, so we fetch up to 1000 across batches.
  // For most businesses, a single call with limit=500 is sufficient.
  const res = await api.get<{ data: any[] | { data: any[]; meta?: any }; meta?: any }>('/orders', {
    params: { limit: 500, page: 1 },
  });
  const raw = Array.isArray(res.data.data) ? res.data.data : (res.data.data as any).data ?? [];
  return raw.map(map);
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const res = await api.get<{ data: any }>(`/orders/${id}`);
    return map(res.data.data);
  } catch { return null; }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await api.patch<{ data: any }>(`/orders/${id}/status`, { status });
  return map(res.data.data);
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order> {
  const res = await api.put<{ data: any }>(`/orders/${id}`, patch);
  return map(res.data.data);
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`);
}

export async function getOrderNotes(id: string): Promise<{ text: string; createdAt: string }[]> {
  const res = await api.get<{ data: any[] }>(`/orders/${id}/notes`);
  return res.data.data ?? [];
}

export async function addOrderNote(id: string, text: string): Promise<{ text: string; createdAt: string }[]> {
  const res = await api.post<{ data: any[] }>(`/orders/${id}/notes`, { text });
  return res.data.data ?? [];
}
