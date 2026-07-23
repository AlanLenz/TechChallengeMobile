import NetInfo from '@react-native-community/netinfo';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ConnectivityContextValue = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
};

const ConnectivityContext = createContext<ConnectivityContextValue | undefined>(undefined);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectivityContextValue>({
    isConnected: true,
    isInternetReachable: null,
  });

  useEffect(() => {
    return NetInfo.addEventListener((netState) => {
      setState({
        isConnected: Boolean(netState.isConnected),
        isInternetReachable: netState.isInternetReachable,
      });
    });
  }, []);

  return <ConnectivityContext.Provider value={state}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivityContext(): ConnectivityContextValue {
  const context = useContext(ConnectivityContext);
  if (!context) throw new Error('useConnectivityContext deve ser usado dentro de <ConnectivityProvider>.');
  return context;
}
