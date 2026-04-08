import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAYHMYDPz0BRbQi2bf81jYCwSX0CzOMGmM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bar-order-75325.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bar-order-75325",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bar-order-75325.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "749443743449",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:749443743449:web:2feb64674a2f6456bac8c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;