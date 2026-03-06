import { Product, ProductCategory, ProductStatus } from '../entities/Product';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByCategory(category: ProductCategory): Promise<Product[]>;
  findByStatus(status: ProductStatus): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
