import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IProductRepository } from '../domain/repositories/IProductRepository';
import { IOrderRepository } from '../domain/repositories/IOrderRepository';
import { ISettingsRepository } from '../domain/repositories/ISettingsRepository';
import { InMemoryUserRepository } from '../infrastructure/repositories/InMemoryUserRepository';
import { InMemoryProductRepository } from '../infrastructure/repositories/InMemoryProductRepository';
import { InMemoryOrderRepository } from '../infrastructure/repositories/InMemoryOrderRepository';
import { InMemorySettingsRepository } from '../infrastructure/repositories/InMemorySettingsRepository';

export interface DIContainer {
  userRepository: IUserRepository;
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;
  settingsRepository: ISettingsRepository;
}

let container: DIContainer | null = null;

export function getContainer(): DIContainer {
  if (!container) {
    container = {
      userRepository: new InMemoryUserRepository(),
      productRepository: new InMemoryProductRepository(),
      orderRepository: new InMemoryOrderRepository(),
      settingsRepository: new InMemorySettingsRepository(),
    };
  }
  return container;
}
