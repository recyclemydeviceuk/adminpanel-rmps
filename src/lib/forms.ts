import api from './api';

/* ── Types ────────────────────────────────────────────────────── */

export interface NewsletterSubmission {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface WarrantySubmission {
  id: string;
  name: string;
  email: string;
  deviceBrand: string;
  deviceModel: string;
  claimInfo: string;
  orderReference?: string;
  status: string;
  createdAt: string;
}

const mapId = (d: any) => ({ ...d, id: d._id || d.id });

/* ── Newsletter ───────────────────────────────────────────────── */

export async function getNewsletterSubmissions(): Promise<NewsletterSubmission[]> {
  const res = await api.get<{ data: any[] }>('/forms/newsletter');
  return (res.data.data ?? []).map(mapId);
}

/* ── Contact ──────────────────────────────────────────────────── */

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const res = await api.get<{ data: any[] }>('/forms/contact');
  return (res.data.data ?? []).map(mapId);
}

export async function updateContactStatus(id: string, status: string): Promise<ContactSubmission> {
  const res = await api.patch<{ data: any }>(`/forms/contact/${id}/status`, { status });
  return mapId(res.data.data);
}

/* ── Warranty ─────────────────────────────────────────────────── */

export async function getWarrantySubmissions(): Promise<WarrantySubmission[]> {
  const res = await api.get<{ data: any[] }>('/forms/warranty');
  return (res.data.data ?? []).map(mapId);
}

export async function updateWarrantyStatus(id: string, status: string): Promise<WarrantySubmission> {
  const res = await api.patch<{ data: any }>(`/forms/warranty/${id}/status`, { status });
  return mapId(res.data.data);
}
