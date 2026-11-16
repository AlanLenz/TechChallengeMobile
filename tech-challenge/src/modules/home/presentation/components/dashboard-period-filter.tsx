import { Platform, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';

import {
  DASHBOARD_PERIOD_OPTIONS,
  type DashboardPeriod,
} from '../../domain/services/dashboard-period.service';

type DashboardPeriodFilterProps = {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
};

const SELECTED_SHADOW_STYLE = Platform.select({
  web: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)' },
  default: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
});

export function DashboardPeriodFilter({ value, onChange }: DashboardPeriodFilterProps) {
  return (
    <View className="gap-2">
      <Typography variant="small" className="font-medium">
        Período dos indicadores
      </Typography>
      <View className="flex-row rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
        {DASHBOARD_PERIOD_OPTIONS.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(option.value)}
              style={[
                { flex: option.value === 'all-time' ? 1.35 : option.value === 'last-30-days' ? 0.8 : 1 },
                isSelected ? SELECTED_SHADOW_STYLE : undefined,
              ]}
              className={`min-h-10 items-center justify-center rounded-lg px-1 ${
                isSelected ? 'bg-white dark:bg-neutral-700' : ''
              }`}
            >
              <Typography
                variant="small"
                numberOfLines={1}
                className={isSelected ? 'font-semibold text-teal-700 dark:text-teal-300' : ''}
              >
                {option.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
