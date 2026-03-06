import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../../domain/entities/Settings';
import { useContainer } from '../../di/ContainerContext';

export function useSettings() {
  const { settingsRepository } = useContainer();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await settingsRepository.get();
    setSettings(data);
    setLoading(false);
  }, [settingsRepository]);

  useEffect(() => { load(); }, [load]);

  const saveSettings = async (newSettings: AppSettings) => {
    await settingsRepository.save(newSettings);
    setSettings(newSettings);
  };

  return { settings, loading, saveSettings };
}
