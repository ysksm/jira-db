import { Product, ProductCategory, ProductStatus } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { mockProducts } from '../api/mockData';

export class InMemoryProductRepository implements IProductRepository {
  private products: Product[] = [...mockProducts];

  async findAll(): Promise<Product[]> {
    return [...this.products];
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    return this.products.filter((p) => p.category === category);
  }

  async findByStatus(status: ProductStatus): Promise<Product[]> {
    return this.products.filter((p) => p.status === status);
  }

  async search(query: string): Promise<Product[]> {
    const q = query.toLowerCase();
    return this.products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  async save(product: Product): Promise<Product> {
    const index = this.products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      this.products[index] = product;
    } else {
      this.products.push(product);
    }
    return product;
  }

  async delete(id: string): Promise<void> {
    this.products = this.products.filter((p) => p.id !== id);
  }
}
