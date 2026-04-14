import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus } from '../types/order';
import * as ordersLib from '../lib/orders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersLib.getOrders();
      setOrders(data);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    const updated = await ordersLib.updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await ordersLib.deleteOrder(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  return { orders, loading, error, reload: load, updateStatus, remove };
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ordersLib.getOrder(id)
      .then(setOrder)
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = useCallback(async (status: OrderStatus) => {
    if (!order) return;
    const updated = await ordersLib.updateOrderStatus(order.id, status);
    setOrder(updated);
    return updated;
  }, [order]);

  return { order, loading, error, updateStatus };
}
