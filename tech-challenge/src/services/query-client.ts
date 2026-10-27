import { QueryClient } from '@tanstack/react-query';

const MAX_QUERY_RETRIES = 2;

/** Erros que não melhoram ao repetir a requisição — repetir só adia a mensagem de erro. */
const NON_RETRYABLE_ERROR_CODES = ['permission-denied', 'unauthenticated'];

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (NON_RETRYABLE_ERROR_CODES.some((nonRetryable) => code.endsWith(nonRetryable))) return false;
  return failureCount < MAX_QUERY_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
