import type { AdminUser } from '../types/auth';

const STORAGE_KEY = 'admin_auth_user';

export function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: AdminUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasPermission(user: AdminUser | null, minRole: 'support' | 'admin' | 'super-admin'): boolean {
  if (!user) return false;
  const levels = { support: 1, admin: 2, 'super-admin': 3 };
  return levels[user.role] >= levels[minRole];
}
