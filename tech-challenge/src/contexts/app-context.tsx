import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { preferencesStorage } from '@/services/storage.service';

const ONBOARDING_STORAGE_KEY = 'preferences/onboarding-seen';

type AppContextValue = {
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    preferencesStorage.getItem(ONBOARDING_STORAGE_KEY).then((stored) => {
      if (stored === 'true') setHasSeenOnboarding(true);
    });
  }, []);

  const completeOnboarding = () => {
    setHasSeenOnboarding(true);
    preferencesStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  };

  return (
    <AppContext.Provider value={{ hasSeenOnboarding, completeOnboarding }}>{children}</AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext deve ser usado dentro de <AppProvider>.');
  return context;
}
