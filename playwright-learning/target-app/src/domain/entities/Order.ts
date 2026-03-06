import { Money } from '../valueObjects/Money';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: Money;
}

export interface ShippingAddress {
  postalCode: string;
  prefecture: string;
  city: string;
  line1: string;
  line2?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  totalAmount: Money;
  orderedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}
