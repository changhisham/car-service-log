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

// Local mirror of the last-seen Firestore value, keyed per user so
// switching accounts on the same device can't leak one user's cache into
// another's first paint. Firestore's own getDoc() is server-first even
// with persistence enabled, so without this a returning user stares at a
// skeleton for a full network round trip on every open. Reading this
// synchronously lets the UI render real data immediately while the
// network fetch below runs in the background to confirm/refresh it.
const LOCAL_CACHE_PREFIX = 'csl-cache-';

function cacheKeyFor(key) {
  const uid = auth.currentUser && auth.currentUser.uid;
  return uid ? `${LOCAL_CACHE_PREFIX}${uid}-${key}` : null;
}

export function storageGetCached(key) {
  try {
    const cacheKey = cacheKeyFor(key);
    const raw = cacheKey && localStorage.getItem(cacheKey);
    return raw ? { key, value: raw } : null;
  } catch (e) {
    return null;
  }
}

function writeCache(key, value) {
  try {
    const cacheKey = cacheKeyFor(key);
    if (cacheKey) localStorage.setItem(cacheKey, value);
  } catch (e) {
    // Quota exceeded or storage disabled — the app still works, just
    // without the instant-load cache, so this failure is non-fatal.
  }
}

export async function storageGet(key) {
  const uid = requireUid();
  const snap = await getDoc(doc(db, 'users', uid, 'data', key));
  if (!snap.exists()) return null;
  const value = snap.data().value;
  writeCache(key, value);
  return { key, value };
}

export async function storageSet(key, value) {
  const uid = requireUid();
  await setDoc(doc(db, 'users', uid, 'data', key), { value, updatedAt: Date.now() });
  writeCache(key, value);
  return { key, value };
}
