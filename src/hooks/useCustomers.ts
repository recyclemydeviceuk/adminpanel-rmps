import { useState, useEffect, useCallback } from 'react';
import type { Customer, CustomerStatus } from '../types/customer';
import * as customersLib from '../lib/customers';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customersLib.getCustomers();
      setCustomers(data);
    } catch {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (id: string, status: CustomerStatus) => {
    const updated = await customersLib.updateCustomerStatus(id, status);
    setCustomers(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await customersLib.deleteCustomer(id);
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  return { customers, loading, error, reload: load, updateStatus, remove };
}

export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    customersLib.getCustomer(id)
      .then(setCustomer)
      .catch(() => setError('Customer not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  return { customer, loading, error, setCustomer };
}
