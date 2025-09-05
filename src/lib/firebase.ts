
import { initializeApp, getApps } from 'firebase/app';
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
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
