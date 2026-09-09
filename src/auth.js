import { auth, firebaseConfigured } from './firebase';
import {
  GoogleAuthProvider, EmailAuthProvider, signInWithPopup, linkWithPopup, linkWithCredential,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export function subscribeToAuth(callback) {
  if (!firebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// If the current session is anonymous (e.g. from before real sign-in
// existed, or a fresh device that hasn't signed in yet), LINKING the
// Google/email credential to that session keeps the same UID — so any
// data already saved under it stays reachable, instead of the user
// landing on a brand-new empty account. This only fails, and falls back
// to a normal sign-in, when that Google/email account is already
// registered elsewhere (i.e. you're signing into an existing account on
// a second device) — in that case there's nothing to link, you just want
// the existing account.
async function linkOrSignIn(linkFn, signInFn) {
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    try {
      await linkFn();
      return;
    } catch (err) {
      const recoverable = err.code === 'auth/credential-already-in-use' || err.code === 'auth/email-already-in-use';
      if (!recoverable) throw err;
    }
  }
  await signInFn();
}

export async function signInWithGoogle() {
  if (!firebaseConfigured || !auth) throw new Error('Firebase is not configured. Copy .env.example to .env and add your Firebase web app settings.');
  await linkOrSignIn(
    () => linkWithPopup(auth.currentUser, googleProvider),
    () => signInWithPopup(auth, googleProvider)
  );
}

export async function signUpWithEmail(email, password) {
  if (!firebaseConfigured || !auth) throw new Error('Firebase is not configured. Copy .env.example to .env and add your Firebase web app settings.');
  await linkOrSignIn(
    () => linkWithCredential(auth.currentUser, EmailAuthProvider.credential(email, password)),
    () => createUserWithEmailAndPassword(auth, email, password)
  );
}

export async function signInWithEmail(email, password) {
  if (!firebaseConfigured || !auth) throw new Error('Firebase is not configured. Copy .env.example to .env and add your Firebase web app settings.');
  await signInWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email) {
  if (!firebaseConfigured || !auth) throw new Error('Firebase is not configured. Copy .env.example to .env and add your Firebase web app settings.');
  await sendPasswordResetEmail(auth, email);
}

export async function signOutUser() {
  if (!firebaseConfigured || !auth) throw new Error('Firebase is not configured. Copy .env.example to .env and add your Firebase web app settings.');
  await signOut(auth);
}
