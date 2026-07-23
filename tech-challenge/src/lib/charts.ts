import { colors } from '@/theme';

/** Configuração compartilhada dos gráficos (react-native-gifted-charts) do dashboard. */
export const chartDefaults = {
  color: colors.primary[500],
  thickness: 3,
  startFillColor: colors.primary[200],
  endFillColor: colors.primary[50],
  startOpacity: 0.4,
  endOpacity: 0.05,
  noOfSections: 4,
  yAxisColor: colors.neutral[200],
  xAxisColor: colors.neutral[200],
  rulesColor: colors.neutral[100],
};
