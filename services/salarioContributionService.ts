import { 
  collection, 
  addDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase/config';
import { 
  SalarioContribution, 
  SalarioContributionFormData 
} from '../types/salarios';

export class SalarioContributionService {
  private static SALARIOS_COLLECTION = 'salarios';

  /**
   * Guarda una contribución de salario en Firebase
   */
  static async saveContribution(
    user: User | null,
    formData: SalarioContributionFormData
  ): Promise<string> {
    try {
      const contribution: Omit<SalarioContribution, 'createdAt'> & { createdAt: any } = {
        empresa: formData.empresa.trim(),
        modalidadTrabajo: formData.modalidadTrabajo,
        lugar: formData.lugar.trim(),
        subvencionEconomica: formData.subvencionEconomica.trim(),
        industria: formData.industria,
        tamanoEmpresa: formData.tamanoEmpresa,
        salarioContratado: formData.salarioContratado.trim(),
        createdAt: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      };

      const docRef = await addDoc(collection(db, this.SALARIOS_COLLECTION), contribution);
      
      console.log('✅ Contribución de salario guardada:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error guardando contribución de salario:', error);
      throw new Error('No se pudo guardar la contribución. Inténtalo de nuevo.');
    }
  }
} 