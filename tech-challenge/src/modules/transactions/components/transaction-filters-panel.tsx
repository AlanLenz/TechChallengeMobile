import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/date-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';

import { ATTACHMENT_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, TRANSACTION_TYPE_FILTER_OPTIONS } from '../constants';
import type { TransactionFilters } from '../types';

type TransactionFiltersPanelProps = {
  filters: TransactionFilters;
  onChange: <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => void;
  onApply: () => void;
  onClear: () => void;
};

export function TransactionFiltersPanel({ filters, onChange, onApply, onClear }: TransactionFiltersPanelProps) {
  return (
    <View className="gap-4 rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <Typography variant="subtitle">Filtros</Typography>

      <Input
        label="Descrição"
        placeholder="Buscar por descrição"
        value={filters.description}
        onChangeText={(value) => onChange('description', value)}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <DateField
            label="Data inicial"
            value={filters.startDate}
            onChange={(value) => onChange('startDate', value)}
          />
        </View>
        <View className="flex-1">
          <DateField label="Data final" value={filters.endDate} onChange={(value) => onChange('endDate', value)} />
        </View>
      </View>

      <Select
        label="Tipo"
        options={TRANSACTION_TYPE_FILTER_OPTIONS}
        value={filters.type}
        onChange={(value) => onChange('type', value)}
      />

      <Select
        label="Categoria"
        options={CATEGORY_FILTER_OPTIONS}
        value={filters.categoryId}
        onChange={(value) => onChange('categoryId', value)}
      />

      <Select
        label="Anexo"
        options={ATTACHMENT_FILTER_OPTIONS}
        value={filters.attachment}
        onChange={(value) => onChange('attachment', value)}
      />

      <View className="flex-row gap-3">
        <Button label="Limpar filtros" variant="secondary" className="flex-1" onPress={onClear} />
        <Button label="Filtrar" className="flex-1" onPress={onApply} />
      </View>
    </View>
  );
}
