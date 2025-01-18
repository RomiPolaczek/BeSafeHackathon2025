import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFunctions } from 'firebase/functions';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBb8RS48vrnAZuGsCL6K--OoGPhVb2vi9c",
  authDomain: "safe-chat-8e668.firebaseapp.com",
  projectId: "safe-chat-8e668",
  storageBucket: "safe-chat-8e668.appspot.com",
  messagingSenderId: "791225327847",
  appId: "1:791225327847:web:35989d107c0f0397644242",
  measurementId: "G-WVHH26QC13",
  databaseURL: "https://safe-chat-8e668-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const db = getDatabase(app);
export const functions = getFunctions(app);
export const messaging = getMessaging(app);

export { app };

export const getFirebase = () => ({
  app,
  analytics,
  auth,
  firestore,
  storage,
  db,
  functions,
  messaging
});

// This function is now exported
export const initializeFirebase = () => {
  console.log('Firebase already initialized');
  return app;
};

