export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod = 'paypal';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PostageType = 'print-label' | 'send-pack' | 'collection';

export interface OrderItem {
  id: string;
  repairType: string;
  deviceModel: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  device: string;
  brand: string;
  model: string;
  repairType: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  postageType?: PostageType;
  collectionAddress?: string;
  collectionPostcode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
