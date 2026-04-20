export type RepairCategory =
  | 'screen'
  | 'battery'
  | 'camera'
  | 'back_glass'
  | 'charging_port'
  | 'speaker'
  | 'other';

export type WarrantyOption = '30 Days' | '90 Days' | '6 Months' | '12 Months' | '1 Year' | 'Lifetime';

export const WARRANTY_OPTIONS: WarrantyOption[] = ['30 Days', '90 Days', '6 Months', '12 Months', '1 Year', 'Lifetime'];

export interface RepairType {
  id: string;
  name: string;
  slug: string;
  category: RepairCategory;
  description?: string;
  warranty?: WarrantyOption | '';
  imageUrl?: string;
  isActive: boolean;
}

export interface PricingRule {
  id: string;
  modelId: string;
  modelName: string;
  brandName: string;
  repairTypeId: string;
  repairTypeName: string;
  category: RepairCategory;
  price: number;
  originalPrice?: number;
  isActive: boolean;
  updatedAt: string;
}
