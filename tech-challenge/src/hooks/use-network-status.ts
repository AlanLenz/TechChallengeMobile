import { useConnectivityContext } from '@/contexts/connectivity-context';

export function useNetworkStatus() {
  return useConnectivityContext();
}
