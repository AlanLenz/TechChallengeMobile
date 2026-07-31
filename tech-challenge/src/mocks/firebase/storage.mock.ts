/**
 * Implementação mockada de src/firebase/storage.ts. Em vez de simular um upload de verdade,
 * guarda o Blob em memória e devolve uma `blob:` URL local (via `URL.createObjectURL`, suportado
 * pelo Hermes/Expo) — assim a foto escolhida aparece de fato na UI, sem precisar de rede.
 * Ver src/firebase/storage.ts (o "picker" entre este arquivo e storage.real.ts).
 */

const objects = new Map<string, Blob>();

export async function uploadFile(path: string, blob: Blob): Promise<string> {
  objects.set(path, blob);
  return path;
}

export async function getFileUrl(path: string): Promise<string> {
  const blob = objects.get(path);
  if (!blob) throw new Error(`[mock-storage] Nenhum arquivo mockado em "${path}".`);
  return URL.createObjectURL(blob);
}

export async function deleteFile(path: string): Promise<void> {
  objects.delete(path);
}
