import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { useAppContext } from '@/contexts/app-context';
import { formatCurrency } from '@/utils/format-currency';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function getTodayLabel(): string {
  const now = new Date();
  const day = DAYS[now.getDay()];
  const dd = String(now.getDate()).padStart(2, '0');
  const month = MONTHS[now.getMonth()];
  const yyyy = now.getFullYear();
  return `${day}, ${dd} de ${month} de ${yyyy}`;
}

type HeroCardProps = {
  firstName: string;
  balance: number;
};

export function HeroCard({ firstName, balance }: HeroCardProps) {
  const { areValuesVisible, toggleValuesVisibility } = useAppContext();

  return (
    <View className="rounded-2xl bg-teal-900 p-5 gap-4">
      {/* Greeting row */}
      <View className="gap-0.5">
        <Typography variant="title" className="text-white">
          Olá, {firstName}! :)
        </Typography>
        <Typography variant="small" className="text-teal-300">
          {getTodayLabel()}
        </Typography>
      </View>

      {/* Balance row */}
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Typography variant="small" className="text-teal-300">
            Saldo
          </Typography>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={areValuesVisible ? 'Ocultar valores financeiros' : 'Mostrar valores financeiros'}
            onPress={toggleValuesVisibility}
            hitSlop={8}>
            <Ionicons
              name={areValuesVisible ? 'eye-outline' : 'eye-off-outline'}
              size={16}
              color="#5eead4"
            />
          </Pressable>
        </View>
        <Typography variant="display" className="text-white">
          {areValuesVisible ? formatCurrency(balance) : 'R$ ••••••'}
        </Typography>
      </View>
    </View>
  );
}
