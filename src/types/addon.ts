export type AddonCategory = 'protection' | 'warranty' | 'delivery' | 'accessory' | 'other';

export interface AddonColorOption {
  name: string;
  hex: string;
  imageUrl?: string;
}

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
  colors?: AddonColorOption[];
  createdAt: string;
}
