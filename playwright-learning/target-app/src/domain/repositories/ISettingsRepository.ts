import { AppSettings } from '../entities/Settings';

export interface ISettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<AppSettings>;
}
