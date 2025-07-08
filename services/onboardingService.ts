import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User } from 'firebase/auth';

export interface OnboardingData {
  // Step 1: Información académica
  educationType: 'universitario' | 'tecnico';
  currentCareer: string;
  studyCenter: string;
  studyStatus: 'estudiando' | 'egresado';
  currentCycle?: string;
  graduationYear?: string;
  
  // Step 2: Preferencias laborales
  interestedRoles: string[];
  workType: string[];

  // Step 4: CV Information
  cvSource: 'uploaded' | 'created' | null;
  cvId?: string;
  cvFileName?: string;
  cvFileUrl?: string;
  cvData?: {
    personalInfo: {
      fullName: string;
      email: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      portfolio?: string;
    };
    experience?: any[];
    education?: any[];
    skills?: string[];
    languages?: any[];
  };
  
  // Legacy fields (mantener compatibilidad)
  position?: string;
  experience?: string;
  skills?: string[];
  industry?: string;
  university?: string;
  degree?: string;
  objectives?: string[];
  notifications?: {
    email: boolean;
    jobAlerts: boolean;
    tips: boolean;
  };
  hasCV?: string;
  
  // Metadata
  completedAt?: any;
  isCompleted?: boolean;
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
        skills: (onboardingData.skills && onboardingData.skills.length > 0) ? onboardingData.skills : existingData.skills,
        industry: onboardingData.industry || existingData.industry,
        degree: onboardingData.degree || existingData.degree,
        graduationYear: onboardingData.graduationYear || existingData.graduationYear,
        objectives: (onboardingData.objectives && onboardingData.objectives.length > 0) ? onboardingData.objectives : existingData.objectives,
        
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
      data.skills && data.skills.length > 0,
      data.industry,
      data.university,
      data.degree,
      data.graduationYear,
      data.objectives && data.objectives.length > 0,
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

  /**
   * Guarda los datos del onboarding paso a paso
   */
  static async saveStepData(user: User, stepData: Partial<OnboardingData>) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Obtener datos existentes
      const userDoc = await getDoc(userDocRef);
      const existingOnboarding = userDoc.exists() ? userDoc.data().onboarding || {} : {};
      
      // Merge con datos existentes
      const updatedOnboarding = {
        ...existingOnboarding,
        ...stepData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, {
        onboarding: updatedOnboarding,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error guardando datos de onboarding:', error);
      throw error;
    }
  }
  
  /**
   * Marca el onboarding como completado y extrae datos importantes
   */
  static async completeOnboarding(user: User, finalData: OnboardingData) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      const completeData = {
        ...finalData,
        isCompleted: true,
        completedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, {
        onboarding: completeData,
        // Extraer datos importantes al nivel principal del usuario
        career: finalData.currentCareer,
        university: finalData.studyCenter,
        educationType: finalData.educationType,
        studyStatus: finalData.studyStatus,
        interestedRoles: finalData.interestedRoles,
        workType: finalData.workType,
        // Si hay datos de CV, extraerlos también
        ...(finalData.cvData?.personalInfo && {
          phone: finalData.cvData.personalInfo.phone,
          location: finalData.cvData.personalInfo.location,
          linkedin: finalData.cvData.personalInfo.linkedin,
          portfolio: finalData.cvData.personalInfo.portfolio
        }),
        profileCompleted: true,
        onboardingCompleted: true,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error completando onboarding:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si el usuario ha completado el onboarding
   */
  static async isOnboardingCompleted(user: User): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.onboarding?.isCompleted || userData.onboardingCompleted || false;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando onboarding:', error);
      return false;
    }
  }
  
  /**
   * Extrae datos del CV y los integra al onboarding
   */
  static extractCVData(cvData: any): Partial<OnboardingData> {
    const extractedData: Partial<OnboardingData> = {
      cvData: {
        personalInfo: {
          fullName: cvData.personalInfo?.fullName || '',
          email: cvData.personalInfo?.email || '',
          phone: cvData.personalInfo?.phone || '',
          location: cvData.personalInfo?.location || '',
          linkedin: cvData.personalInfo?.linkedin || '',
          portfolio: cvData.personalInfo?.portfolio || ''
        },
        experience: cvData.experience || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        languages: cvData.languages || []
      }
    };
    
    return extractedData;
  }

  /**
   * Integra datos de CV creado al onboarding
   */
  static async integrateCVData(user: User, cvId: string, cvData: any, source: 'uploaded' | 'created') {
    try {
      const extractedData = this.extractCVData(cvData);
      
      await this.saveStepData(user, {
        cvSource: source,
        cvId: cvId,
        ...extractedData
      });
      
      return true;
    } catch (error) {
      console.error('Error integrando datos de CV:', error);
      throw error;
    }
  }

  /**
   * Extrae y guarda datos personales del CV al perfil del usuario
   */
  static async updateUserProfileFromCV(user: User, cvData: any) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Extraer datos relevantes del CV
      const profileUpdates: any = {
        updatedAt: serverTimestamp()
      };
      
      // Datos personales del CV
      if (cvData.personalInfo) {
        if (cvData.personalInfo.phone) profileUpdates.phone = cvData.personalInfo.phone;
        if (cvData.personalInfo.location) profileUpdates.location = cvData.personalInfo.location;
        if (cvData.personalInfo.linkedin) profileUpdates.linkedin = cvData.personalInfo.linkedin;
        if (cvData.personalInfo.portfolio) profileUpdates.portfolio = cvData.personalInfo.portfolio;
      }
      
      // Habilidades del CV
      if (cvData.skills && cvData.skills.length > 0) {
        profileUpdates.skills = cvData.skills;
      }
      
      // Experiencia (extraer el último trabajo como posición actual)
      if (cvData.experience && cvData.experience.length > 0) {
        const latestJob = cvData.experience[0]; // Asumiendo que está ordenado por fecha
        if (latestJob.position) profileUpdates.currentPosition = latestJob.position;
        if (latestJob.company) profileUpdates.currentCompany = latestJob.company;
      }
      
      // Educación (extraer la más reciente)
      if (cvData.education && cvData.education.length > 0) {
        const latestEducation = cvData.education[0];
        if (latestEducation.institution) profileUpdates.educationInstitution = latestEducation.institution;
        if (latestEducation.degree) profileUpdates.educationDegree = latestEducation.degree;
      }
      
      // Idiomas
      if (cvData.languages && cvData.languages.length > 0) {
        profileUpdates.languages = cvData.languages;
      }
      
      // Marcar que el perfil ha sido enriquecido con datos del CV
      profileUpdates.cvDataIntegrated = true;
      profileUpdates.profileEnriched = true;
      
      await updateDoc(userDocRef, profileUpdates);
      
      return true;
    } catch (error) {
      console.error('Error actualizando perfil desde CV:', error);
      throw error;
    }
  }
}
