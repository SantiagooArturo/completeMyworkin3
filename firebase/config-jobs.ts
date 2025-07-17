import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnjANsZGTinI0OGvlWFRQLlPUOi6D5Xw0",
  authDomain: "jobs-update-e3e63.firebaseapp.com",
  projectId: "jobs-update-e3e63",
  storageBucket: "jobs-update-e3e63.firebasestorage.app",
  messagingSenderId: "820889939052",
  appId: "1:820889939052:web:205b777b4a30dff7b73c49",
  measurementId: "G-VS5JKZBR1L"
};

// Initialize Firebase with a specific name
const app = initializeApp(firebaseConfig, 'jobs-update');
// const analytics = getAnalytics(app); // Comentado para evitar errores en SSR

// Initialize Firestore
export const db2 = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;