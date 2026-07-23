import { Link, Stack } from 'expo-router';

import { ScreenContainer } from '@/components/layout/screen-container';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <ScreenContainer className="items-center justify-center gap-4">
        <Typography variant="title">Página não encontrada</Typography>
        <Link href="/(tabs)" asChild>
          <Button label="Voltar para o início" />
        </Link>
      </ScreenContainer>
    </>
  );
}
