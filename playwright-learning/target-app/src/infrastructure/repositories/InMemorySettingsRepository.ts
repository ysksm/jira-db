import { AppSettings } from '../../domain/entities/Settings';
import { ISettingsRepository } from '../../domain/repositories/ISettingsRepository';
import { mockSettings } from '../api/mockData';

export class InMemorySettingsRepository implements ISettingsRepository {
  private settings: AppSettings = { ...mockSettings };

  async get(): Promise<AppSettings> {
    return { ...this.settings };
  }

  async save(settings: AppSettings): Promise<AppSettings> {
    this.settings = { ...settings };
    return this.settings;
  }
}
