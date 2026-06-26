// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkH8K2_ZB-sfMhv84jwzMULRHPMifBucI",
  authDomain: "servess-90d15.firebaseapp.com",
  projectId: "servess-90d15",
  storageBucket: "servess-90d15.firebasestorage.app",
  messagingSenderId: "791204209191",
  appId: "1:791204209191:web:0814c10864f26a9ef86402",
  measurementId: "G-GMY9F9LXJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Analytics (optional, might not work in some local dev environments without setup)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
