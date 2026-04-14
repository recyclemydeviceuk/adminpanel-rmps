import { useState, useEffect, useCallback } from 'react';
import type { Addon } from '../types/addon';
import * as addonsLib from '../lib/addons';

export function useAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await addonsLib.getAddons();
      setAddons(data);
    } catch {
      setError('Failed to load add-ons.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Omit<Addon, 'id' | 'createdAt'>) => {
    const addon = await addonsLib.createAddon(data);
    setAddons(prev => [...prev, addon]);
    return addon;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Addon>) => {
    const addon = await addonsLib.updateAddon(id, patch);
    setAddons(prev => prev.map(a => a.id === id ? addon : a));
    return addon;
  }, []);

  const remove = useCallback(async (id: string) => {
    await addonsLib.deleteAddon(id);
    setAddons(prev => prev.filter(a => a.id !== id));
  }, []);

  return { addons, loading, error, reload: load, create, update, remove };
}
