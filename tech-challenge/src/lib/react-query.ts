export { QueryClientProvider } from '@tanstack/react-query';

/** Factory de query keys consistentes por module (evita strings mágicas espalhadas). */
export function createQueryKeys<T extends string>(scope: T) {
  return {
    all: [scope] as const,
    list: (filter?: string) => [scope, 'list', filter] as const,
    detail: (id: string) => [scope, 'detail', id] as const,
  };
}
