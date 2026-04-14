export type AddonCategory = 'protection' | 'warranty' | 'delivery' | 'accessory' | 'other';

export interface Addon {
  id: string;
  name: string;
  description: string;
  category: AddonCategory;
  price: number;
  isActive: boolean;
  isRequired?: boolean;
  imageUrl?: string;
  sortOrder: number;
  createdAt: string;
}
