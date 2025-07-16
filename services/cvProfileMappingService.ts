import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User } from 'firebase/auth';

// Tipos importados del API de extracción
export interface ExtractedProfileData {
  personalInfo: {
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  professional: {
    position?: string;
    bio?: string;
    skills: string[];
  };
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    isCurrent: boolean;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }>;
  languages: Array<{
    language: string;
    level: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

// Estructura del perfil actual del usuario
export interface UserProfileData {
  phone?: string;
  location?: string;
  university?: string;
  bio?: string;
  position?: string;
  skills?: string[];
  linkedin?: string;
  portfolio?: string;
  languages?: string[];
  [key: string]: any;
}

// Resultado del mapeo con detalle de cambios
export interface MappingResult {
  profileUpdates: UserProfileData;
  conflicts: ConflictInfo[];
  newData: NewDataInfo[];
  summary: MappingSummary;
}

export interface ConflictInfo {
  field: string;
  currentValue: any;
  newValue: any;
  recommendation: 'keep_current' | 'use_new' | 'merge';
  reason: string;
}

export interface NewDataInfo {
  field: string;
  value: any;
  source: 'cv_extraction';
  description: string;
}

export interface MappingSummary {
  totalFields: number;
  newFields: number;
  conflicts: number;
  autoApplied: number;
  experienceEntries: number;
  educationEntries: number;
}

export class CVProfileMappingService {
  
  /**
   * Mapea datos extraídos del CV al perfil del usuario
   */
  static async mapCVDataToProfile(
    extractedData: ExtractedProfileData,
    currentProfile: UserProfileData
  ): Promise<MappingResult> {
    const conflicts: ConflictInfo[] = [];
    const newData: NewDataInfo[] = [];
    const profileUpdates: UserProfileData = { ...currentProfile };

    // 1. Mapear información personal
    this.mapPersonalInfo(extractedData.personalInfo, currentProfile, profileUpdates, conflicts, newData);

    // 2. Mapear información profesional
    this.mapProfessionalInfo(extractedData.professional, currentProfile, profileUpdates, conflicts, newData);

    // 3. Mapear educación (obtener la universidad más reciente)
    this.mapEducationInfo(extractedData.education, currentProfile, profileUpdates, conflicts, newData);

    // 4. Crear biografía profesional automática
    this.generateAutoBio(extractedData, profileUpdates, newData);

    // 5. Procesar idiomas
    this.mapLanguages(extractedData.languages, currentProfile, profileUpdates, newData);

    // 6. Almacenar datos de experiencia y proyectos para componentes timeline
    this.storeTimelineData(extractedData, profileUpdates);

    const summary: MappingSummary = {
      totalFields: Object.keys(profileUpdates).length,
      newFields: newData.length,
      conflicts: conflicts.length,
      autoApplied: newData.length - conflicts.length,
      experienceEntries: extractedData.experience.length,
      educationEntries: extractedData.education.length
    };

    return {
      profileUpdates,
      conflicts,
      newData,
      summary
    };
  }

  /**
   * Mapea información personal
   */
  private static mapPersonalInfo(
    personalInfo: ExtractedProfileData['personalInfo'],
    currentProfile: UserProfileData,
    profileUpdates: UserProfileData,
    conflicts: ConflictInfo[],
    newData: NewDataInfo[]
  ) {
    // Teléfono
    if (personalInfo.phone) {
      if (currentProfile.phone && currentProfile.phone !== personalInfo.phone) {
        conflicts.push({
          field: 'phone',
          currentValue: currentProfile.phone,
          newValue: personalInfo.phone,
          recommendation: 'use_new',
          reason: 'El CV generalmente contiene información más actualizada'
        });
      } else if (!currentProfile.phone) {
        profileUpdates.phone = personalInfo.phone;
        newData.push({
          field: 'phone',
          value: personalInfo.phone,
          source: 'cv_extraction',
          description: 'Teléfono extraído del CV'
        });
      }
    }

    // Ubicación
    if (personalInfo.location) {
      if (currentProfile.location && currentProfile.location !== personalInfo.location) {
        conflicts.push({
          field: 'location',
          currentValue: currentProfile.location,
          newValue: personalInfo.location,
          recommendation: 'use_new',
          reason: 'Ubicación del CV es más específica'
        });
      } else if (!currentProfile.location) {
        profileUpdates.location = personalInfo.location;
        newData.push({
          field: 'location',
          value: personalInfo.location,
          source: 'cv_extraction',
          description: 'Ubicación extraída del CV'
        });
      }
    }

    // LinkedIn
    if (personalInfo.linkedin) {
      profileUpdates.linkedin = personalInfo.linkedin;
      newData.push({
        field: 'linkedin',
        value: personalInfo.linkedin,
        source: 'cv_extraction',
        description: 'Perfil de LinkedIn'
      });
    }

    // Portfolio
    if (personalInfo.portfolio) {
      profileUpdates.portfolio = personalInfo.portfolio;
      newData.push({
        field: 'portfolio',
        value: personalInfo.portfolio,
        source: 'cv_extraction',
        description: 'Sitio web/Portfolio personal'
      });
    }
  }

  /**
   * Mapea información profesional
   */
  private static mapProfessionalInfo(
    professional: ExtractedProfileData['professional'],
    currentProfile: UserProfileData,
    profileUpdates: UserProfileData,
    conflicts: ConflictInfo[],
    newData: NewDataInfo[]
  ) {
    // Posición actual
    if (professional.position) {
      if (currentProfile.position && currentProfile.position !== professional.position) {
        conflicts.push({
          field: 'position',
          currentValue: currentProfile.position,
          newValue: professional.position,
          recommendation: 'use_new',
          reason: 'Posición del CV refleja el cargo más reciente'
        });
      } else if (!currentProfile.position) {
        profileUpdates.position = professional.position;
        newData.push({
          field: 'position',
          value: professional.position,
          source: 'cv_extraction',
          description: 'Posición actual extraída del CV'
        });
      }
    }

    // Habilidades
    if (professional.skills.length > 0) {
      const currentSkills = currentProfile.skills || [];
      const newSkills = professional.skills.filter(skill => 
        !currentSkills.some(existing => 
          existing.toLowerCase() === skill.toLowerCase()
        )
      );

      if (newSkills.length > 0) {
        profileUpdates.skills = [...currentSkills, ...newSkills];
        newData.push({
          field: 'skills',
          value: newSkills,
          source: 'cv_extraction',
          description: `${newSkills.length} nuevas habilidades del CV`
        });
      }
    }
  }

  /**
   * Mapea información educativa
   */
  private static mapEducationInfo(
    education: ExtractedProfileData['education'],
    currentProfile: UserProfileData,
    profileUpdates: UserProfileData,
    conflicts: ConflictInfo[],
    newData: NewDataInfo[]
  ) {
    if (education.length > 0) {
      // Tomar la institución más reciente o actual
      const currentEducation = education.find(edu => edu.isCurrent) || education[0];
      
      if (currentEducation?.institution) {
        if (currentProfile.university && currentProfile.university !== currentEducation.institution) {
          conflicts.push({
            field: 'university',
            currentValue: currentProfile.university,
            newValue: currentEducation.institution,
            recommendation: 'use_new',
            reason: 'Universidad del CV es más específica'
          });
        } else if (!currentProfile.university) {
          profileUpdates.university = currentEducation.institution;
          newData.push({
            field: 'university',
            value: currentEducation.institution,
            source: 'cv_extraction',
            description: 'Universidad extraída del CV'
          });
        }
      }
    }
  }

  /**
   * Genera biografía automática basada en la experiencia
   */
  private static generateAutoBio(
    extractedData: ExtractedProfileData,
    profileUpdates: UserProfileData,
    newData: NewDataInfo[]
  ) {
    if (!profileUpdates.bio && extractedData.professional.bio) {
      profileUpdates.bio = extractedData.professional.bio;
      newData.push({
        field: 'bio',
        value: extractedData.professional.bio,
        source: 'cv_extraction',
        description: 'Biografía profesional generada del CV'
      });
    } else if (!profileUpdates.bio && extractedData.experience.length > 0) {
      // Generar biografía basada en experiencia
      const currentJob = extractedData.experience.find(exp => exp.isCurrent) || extractedData.experience[0];
      const skillsText = extractedData.professional.skills.slice(0, 5).join(', ');
      
      let autoBio = '';
      if (currentJob) {
        autoBio = `${currentJob.position} en ${currentJob.company}.`;
        if (skillsText) {
          autoBio += ` Especializado en ${skillsText}.`;
        }
        if (extractedData.experience.length > 1) {
          autoBio += ` Con ${extractedData.experience.length} experiencias profesionales.`;
        }
      }

      if (autoBio) {
        profileUpdates.bio = autoBio;
        newData.push({
          field: 'bio',
          value: autoBio,
          source: 'cv_extraction',
          description: 'Biografía generada automáticamente del CV'
        });
      }
    }
  }

  /**
   * Mapea idiomas
   */
  private static mapLanguages(
    languages: ExtractedProfileData['languages'],
    currentProfile: UserProfileData,
    profileUpdates: UserProfileData,
    newData: NewDataInfo[]
  ) {
    if (languages.length > 0) {
      const languageStrings = languages.map(lang => `${lang.language} (${lang.level})`);
      profileUpdates.languages = languageStrings;
      newData.push({
        field: 'languages',
        value: languageStrings,
        source: 'cv_extraction',
        description: `${languages.length} idiomas extraídos del CV`
      });
    }
  }

  /**
   * Almacena datos para timeline components
   */
  private static storeTimelineData(
    extractedData: ExtractedProfileData,
    profileUpdates: UserProfileData
  ) {
    // Almacenar experiencia para timeline
    if (extractedData.experience.length > 0) {
      profileUpdates.cvExperience = extractedData.experience;
    }

    // Almacenar educación para timeline
    if (extractedData.education.length > 0) {
      profileUpdates.cvEducation = extractedData.education;
    }

    // Almacenar proyectos
    if (extractedData.projects.length > 0) {
      profileUpdates.cvProjects = extractedData.projects;
    }
  }

  /**
   * Aplica los cambios al perfil del usuario en Firestore
   */
  static async applyProfileUpdates(
    user: User,
    profileUpdates: UserProfileData,
    conflicts: ConflictInfo[] = [],
    selectedResolutions: { [field: string]: 'keep_current' | 'use_new' } = {}
  ): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Resolver conflictos basado en selecciones del usuario
      const finalUpdates = { ...profileUpdates };
      
      for (const conflict of conflicts) {
        const resolution = selectedResolutions[conflict.field];
        if (resolution === 'keep_current') {
          // Mantener valor actual (no actualizar)
          delete finalUpdates[conflict.field];
        } else if (resolution === 'use_new') {
          // Usar nuevo valor (ya está en finalUpdates)
          finalUpdates[conflict.field] = conflict.newValue;
        }
      }

      // Agregar metadata de integración
      finalUpdates.cvDataIntegrated = true;
      finalUpdates.cvDataIntegratedAt = new Date();
      finalUpdates.updatedAt = new Date();

      await updateDoc(userDocRef, finalUpdates);
      
      console.log('✅ Perfil actualizado exitosamente con datos del CV');
    } catch (error) {
      console.error('❌ Error aplicando actualizaciones del perfil:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil actual del usuario desde Firestore
   */
  static async getCurrentProfile(user: User): Promise<UserProfileData> {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfileData;
      }
      return {};
    } catch (error) {
      console.error('❌ Error obteniendo perfil actual:', error);
      return {};
    }
  }

  /**
   * Genera resumen amigable para mostrar al usuario
   */
  static generateUserFriendlySummary(result: MappingResult): string {
    const { summary, newData, conflicts } = result;
    
    let message = `✨ Hemos extraído ${summary.totalFields} campos de tu CV.\n\n`;
    
    if (summary.newFields > 0) {
      message += `🆕 ${summary.newFields} campos nuevos agregados:\n`;
      newData.forEach(item => {
        message += `• ${item.description}\n`;
      });
      message += '\n';
    }

    if (summary.conflicts > 0) {
      message += `⚠️ ${summary.conflicts} conflictos detectados que requieren tu decisión.\n\n`;
    }

    if (summary.experienceEntries > 0) {
      message += `💼 ${summary.experienceEntries} experiencias laborales para timeline.\n`;
    }

    if (summary.educationEntries > 0) {
      message += `🎓 ${summary.educationEntries} estudios para timeline.\n`;
    }

    return message.trim();
  }
} 