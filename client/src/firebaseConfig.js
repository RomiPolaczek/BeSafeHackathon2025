import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const db = getDatabase(app);
const functions = getFunctions(app);

export { app, analytics, auth, firestore, storage, db, functions };

