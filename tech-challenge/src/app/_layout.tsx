import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from '@/contexts/app-context';
import { AuthProvider, useAuthContext } from '@/contexts/auth-context';
import { ConnectivityProvider } from '@/contexts/connectivity-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { TransactionsProvider } from '@/modules/transactions';
import { queryClient } from '@/services/query-client';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { status } = useAuthContext();
  const [loaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (status !== 'loading' && loaded) {
      SplashScreen.hideAsync();
    }
  }, [status, loaded]);

  // Pré-compilação em background dos gráficos assim que a autenticação é resolvida,
  // antes mesmo de a transição para as abas ser concluída.
  useEffect(() => {
    if (status === 'authenticated') {
      import('@/modules/home').then((m) => {
        void m.preloadHomeCharts();
      });
    }
  }, [status]);

  // Mantém a splash nativa visível (ainda não escondida) enquanto o Firebase resolve a sessão.
  if (status === 'loading' || !loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === 'unauthenticated'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'authenticated'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TransactionsProvider>
              <ThemeProvider>
                <ConnectivityProvider>
                  <NotificationProvider>
                    <AppProvider>
                      <RootNavigator />
                    </AppProvider>
                  </NotificationProvider>
                </ConnectivityProvider>
              </ThemeProvider>
            </TransactionsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
