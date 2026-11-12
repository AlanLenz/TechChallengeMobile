import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { preferencesStorage } from '@/services/storage.service';

const ONBOARDING_STORAGE_KEY = 'preferences/onboarding-seen';
const PRIVACY_MODE_STORAGE_KEY = 'preferences/hide-financial-values';

type AppContextValue = {
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
  areValuesVisible: boolean;
  toggleValuesVisibility: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [areValuesVisible, setAreValuesVisible] = useState(true);

  useEffect(() => {
    preferencesStorage.getItem(ONBOARDING_STORAGE_KEY).then((stored) => {
      if (stored === 'true') setHasSeenOnboarding(true);
    });
    preferencesStorage.getItem(PRIVACY_MODE_STORAGE_KEY).then((stored) => {
      if (stored === 'true') setAreValuesVisible(false);
    });
  }, []);

  const completeOnboarding = () => {
    setHasSeenOnboarding(true);
    preferencesStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  };

  const toggleValuesVisibility = () => {
    setAreValuesVisible((prev) => {
      const next = !prev;
      preferencesStorage.setItem(PRIVACY_MODE_STORAGE_KEY, next ? 'false' : 'true');
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        hasSeenOnboarding,
        completeOnboarding,
        areValuesVisible,
        toggleValuesVisibility,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext deve ser usado dentro de <AppProvider>.');
  return context;
}
