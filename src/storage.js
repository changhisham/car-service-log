// Storage layer for the standalone deployment.
//
// The original artifact version ran inside Claude.ai and used a built-in
// window.storage API. That API does not exist outside Claude.ai, so this
// file replaces it with Firebase Firestore + anonymous auth:
//   - No login screen — a device signs in anonymously on first load and
//     gets a stable user ID that Firebase remembers in the browser.
//   - Data is stored under that user ID, so it's private to you.
//   - To see the same data on a second device (phone + laptop), see the
//     "Sync across devices" note in the README — by default, anonymous
//     auth is per-browser, so devices don't share an ID automatically.
//
// storageGet/storageSet intentionally mirror the shape of the old
// window.storage.get/set calls ({ key, value }) so App.jsx needed only a
// two-line change.

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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

// Resolve once to a stable user ID, signing in anonymously if needed.
const userIdReady = new Promise((resolve, reject) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      resolve(user.uid);
    } else {
      signInAnonymously(auth).catch(reject);
    }
  }, reject);
});

// If a shared, cross-device account ID is set (see README "Sync across
// devices"), use that instead of the per-browser anonymous ID.
const SHARED_ID_KEY = 'csl-shared-account-id';
async function resolveUserId() {
  const shared = localStorage.getItem(SHARED_ID_KEY);
  if (shared && shared.trim()) return shared.trim();
  return userIdReady;
}

export async function storageGet(key) {
  const uid = await resolveUserId();
  const snap = await getDoc(doc(db, 'users', uid, 'data', key));
  if (!snap.exists()) return null;
  return { key, value: snap.data().value };
}

export async function storageSet(key, value) {
  const uid = await resolveUserId();
  await setDoc(doc(db, 'users', uid, 'data', key), { value, updatedAt: Date.now() });
  return { key, value };
}

// Optional helper: call this from the browser console (or wire up a
// settings field) to point this browser at a shared account ID so two
// devices read/write the same data. Any non-empty string works, as long
// as both devices use the exact same one — treat it like a passphrase.
export function setSharedAccountId(id) {
  if (id && id.trim()) {
    localStorage.setItem(SHARED_ID_KEY, id.trim());
  } else {
    localStorage.removeItem(SHARED_ID_KEY);
  }
}
