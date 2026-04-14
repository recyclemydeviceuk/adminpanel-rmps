import type { DeviceType } from '../types/catalog';

export const ADMIN_DEVICES: DeviceType[] = [
  {
    id: 'device-001',
    name: 'Phone',
    slug: 'phone',
    imageUrl: 'https://res.cloudinary.com/dn2sab6qc/image/upload/v1773930131/repair-my-phone-screen-logo_jmngqv.webp',
    brandCount: 7,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'device-002',
    name: 'Tablet',
    slug: 'tablet',
    imageUrl: '',
    brandCount: 2,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'device-003',
    name: 'Watch',
    slug: 'watch',
    imageUrl: '',
    brandCount: 0,
    isActive: false,
    createdAt: '2023-06-01T00:00:00Z',
  },
];
