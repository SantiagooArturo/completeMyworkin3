// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfc9uJafS9qo0csb7M4eXm48KCd_GUI8A",
  authDomain: "regresiva-pagina-myworkin.firebaseapp.com",
  projectId: "regresiva-pagina-myworkin",
  storageBucket: "regresiva-pagina-myworkin.firebasestorage.app",
  messagingSenderId: "701939730349",
  appId: "1:701939730349:web:f04f1bb977d5449982c324"
};

// Initialize Firebase with a specific name
const app = initializeApp(firebaseConfig, 'countdown-app');
// const analytics = getAnalytics(app); // Comentado para evitar errores en SSR

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Configure Auth persistence settings for better session management
if (typeof window !== 'undefined') {
  // Only run on client side
  auth.useDeviceLanguage();
  
  // Set additional auth settings for better persistence
  auth.tenantId = null; // Ensure no tenant conflicts
  
  console.log('🔧 Firebase Auth configurado para persistencia local');
}

export default app;