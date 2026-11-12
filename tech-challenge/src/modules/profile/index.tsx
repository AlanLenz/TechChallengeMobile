export { EditAvatarScreen } from './presentation/components/edit-avatar-screen';
export { ProfileScreen } from './presentation/components/profile-screen';

/**
 * Pré-carrega o módulo de telas do perfil antecipadamente para navegação instantânea.
 */
export function preloadProfileModule(): Promise<unknown> {
  return Promise.all([
    import('./presentation/components/profile-screen'),
    import('./presentation/components/edit-avatar-screen'),
  ]);
}
