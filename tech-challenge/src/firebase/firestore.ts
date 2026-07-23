import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
  type QueryConstraint,
  type WhereFilterOp,
} from 'firebase/firestore';

import { getFirebaseApp } from './config';

let firestoreInstance: Firestore | undefined;

function getDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}

export type WhereClause<T> = { field: keyof T & string; op: WhereFilterOp; value: unknown };

export async function getDocument<T extends DocumentData>(
  path: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const snapshot = await getDoc(doc(getDb(), path, id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T & { id: string }) : null;
}

export async function setDocument<T extends DocumentData>(
  path: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  await setDoc(doc(getDb(), path, id), data, { merge: true });
}

export async function queryCollection<T extends DocumentData>(
  path: string,
  whereClauses: WhereClause<T>[] = []
): Promise<(T & { id: string })[]> {
  const constraints: QueryConstraint[] = whereClauses.map((clause) =>
    where(clause.field, clause.op, clause.value)
  );
  const snapshot = await getDocs(query(collection(getDb(), path), ...constraints));
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as T & {
    id: string;
  });
}

export function subscribeToDocument<T extends DocumentData>(
  path: string,
  id: string,
  callback: (data: (T & { id: string }) | null) => void
): () => void {
  return onSnapshot(doc(getDb(), path, id), (snapshot) => {
    callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T & { id: string }) : null);
  });
}
