import { type ComponentType, lazy, type LazyExoticComponent } from 'react';

export type PreloadableComponent<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<{ default: T }>;
};

/**
 * Cria um componente com React.lazy que suporta pré-carregamento (preloading) antecipado.
 * Permite iniciar o download/avaliação do módulo antes de ser montado pelo React,
 * reduzindo ou eliminando tempos de espera do Suspense durante a navegação.
 *
 * @param factory Função que retorna a Promise com o módulo default.
 * @returns Componente React.lazy com método estático .preload() anexado.
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  let loadedPromise: Promise<{ default: T }> | null = null;

  const load = (): Promise<{ default: T }> => {
    if (!loadedPromise) {
      loadedPromise = factory();
    }
    return loadedPromise;
  };

  const Component = lazy(load) as PreloadableComponent<T>;
  Component.preload = load;

  return Component;
}
