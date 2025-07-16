import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeCountdown() {
  try {
    // Crear fecha objetivo (8 días desde ahora)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 8);

    // Crear documento en la colección cuentas_regresivas
    const docRef = await addDoc(collection(db, 'cuentas_regresivas'), {
      bot: 'El Chambas',
      targetDate: targetDate,
      createdAt: new Date(),
      description: 'Lanzamiento de El Chambas'
    });

    console.log('Cuenta regresiva inicializada con ID:', docRef.id);
  } catch (error) {
    console.error('Error al inicializar la cuenta regresiva:', error);
  }
}

// Ejecutar la inicialización
initializeCountdown(); 