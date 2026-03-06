import { createContext, useContext, ReactNode } from 'react';
import { DIContainer, getContainer } from './container';

const ContainerContext = createContext<DIContainer | null>(null);

export function ContainerProvider({ children }: { children: ReactNode }) {
  const container = getContainer();
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useContainer(): DIContainer {
  const ctx = useContext(ContainerContext);
  if (!ctx) throw new Error('useContainer must be used within ContainerProvider');
  return ctx;
}
