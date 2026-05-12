/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const isConfigValid = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'MOCK_API_KEY';

try {
  if (getApps().length === 0) {
    if (isConfigValid) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      // @ts-ignore
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    } else {
      console.warn("Firebase: Using placeholder configuration. Data services will be restricted.");
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { app, auth, db };
export default app;
