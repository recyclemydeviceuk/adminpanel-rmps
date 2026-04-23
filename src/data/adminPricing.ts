import type { PricingRule, RepairType } from '../types/pricing';

export const REPAIR_TYPES: RepairType[] = [
  { id: 'rt-001', name: 'Front Screen', slug: 'front-screen', category: 'screen', description: 'Full LCD/OLED front screen replacement', isActive: true },
  { id: 'rt-002', name: 'Battery & Charging', slug: 'battery-charging', category: 'battery', description: 'Battery replacement and charging port repair', isActive: true },
  { id: 'rt-003', name: 'Camera', slug: 'camera', category: 'camera', description: 'Front or rear camera module repair', isActive: true },
  { id: 'rt-004', name: 'Back Cover', slug: 'back-cover', category: 'back_glass', description: 'Rear glass / back cover replacement', isActive: true },
  { id: 'rt-005', name: 'Diagnostics', slug: 'diagnostics', category: 'charging_port', description: 'Full device diagnostic check and report', isActive: true },
  { id: 'rt-006', name: 'Speaker Repair', slug: 'speaker-repair', category: 'speaker', description: 'Earpiece or loudspeaker replacement', isActive: true },
];

export const ADMIN_PRICING: PricingRule[] = [
  // Apple iPhone 15 Pro
  { id: 'pr-001', modelId: 'model-001', modelName: 'iPhone 15 Pro', brandName: 'Apple', repairTypeId: 'rt-001', repairTypeName: 'Front Screen', category: 'screen', price: 149.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-002', modelId: 'model-001', modelName: 'iPhone 15 Pro', brandName: 'Apple', repairTypeId: 'rt-002', repairTypeName: 'Battery & Charging', category: 'battery', price: 79.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-003', modelId: 'model-001', modelName: 'iPhone 15 Pro', brandName: 'Apple', repairTypeId: 'rt-003', repairTypeName: 'Camera', category: 'camera', price: 129.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-004', modelId: 'model-001', modelName: 'iPhone 15 Pro', brandName: 'Apple', repairTypeId: 'rt-004', repairTypeName: 'Back Cover', category: 'back_glass', price: 99.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  // Apple iPhone 14
  { id: 'pr-005', modelId: 'model-002', modelName: 'iPhone 14', brandName: 'Apple', repairTypeId: 'rt-001', repairTypeName: 'Front Screen', category: 'screen', price: 119.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-006', modelId: 'model-002', modelName: 'iPhone 14', brandName: 'Apple', repairTypeId: 'rt-002', repairTypeName: 'Battery & Charging', category: 'battery', price: 69.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-007', modelId: 'model-002', modelName: 'iPhone 14', brandName: 'Apple', repairTypeId: 'rt-003', repairTypeName: 'Camera', category: 'camera', price: 109.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  // Apple iPhone 13
  { id: 'pr-008', modelId: 'model-003', modelName: 'iPhone 13', brandName: 'Apple', repairTypeId: 'rt-001', repairTypeName: 'Front Screen', category: 'screen', price: 99.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-009', modelId: 'model-003', modelName: 'iPhone 13', brandName: 'Apple', repairTypeId: 'rt-002', repairTypeName: 'Battery & Charging', category: 'battery', price: 59.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  // Samsung Galaxy S24
  { id: 'pr-010', modelId: 'model-004', modelName: 'Galaxy S24', brandName: 'Samsung', repairTypeId: 'rt-001', repairTypeName: 'Front Screen', category: 'screen', price: 139.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-011', modelId: 'model-004', modelName: 'Galaxy S24', brandName: 'Samsung', repairTypeId: 'rt-002', repairTypeName: 'Battery & Charging', category: 'battery', price: 79.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-012', modelId: 'model-004', modelName: 'Galaxy S24', brandName: 'Samsung', repairTypeId: 'rt-004', repairTypeName: 'Back Cover', category: 'back_glass', price: 89.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  // Samsung Galaxy S23 Ultra
  { id: 'pr-013', modelId: 'model-005', modelName: 'Galaxy S23 Ultra', brandName: 'Samsung', repairTypeId: 'rt-001', repairTypeName: 'Front Screen', category: 'screen', price: 189.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-014', modelId: 'model-005', modelName: 'Galaxy S23 Ultra', brandName: 'Samsung', repairTypeId: 'rt-002', repairTypeName: 'Battery & Charging', category: 'battery', price: 89.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  // Google Pixel 8 Pro
  { id: 'pr-015', modelId: 'model-006', modelName: 'Pixel 8 Pro', brandName: 'Google', repairTypeId: 'rt-001', repairTypeName: 'Front Screen', category: 'screen', price: 159.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-016', modelId: 'model-006', modelName: 'Pixel 8 Pro', brandName: 'Google', repairTypeId: 'rt-002', repairTypeName: 'Battery & Charging', category: 'battery', price: 74.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pr-017', modelId: 'model-006', modelName: 'Pixel 8 Pro', brandName: 'Google', repairTypeId: 'rt-005', repairTypeName: 'Diagnostics', category: 'charging_port', price: 64.99, isActive: true, updatedAt: '2024-01-01T00:00:00Z' },
];
