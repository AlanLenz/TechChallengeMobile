import { View } from 'react-native';

import { Button } from './button';
import { Typography } from './typography';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
  return (
    <View className="flex-row items-center justify-between pt-2">
      <Button label="Anterior" variant="secondary" className="px-4 py-2" onPress={onPrev} disabled={page <= 1} />
      <Typography variant="small">
        Página {page} de {totalPages}
      </Typography>
      <Button
        label="Próxima"
        variant="secondary"
        className="px-4 py-2"
        onPress={onNext}
        disabled={page >= totalPages}
      />
    </View>
  );
}
