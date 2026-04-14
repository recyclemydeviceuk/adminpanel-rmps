export type CustomerStatus = 'active' | 'inactive' | 'banned';

export interface CustomerAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: CustomerAddress;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: CustomerStatus;
  createdAt: string;
}
