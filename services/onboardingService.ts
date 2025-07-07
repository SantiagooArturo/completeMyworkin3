import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User } from 'firebase/auth';

export interface OnboardingData {
  position: string;
  experience: string;
  skills: string[];
  industry: string;
  university: string;
  degree: string;
  graduationYear: string;
  objectives: string[];
  notifications: {
    email: boolean;
    jobAlerts: boolean;
    tips: boolean;
  };
  // Nuevos campos para el onboarding actualizado
  educationType: string; // 'universitario' o 'tecnico'
  currentCareer: string;
  studyCenter: string;
  studyStatus: string; // 'estudiando' o 'egresado'
  currentCycle: string;
  interestedRoles: string[];
  workType: string[]; // Cambiado a string[] para selección múltiple
  hasCV: string;
}

export interface OnboardingState {
  completed: boolean;
  completedAt?: Date;
  currentStep?: number;
  data: Partial<OnboardingData>;
}

export class OnboardingService {
  
  /**
   * Guarda o actualiza los datos del onboarding del usuario
   */
  static async saveOnboardingData(user: User, onboardingData: OnboardingData): Promise<void> {
    if (!user?.uid) {
      throw new Error('Usuario no válido');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Obtener datos existentes del usuario
      const userDoc = await getDoc(userDocRef);
      const existingData = userDoc.data() || {};

      // Preparar datos para actualizar
      const updateData = {
        ...existingData,
        // Actualizar información principal del perfil
        university: onboardingData.university || existingData.university,
        position: onboardingData.position || existingData.position,
        skills: onboardingData.skills.length > 0 ? onboardingData.skills : existingData.skills,
        industry: onboardingData.industry || existingData.industry,
        degree: onboardingData.degree || existingData.degree,
        graduationYear: onboardingData.graduationYear || existingData.graduationYear,
        objectives: onboardingData.objectives.length > 0 ? onboardingData.objectives : existingData.objectives,
        
        // Información del onboarding
        onboarding: {
          completed: true,
          completedAt: new Date(),
          data: onboardingData,
        },
        
        // Preferencias de notificaciones
        notifications: {
          ...existingData.notifications,
          ...onboardingData.notifications,
        },
        
        // Metadata
        updatedAt: new Date(),
        profileCompleteness: this.calculateProfileCompleteness(onboardingData),
      };

      await updateDoc(userDocRef, updateData);
      
      console.log('Datos de onboarding guardados correctamente');
    } catch (error) {
      console.error('Error guardando datos de onboarding:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado actual del onboarding del usuario
   */
  static async getOnboardingState(user: User): Promise<OnboardingState | null> {
    if (!user?.uid) {
      return null;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return userData.onboarding || {
        completed: false,
        currentStep: 1,
        data: {},
      };
    } catch (error) {
      console.error('Error obteniendo estado de onboarding:', error);
      return null;
    }
  }

  /**
   * Guarda el progreso actual del onboarding (sin completarlo)
   */
  static async saveOnboardingProgress(
    user: User, 
    currentStep: number, 
    partialData: Partial<OnboardingData>
  ): Promise<void> {
    if (!user?.uid) {
      throw new Error('Usuario no válido');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const existingData = userDoc.data() || {};

      await updateDoc(userDocRef, {
        ...existingData,
        onboarding: {
          ...existingData.onboarding,
          completed: false,
          currentStep,
          data: {
            ...existingData.onboarding?.data,
            ...partialData,
          },
          lastUpdated: new Date(),
        },
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error guardando progreso de onboarding:', error);
      throw error;
    }
  }

  /**
   * Calcula el porcentaje de completitud del perfil
   */
  private static calculateProfileCompleteness(data: OnboardingData): number {
    const fields = [
      data.position,
      data.experience,
      data.skills.length > 0,
      data.industry,
      data.university,
      data.degree,
      data.graduationYear,
      data.objectives.length > 0,
    ];

    const completedFields = fields.filter(field => Boolean(field)).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Verifica si el usuario necesita completar el onboarding
   */
  static async needsOnboarding(user: User): Promise<boolean> {
    const state = await this.getOnboardingState(user);
    return !state?.completed;
  }

  /**
   * Marca el onboarding como omitido (skipped)
   */
  static async skipOnboarding(user: User): Promise<void> {
    if (!user?.uid) {
      throw new Error('Usuario no válido');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const existingData = userDoc.data() || {};

      await updateDoc(userDocRef, {
        ...existingData,
        onboarding: {
          completed: true,
          skipped: true,
          skippedAt: new Date(),
          data: existingData.onboarding?.data || {},
        },
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error marcando onboarding como omitido:', error);
      throw error;
    }
  }
}
