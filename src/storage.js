import { doc, getDoc, setDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { db, auth } from './firebase';

// Offline persistence: Firestore queues reads/writes in IndexedDB when the
// network is unavailable and syncs automatically once it's back. This is
// what makes the app usable at a workshop with bad signal. It can fail if
// multiple tabs are open at once (Firestore only allows one tab to hold
// the persistence lock) — that's non-fatal, so we just log it.
try {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn('Offline persistence unavailable:', err.code);
  });
} catch (err) {
  console.warn('Offline persistence unavailable:', err);
}

function requireUid() {
  const uid = auth.currentUser && auth.currentUser.uid;
  if (!uid) throw new Error('storage called before sign-in — this should never happen, since App.jsx only renders data screens once signed in');
  return uid;
}

export async function storageGet(key) {
  const uid = requireUid();
  const snap = await getDoc(doc(db, 'users', uid, 'data', key));
  if (!snap.exists()) return null;
  return { key, value: snap.data().value };
}

export async function storageSet(key, value) {
  const uid = requireUid();
  await setDoc(doc(db, 'users', uid, 'data', key), { value, updatedAt: Date.now() });
  return { key, value };
}
