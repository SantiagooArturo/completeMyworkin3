import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CountdownData {
  bot: string;
  targetDate: Date;
  createdAt: any;
}

/**
 * Inicializa o actualiza la cuenta regresiva para un bot específico
 * @param bot Nombre del bot
 * @param daysFromNow Días a partir de hoy para la fecha objetivo
 * @returns Promise<void>
 */
export async function initCountdown(bot: string, daysFromNow: number = 12): Promise<void> {
  try {
    // Calcular la fecha objetivo
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromNow);
    
    // Preparar los datos para Firestore
    const countdownData: CountdownData = {
      bot,
      targetDate,
      createdAt: serverTimestamp()
    };

    // Agregar el documento a la colección de cuentas regresivas
    await addDoc(collection(db, 'cuentas_regresivas'), countdownData);
    
    console.log(`Cuenta regresiva inicializada para ${bot} con fecha objetivo: ${targetDate}`);
  } catch (error) {
    console.error('Error al inicializar la cuenta regresiva:', error);
    throw error;
  }
}

// Ejecutar la inicialización si este archivo se ejecuta directamente
if (require.main === module) {
  initCountdown('El Chambas')
    .then(() => console.log('Inicialización completada'))
    .catch(console.error)
    .finally(() => process.exit(0));
} 