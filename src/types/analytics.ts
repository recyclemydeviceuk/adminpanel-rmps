export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalCustomers: number;
  ordersChange: number;
  revenueChange: number;
  avgOrderValueChange: number;
  customersChange: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  revenueOverTime: TimeSeriesDataPoint[];
  ordersOverTime: TimeSeriesDataPoint[];
  topDevices: ChartDataPoint[];
  repairTypes: ChartDataPoint[];
  revenueByBrand: ChartDataPoint[];
}
