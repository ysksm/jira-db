import { Order, OrderStatus } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { mockOrders } from '../api/mockData';

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Order[] = [...mockOrders];

  async findAll(): Promise<Order[]> {
    return [...this.orders];
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return this.orders.filter((o) => o.customerId === customerId);
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orders.filter((o) => o.status === status);
  }

  async save(order: Order): Promise<Order> {
    const index = this.orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      this.orders[index] = order;
    } else {
      this.orders.push(order);
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new Error(`Order not found: ${id}`);
    order.status = status;
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();
    return order;
  }
}
