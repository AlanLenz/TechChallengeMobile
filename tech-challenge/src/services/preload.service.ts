import { Image } from 'expo-image';

/**
 * Pré-carrega uma única imagem no cache nativo em memória e em disco utilizando expo-image.
 * Erros de rede são suprimidos de forma silenciosa para que falhas de imagem não afetem a navegação.
 */
export async function preloadImage(url: string | undefined | null): Promise<boolean> {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;

  try {
    return await Image.prefetch(trimmed, 'memory-disk');
  } catch {
    // Best-effort: falha no pré-carregamento de imagem nunca deve lançar erro
    return false;
  }
}

/**
 * Pré-carrega uma lista de URLs de imagens em lote no cache nativo (disco e memória).
 * Deduplica e remove URLs inválidas automaticamente.
 */
export async function preloadImages(urls: (string | undefined | null)[]): Promise<boolean[]> {
  const validUrls = Array.from(
    new Set(
      urls
        .map((u) => u?.trim())
        .filter((u): u is string => Boolean(u && (u.startsWith('http://') || u.startsWith('https://'))))
    )
  );

  if (validUrls.length === 0) return [];

  return Promise.all(validUrls.map((url) => preloadImage(url)));
}

/**
 * Agenda uma tarefa de pré-carregamento para execução cooperativa em tempo ocioso (idle),
 * evitando competir por banda ou CPU durante transições ou animações prioritárias.
 * Retorna uma função de cancelamento caso o ciclo de vida seja interrompido.
 */
export function preloadIdle(callback: () => void, delayMs = 600): () => void {
  let cancelled = false;

  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(
      () => {
        if (!cancelled) callback();
      },
      { timeout: delayMs }
    );

    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(handle);
      }
    };
  }

  const timer = setTimeout(() => {
    if (!cancelled) callback();
  }, delayMs);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
