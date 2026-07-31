/**
 * Espelha `WhereFilterOp` de `firebase/firestore` localmente (mesmos literais) para que
 * src/mocks/firebase/firestore.mock.ts não precise importar o pacote `firebase` — só
 * src/firebase/**\/*.ts pode fazer isso (ver regra no-restricted-imports em eslint.config.js).
 */
export type WhereOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'
  | 'not-in';

export type WhereClause<T> = { field: keyof T & string; op: WhereOp; value: unknown };

/** Equivalente local a `DocumentData` de `firebase/firestore` (mesmo motivo do WhereOp acima). */
export type DocumentData = Record<string, unknown>;
