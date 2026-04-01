import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigImport from '../firebase-applet-config.json';

// Default placeholder config
let firebaseConfig: any = firebaseConfigImport;

// Check if it's still the placeholder from the template
if (firebaseConfig.apiKey === "TODO_KEYHERE" || firebaseConfig.apiKey === "PLACEHOLDER") {
  console.warn("Firebase config is not yet configured.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
// Use the firestoreDatabaseId if provided in the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
