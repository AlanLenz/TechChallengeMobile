import { Ionicons } from '@expo/vector-icons';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';
import { cx } from '@/utils/cx';
import { formatDate } from '@/utils/format-date';
import { maskDate } from '@/utils/mask';

import { Button } from './button';
import { Input } from './input';
import { Modal } from './modal';

type DateFieldProps = {
  label?: string;
  value?: string;
  onChange: (isoDate: string) => void;
  error?: string;
};

function parseDdMmYyyy(text: string): Date | undefined {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const isWeb = Platform.OS === 'web';
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => (value ? new Date(value) : new Date()));
  const [webText, setWebText] = useState(() => (value ? formatDate(new Date(value)) : ''));

  if (isWeb) {
    return (
      <Input
        label={label}
        placeholder="dd/mm/aaaa"
        keyboardType="number-pad"
        value={webText}
        error={error}
        onChangeText={(raw) => {
          const masked = maskDate(raw);
          setWebText(masked);
          const parsed = parseDdMmYyyy(masked);
          if (parsed) onChange(parsed.toISOString());
        }}
      />
    );
  }

  const displayValue = value ? formatDate(new Date(value)) : undefined;

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-small font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setDraft(value ? new Date(value) : new Date());
          setPickerOpen(true);
        }}
        className={cx(
          'flex-row items-center justify-between rounded-xl border bg-white px-4 py-3 dark:bg-neutral-900',
          error ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700'
        )}>
        <Text
          className={cx(
            'text-body',
            displayValue ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
          )}>
          {displayValue ?? 'Selecione a data'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.neutral[400]} />
      </Pressable>
      {error ? <Text className="text-small text-danger-500">{error}</Text> : null}

      {pickerOpen && Platform.OS === 'android' ? (
        <DateTimePicker
          mode="date"
          presentation="dialog"
          value={draft}
          onValueChange={(_event, date) => {
            setPickerOpen(false);
            onChange(date.toISOString());
          }}
          onDismiss={() => setPickerOpen(false)}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={pickerOpen} onRequestClose={() => setPickerOpen(false)} className="gap-4">
          <DateTimePicker
            mode="date"
            display="inline"
            value={draft}
            accentColor={colors.primary[500]}
            onValueChange={(_event, date) => setDraft(date)}
          />
          <Button
            label="Confirmar"
            onPress={() => {
              onChange(draft.toISOString());
              setPickerOpen(false);
            }}
          />
        </Modal>
      ) : null}
    </View>
  );
}
