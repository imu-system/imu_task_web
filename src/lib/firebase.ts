
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrkIAzZktPxCEZIbsHzRu-l00YPt3nSHY",
  authDomain: "imutask.firebaseapp.com",
  projectId: "imutask",
  storageBucket: "imutask.firebasestorage.app",
  messagingSenderId: "354457149125",
  appId: "1:354457149125:web:4fe8dbfa3192de5aa75aac"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
