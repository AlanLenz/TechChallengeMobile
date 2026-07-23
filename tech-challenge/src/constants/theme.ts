import { Platform } from 'react-native';

/**
 * Famílias de fonte por plataforma. Cores/spacing/tipografia de tamanho vivem em src/theme/*
 * (fonte dos tokens do Tailwind); isto aqui é só o mapeamento nativo de `fontFamily` que o
 * Tailwind não cobre sozinho em cada plataforma.
 */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});
