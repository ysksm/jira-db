import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { useContainer } from '../../di/ContainerContext';

export function useOrders() {
  const { orderRepository } = useContainer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await orderRepository.findAll();
    setOrders(data);
    setLoading(false);
  }, [orderRepository]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await orderRepository.updateStatus(id, status);
    await load();
  };

  return { orders, loading, updateStatus, reload: load };
}
