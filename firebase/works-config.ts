// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfjW_DrMNv-Z0mXg3ynVhVxdZ9q6VaWrQ",
  authDomain: "works-today.firebaseapp.com",
  projectId: "works-today",
  storageBucket: "works-today.firebasestorage.app",
  messagingSenderId: "253625369676",
  appId: "1:253625369676:web:754edb514ea782cf8160e9",
  measurementId: "G-J8PBL6XKZ4"
};

// Initialize Firebase with a specific name
const app = initializeApp(firebaseConfig, 'works-app');
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firestore
export const worksDb = getFirestore(app);
export default app; 