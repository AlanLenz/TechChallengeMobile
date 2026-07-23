import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type BottomTabItemProps = {
  focusedIcon: IoniconName;
  unfocusedIcon: IoniconName;
  focused: boolean;
  color: ColorValue;
  size?: number;
};

/** Ícone de um item do menu inferior — consumido via `tabBarIcon` em (tabs)/_layout.tsx. */
export function BottomTabItem({ focusedIcon, unfocusedIcon, focused, color, size = 22 }: BottomTabItemProps) {
  return <Ionicons name={focused ? focusedIcon : unfocusedIcon} size={size} color={color} />;
}
