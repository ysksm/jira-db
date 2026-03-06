import { ProductId } from '../valueObjects/ProductId';
import { Money } from '../valueObjects/Money';

export type ProductCategory = 'electronics' | 'clothing' | 'food' | 'books' | 'other';
export type ProductStatus = 'draft' | 'active' | 'discontinued';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: Money;
  stock: number;
}

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  category: ProductCategory;
  status: ProductStatus;
  basePrice: Money;
  variants: ProductVariant[];
  tags: string[];
  createdAt: Date;
}
