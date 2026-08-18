import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type Auth,
} from 'firebase/auth';

import { getFirebaseApp } from './config';

let authInstance: Auth | undefined;

function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }

  return authInstance;
}

export function getCurrentUser(): User | null {
  return getAuthInstance().currentUser;
}

export async function signUp(
  email: string,
  password: string
) {
  return createUserWithEmailAndPassword(
    getAuthInstance(),
    email,
    password
  );
}

export async function signIn(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(
    getAuthInstance(),
    email,
    password
  );
}

export async function logout(): Promise<void> {
  await signOut(getAuthInstance());
}

export function subscribeToAuthChanges(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(getAuthInstance(), callback);
}