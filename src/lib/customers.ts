import type { Customer, CustomerStatus } from '../types/customer';
import api from './api';

const map = (d: any): Customer => ({
  ...d,
  id: d._id || d.id,
  totalOrders: d.totalOrders ?? 0,
  totalSpent: d.totalSpent ?? 0,
  status: d.status ?? (d.isActive === false ? 'inactive' : 'active'),
});

export async function getCustomers(): Promise<Customer[]> {
  const res = await api.get<{ data: any[] | { data: any[]; meta?: any } }>('/customers');
  const raw = Array.isArray(res.data.data) ? res.data.data : (res.data.data as any).data ?? [];
  return raw.map(map);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const res = await api.get<{ data: any }>(`/customers/${id}`);
    return map(res.data.data);
  } catch { return null; }
}

export async function updateCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
  const res = await api.put<{ data: any }>(`/customers/${id}`, { status });
  return map(res.data.data);
}

export async function updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
  const res = await api.put<{ data: any }>(`/customers/${id}`, patch);
  return map(res.data.data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}

export async function getCustomerOrders(id: string): Promise<any[]> {
  const res = await api.get<{ data: any[] }>(`/customers/${id}/orders`);
  return res.data.data ?? [];
}
