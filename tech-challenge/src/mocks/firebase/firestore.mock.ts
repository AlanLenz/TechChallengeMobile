import type { DocumentData, WhereClause } from '@/firebase/firestore.types';
import { MOCK_FIRESTORE_SEED } from '@/mocks/data';

/**
 * Implementação mockada de src/firebase/firestore.ts — um "banco" em memória, iniciado a partir
 * de src/mocks/data.ts. Ver src/firebase/firestore.ts (o "picker" entre este arquivo e
 * firestore.real.ts).
 */

// Clone profundo do seed para que mutações (setDocument) não vazem entre reloads do módulo.
const store: Record<string, Record<string, DocumentData>> = JSON.parse(JSON.stringify(MOCK_FIRESTORE_SEED));

const documentListeners = new Set<{ path: string; id: string; callback: (data: unknown) => void }>();

function getCollection(path: string): Record<string, DocumentData> {
  if (!store[path]) store[path] = {};
  return store[path];
}

function matchesClause<T extends DocumentData>(doc: DocumentData, clause: WhereClause<T>): boolean {
  const actual = doc[clause.field];
  switch (clause.op) {
    case '==':
      return actual === clause.value;
    case '!=':
      return actual !== clause.value;
    case '>':
      return (actual as number) > (clause.value as number);
    case '>=':
      return (actual as number) >= (clause.value as number);
    case '<':
      return (actual as number) < (clause.value as number);
    case '<=':
      return (actual as number) <= (clause.value as number);
    case 'array-contains':
      return Array.isArray(actual) && actual.includes(clause.value);
    case 'array-contains-any': {
      const values = clause.value;
      return Array.isArray(actual) && Array.isArray(values) && actual.some((v) => values.includes(v));
    }
    case 'in':
      return Array.isArray(clause.value) && clause.value.includes(actual);
    case 'not-in':
      return Array.isArray(clause.value) && !clause.value.includes(actual);
    default:
      return false;
  }
}

function notifyDocumentListeners(path: string, id: string): void {
  const document = getCollection(path)[id];
  documentListeners.forEach((listener) => {
    if (listener.path === path && listener.id === id) {
      listener.callback(document ? { id, ...document } : null);
    }
  });
}

export async function getDocument<T extends DocumentData>(
  path: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const document = getCollection(path)[id];
  return document ? ({ id, ...document } as T & { id: string }) : null;
}

export async function setDocument<T extends DocumentData>(
  path: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const collection = getCollection(path);
  collection[id] = { ...collection[id], ...data };
  notifyDocumentListeners(path, id);
}

export async function queryCollection<T extends DocumentData>(
  path: string,
  whereClauses: WhereClause<T>[] = []
): Promise<(T & { id: string })[]> {
  const collection = getCollection(path);
  return Object.entries(collection)
    .filter(([, document]) => whereClauses.every((clause) => matchesClause(document, clause)))
    .map(([id, document]) => ({ id, ...document }) as T & { id: string });
}

export function subscribeToDocument<T extends DocumentData>(
  path: string,
  id: string,
  callback: (data: (T & { id: string }) | null) => void
): () => void {
  const listener = { path, id, callback: callback as (data: unknown) => void };
  documentListeners.add(listener);
  const document = getCollection(path)[id];
  Promise.resolve().then(() => callback(document ? ({ id, ...document } as T & { id: string }) : null));
  return () => {
    documentListeners.delete(listener);
  };
}
