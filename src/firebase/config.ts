import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

import {
  PRIMARY_FIREBASE_ADMIN_EMAIL,
  SUPER_ADMIN_EMAILS,
  isMasterOperatorEmail,
  isSingleDepartmentLocked,
  getAuthErrorMessageAmharic,
} from './authPolicy';

export {
  PRIMARY_FIREBASE_ADMIN_EMAIL,
  SUPER_ADMIN_EMAILS,
  isMasterOperatorEmail,
  isSingleDepartmentLocked,
  getAuthErrorMessageAmharic,
};

// Initialize Firebase App safely (reuse existing app instance if already initialized to prevent duplicate app errors)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Initialize Auth: keep default Google Sign-In free of restricted Drive scopes so all users can sign in
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Dedicated Google provider for Master Operator login with account hint
export const masterOperatorGoogleProvider = new GoogleAuthProvider();
masterOperatorGoogleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: PRIMARY_FIREBASE_ADMIN_EMAIL,
});

// Dedicated Google Drive provider used only when explicitly connecting Google Drive
export const googleDriveProvider = new GoogleAuthProvider();
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token cache (CRITICAL: Do NOT store in localStorage)
let cachedAccessToken: string | null = null;
export const getCachedGoogleToken = (): string | null => cachedAccessToken;
export const setCachedGoogleToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Initialize Cloud Storage for uploaded works/manuscripts
export const storage = getStorage(app);

// Optional non-blocking connectivity test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    // Non-blocking query with short fallback
    await Promise.race([
      getDocFromServer(testDocRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    // Firestore operates automatically in offline cache mode when backend is unreachable
    return false;
  }
}

void testFirestoreConnection();

