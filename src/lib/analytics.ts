import type { AnalyticsData } from '../types/analytics';
import api from './api';

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const res = await api.get<{ data: any }>('/analytics');
  const d = res.data.data;
  const summary = d.summary ?? {};

  return {
    summary: {
      totalOrders:         summary.totalOrders ?? 0,
      totalRevenue:        summary.totalRevenue ?? 0,
      avgOrderValue:       summary.averageOrderValue ?? summary.avgOrderValue ?? 0,
      totalCustomers:      summary.totalCustomers ?? 0,
      ordersChange:        summary.ordersChange ?? 0,
      revenueChange:       summary.revenueChange ?? 0,
      avgOrderValueChange: summary.avgOrderValueChange ?? 0,
      customersChange:     summary.customersChange ?? 0,
    },
    revenueOverTime: (d.revenueChart ?? []).map((p: any) => ({
      date:  p.date,
      value: p.revenue ?? p.value ?? 0,
    })),
    ordersOverTime: (d.ordersChart ?? d.revenueChart ?? []).map((p: any) => ({
      date:  p.date,
      value: p.orders ?? p.value ?? 0,
    })),
    topDevices:     d.topDevices ?? [],
    repairTypes:    d.topRepairs ?? d.repairTypes ?? [],
    revenueByBrand: d.topBrands ?? d.revenueByBrand ?? [],
  };
}

export async function getRevenueSummary(): Promise<{ total: number; change: number }> {
  const res = await api.get<{ data: any }>('/analytics/summary');
  const d = res.data.data;
  return { total: d.totalRevenue ?? 0, change: d.revenueChange ?? 0 };
}

export async function getOrdersSummary(): Promise<{ total: number; change: number }> {
  const res = await api.get<{ data: any }>('/analytics/summary');
  const d = res.data.data;
  return { total: d.totalOrders ?? 0, change: d.ordersChange ?? 0 };
}
