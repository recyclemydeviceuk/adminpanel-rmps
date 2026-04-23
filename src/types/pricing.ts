export type RepairCategory =
  | 'screen'
  | 'battery'
  | 'camera'
  | 'back_glass'
  | 'charging_port'
  | 'speaker'
  | 'other';

// Every repair on the site carries a single standard warranty —
// kept as a 1-item list rather than a string so downstream code
// (dropdowns, pills, type guards) continues to work unchanged.
export type WarrantyOption = '12 Months';

export const WARRANTY_OPTIONS: WarrantyOption[] = ['12 Months'];

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
  isActive: boolean;
  updatedAt: string;
}
