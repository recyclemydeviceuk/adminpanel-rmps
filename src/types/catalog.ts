/* ── Device Type ────────────────────────────────────────────── */
export interface DeviceType {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  brandCount: number;
  isActive: boolean;
  createdAt: string;
}

/* ── Brand ──────────────────────────────────────────────────── */
export interface Brand {
  id: string;
  deviceTypeId: string;
  deviceTypeName: string;
  name: string;
  slug: string;
  logoUrl?: string;
  showcaseImageUrl?: string;
  modelCount: number;
  isActive: boolean;
  createdAt: string;
}

/* ── Series ─────────────────────────────────────────────────── */
export interface Series {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  slug: string;
  modelCount: number;
  isActive: boolean;
  createdAt: string;
}

/* ── Device Model ───────────────────────────────────────────── */
export interface DeviceModel {
  id: string;
  deviceTypeId: string;
  deviceTypeName: string;
  brandId: string;
  brandName: string;
  seriesId?: string;
  seriesName?: string;
  name: string;
  slug: string;
  imageUrl?: string;
  repairCount: number;
  isActive: boolean;
  releaseYear?: number;
  createdAt: string;
}
