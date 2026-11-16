import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { connect as openTcpConnection } from 'node:net';
import test from 'node:test';

import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  connectStorageEmulator,
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

const projectId = 'demo-tech-challenge';
const emulatorHost = '127.0.0.1';
const authUrl = `http://${emulatorHost}:9099`;

function assertEmulatorPortOpen(port, service) {
  return new Promise((resolve, reject) => {
    const socket = openTcpConnection({ host: emulatorHost, port });
    socket.setTimeout(3000, () => {
      socket.destroy();
      reject(new Error(`${service} Emulator não respondeu em ${emulatorHost}:${port}`));
    });
    socket.once('connect', () => {
      socket.destroy();
      resolve();
    });
    socket.once('error', reject);
  });
}

test('Firebase Auth, Firestore CRUD e Storage usam exclusivamente os emuladores locais', async () => {
  assert.ok(projectId.startsWith('demo-'), 'o project ID precisa ser isolado');

  const authHealth = await fetch(`${authUrl}/emulator/v1/projects/${projectId}/config`);
  assert.equal(authHealth.status, 200, 'Auth Emulator precisa estar ativo');

  await assertEmulatorPortOpen(8080, 'Firestore');
  await assertEmulatorPortOpen(9199, 'Storage');

  const app = initializeApp(
    {
      apiKey: 'emulator-only',
      authDomain: 'localhost',
      projectId,
      storageBucket: `${projectId}.appspot.com`,
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:emulator',
    },
    `emulator-test-${randomUUID()}`
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, authUrl, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, emulatorHost, 8080);
  const storage = getStorage(app);
  connectStorageEmulator(storage, emulatorHost, 9199);

  const email = `emulator-${randomUUID()}@example.test`;
  const password = 'Emulator-only-Pass123';
  let userId;
  let transactionRef;
  let receiptRef;

  try {
  await assert.rejects(
    createUserWithEmailAndPassword(auth, 'invalid-email', password),
    { code: 'auth/invalid-email' }
  );
  await assert.rejects(
    createUserWithEmailAndPassword(auth, `weak-${randomUUID()}@example.test`, 'short'),
    { code: 'auth/weak-password' }
  );

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  userId = credential.user.uid;
  await updateProfile(credential.user, { displayName: 'Emulator Test' });
  assert.equal(auth.currentUser.displayName, 'Emulator Test');
  assert.equal(auth.currentUser.email, email);
  assert.equal(auth.currentUser.emailVerified, false);
  await assert.rejects(
    createUserWithEmailAndPassword(auth, email, password),
    { code: 'auth/email-already-in-use' }
  );

  await signOut(auth);
  assert.equal(auth.currentUser, null, 'logout deve limpar a sessão local');
  const unauthenticatedCreate = addDoc(
    collection(db, `users/${userId}/transactions`),
    {
        description: 'Unauthenticated',
        amount: 10,
        date: '2026-01-01',
        type: 'Transfer',
        categories_id: 1,
      }
    );
    await assert.rejects(unauthenticatedCreate, { code: 'permission-denied' });
    await assert.rejects(
      signInWithEmailAndPassword(auth, email, 'Wrong-Password123'),
      (error) => ['auth/invalid-credential', 'auth/wrong-password'].includes(error.code)
    );
    await assert.rejects(
      signInWithEmailAndPassword(auth, `missing-${randomUUID()}@example.test`, password),
      (error) => ['auth/invalid-credential', 'auth/user-not-found'].includes(error.code)
    );

    const signedIn = await signInWithEmailAndPassword(auth, email, password);
    assert.equal(signedIn.user.uid, userId);
    assert.equal(auth.currentUser.uid, userId, 'login deve restaurar o usuário autenticado');
    await sendPasswordResetEmail(auth, email);

    const transactions = collection(db, `users/${userId}/transactions`);
    transactionRef = await addDoc(transactions, {
      description: 'Emulator transaction',
      amount: 12.5,
      date: '2026-01-01',
      type: 'Transfer',
      categories_id: 1,
    });

    const created = await getDoc(transactionRef);
    assert.equal(created.data().amount, 12.5);

    await signOut(auth);
    assert.equal(auth.currentUser, null);
    await assert.rejects(getDoc(transactionRef), { code: 'permission-denied' });
    await signInWithEmailAndPassword(auth, email, password);

    const matching = await getDocs(query(transactions, where('type', '==', 'Transfer')));
    assert.equal(matching.size, 1);

    receiptRef = ref(storage, `users/${userId}/transactions/${transactionRef.id}/receipts/test.pdf`);
    const receipt = new Blob(['%PDF-1.4 emulator test'], { type: 'application/pdf' });
    await uploadBytes(receiptRef, receipt, { contentType: 'application/pdf' });
    const receiptUrl = await getDownloadURL(receiptRef);
    assert.match(receiptUrl, /^http:\/\/127\.0\.0\.1:9199\//);

    await updateDoc(transactionRef, {
      description: 'Updated emulator transaction',
      receipt: {
        name: 'test.pdf',
        url: receiptUrl,
        path: `users/${userId}/transactions/${transactionRef.id}/receipts/test.pdf`,
        contentType: 'application/pdf',
      },
    });
    const updated = await getDoc(transactionRef);
    assert.equal(updated.data().description, 'Updated emulator transaction');
    assert.equal(updated.data().receipt.name, 'test.pdf');

    await updateDoc(transactionRef, { receipt: deleteField() });
    assert.equal('receipt' in (await getDoc(transactionRef)).data(), false);

    const avatarRef = ref(storage, `avatars/${userId}.jpg`);
    await uploadBytes(avatarRef, new Blob(['test-avatar'], { type: 'image/jpeg' }), {
      contentType: 'image/jpeg',
    });
    const avatarUrl = await getDownloadURL(avatarRef);
    await updateProfile(auth.currentUser, { photoURL: avatarUrl });
    assert.equal(auth.currentUser.photoURL, avatarUrl);
    await deleteObject(receiptRef);
    await deleteDoc(transactionRef);
    assert.equal((await getDoc(transactionRef)).exists(), false);
  } finally {
    if (receiptRef) await deleteObject(receiptRef).catch(() => {});
    if (transactionRef) await deleteDoc(transactionRef).catch(() => {});
    if (auth.currentUser) await signOut(auth).catch(() => {});
    await (await import('firebase/app')).deleteApp(app);
  }
});
