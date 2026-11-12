import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type BottomTabItemProps = {
  focusedIcon: IoniconName;
  unfocusedIcon: IoniconName;
  focused: boolean;
  color?: string | number | ComponentProps<typeof Ionicons>['color'];
  size?: number;
};

/** Ícone de um item do menu inferior — consumido via `tabBarIcon` em (tabs)/_layout.tsx. */
export function BottomTabItem({ focusedIcon, unfocusedIcon, focused, color, size = 22 }: BottomTabItemProps) {
  const resolvedColor = typeof color === 'number' ? String(color) : color;

  return <Ionicons name={focused ? focusedIcon : unfocusedIcon} size={size} color={resolvedColor as ComponentProps<typeof Ionicons>['color']} />;
}
