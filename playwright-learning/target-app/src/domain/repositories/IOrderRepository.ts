import { Order, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
