import { Link, Stack } from 'expo-router';

import { ScreenContainer } from '@/components/layout/screen-container';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/constants/routes';
import { useAuthContext } from '@/contexts/auth-context';

export default function NotFound() {
  const { status } = useAuthContext();
  const homeHref = status === 'authenticated' ? ROUTES.TABS.HOME : ROUTES.AUTH.LOGIN;

  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <ScreenContainer className="items-center justify-center gap-4">
        <Typography variant="title">Página não encontrada</Typography>
        <Link href={homeHref} asChild>
          <Button label="Voltar para o início" />
        </Link>
      </ScreenContainer>
    </>
  );
}
