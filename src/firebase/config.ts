import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  } catch {
    // Firestore operates automatically in offline cache mode when backend is unreachable
    return false;
  }
}

