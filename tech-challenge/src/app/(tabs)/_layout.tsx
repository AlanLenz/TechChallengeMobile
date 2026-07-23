import { Tabs } from 'expo-router';

import { tabBarScreenOptions } from '@/components/navigation/tab-bar';
import { BottomTabItem } from '@/components/ui/bottom-tab-item';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={tabBarScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <BottomTabItem focusedIcon="home" unfocusedIcon="home-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Contas',
          tabBarIcon: ({ focused, color }) => (
            <BottomTabItem
              focusedIcon="wallet"
              unfocusedIcon="wallet-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          title: 'Transferências',
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
