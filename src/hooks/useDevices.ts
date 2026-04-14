import { useState, useEffect, useCallback } from 'react';
import type { DeviceType } from '../types/catalog';
import * as devicesLib from '../lib/devices';

export function useDevices() {
  const [devices, setDevices] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await devicesLib.getDeviceTypes();
      setDevices(data);
    } catch {
      setError('Failed to load devices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Omit<DeviceType, 'id' | 'createdAt' | 'brandCount'>) => {
    const device = await devicesLib.createDeviceType(data);
    setDevices(prev => [...prev, device]);
    return device;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<DeviceType>) => {
    const device = await devicesLib.updateDeviceType(id, patch);
    setDevices(prev => prev.map(d => d.id === id ? device : d));
    return device;
  }, []);

  const remove = useCallback(async (id: string) => {
    await devicesLib.deleteDeviceType(id);
    setDevices(prev => prev.filter(d => d.id !== id));
  }, []);

  return { devices, loading, error, reload: load, create, update, remove };
}
