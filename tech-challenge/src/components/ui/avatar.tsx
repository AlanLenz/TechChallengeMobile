import { Image, Text, View } from 'react-native';

import { cx } from '@/utils/cx';

type AvatarProps = {
  name: string;
  photoUrl?: string;
  size?: number;
  className?: string;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({ name, photoUrl, size = 40, className }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={dimension} />;
  }

  return (
    <View
      style={dimension}
      className={cx('items-center justify-center bg-primary-100 dark:bg-primary-900/40', className)}>
      <Text className="font-semibold text-primary-700 dark:text-primary-200">{getInitials(name)}</Text>
    </View>
  );
}
