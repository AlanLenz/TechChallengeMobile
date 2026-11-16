import { Tabs } from 'expo-router';
import { useEffect } from 'react';

import { tabBarScreenOptions } from '@/components/navigation/tab-bar';
import { BottomTabItem } from '@/components/ui/bottom-tab-item';
import { useAuthContext } from '@/contexts/auth-context';
import { preloadHomeCharts } from '@/modules/home';
import { preloadProfileModule } from '@/modules/profile';
import { preloadTransactionsModule } from '@/modules/transactions';
import { preloadIdle, preloadImage } from '@/services/preload.service';

export default function TabsLayout() {
  const { user } = useAuthContext();

  useEffect(() => {
    // 1. Pré-carregamento imediato dos recursos da tela inicial (Home)
    void preloadHomeCharts();

    // 2. Pré-carregamento cooperativo / agendado em tempo ocioso para as outras abas
    const cancelIdle = preloadIdle(() => {
      void preloadTransactionsModule();
      void preloadProfileModule();
      if (user?.photoURL) {
        void preloadImage(user.photoURL);
      }
    }, 700);

    return cancelIdle;
  }, [user]);

  return (
    <Tabs screenOptions={tabBarScreenOptions}>
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => {
            void preloadHomeCharts();
          },
        }}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <BottomTabItem focusedIcon="home" unfocusedIcon="home-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        listeners={{
          tabPress: () => {
            void preloadTransactionsModule();
          },
        }}
        options={{
          title: 'Transações',
          tabBarIcon: ({ focused, color }) => (
            <BottomTabItem
              focusedIcon="swap-horizontal"
              unfocusedIcon="swap-horizontal-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: () => {
            void preloadProfileModule();
            if (user?.photoURL) {
              void preloadImage(user.photoURL);
            }
          },
        }}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <BottomTabItem
              focusedIcon="person"
              unfocusedIcon="person-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
