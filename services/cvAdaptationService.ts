'use client';

import { User } from 'firebase/auth';
import { CVData } from '@/types/cv';
import { UnifiedCVService } from './unifiedCVService';
import { cvBuilderService } from './cvBuilderService';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface JobAdaptationContext {
  jobTitle: string;
  company: string;
  location?: string;
  requirements?: string;
  description?: string;
  skills?: string[];
  industry?: string;
}

export interface AdaptedCVResult {
  adaptedCV: CVData;
  adaptationId: string;
  adaptationSummary: {
    totalChanges: number;
    changesById: {
      personalInfo: number;
      summary: number;
      skills: number;
      experience: number;
      projects: number;
    };
    suggestedImprovements: string[];
  };
}

export class CVAdaptationService {
  
  /**
   * Obtiene el CV más reciente del usuario para adaptación
   * PRIORIDAD: 1) CV vinculado al perfil, 2) CVs creados, 3) CVs subidos, 4) CVs analizados
   */
  static async getUserCurrentCV(user: User): Promise<CVData | null> {
    try {
      // 🎯 PRIORIDAD MÁXIMA: Buscar CV vinculado al perfil del usuario
      const linkedCV = await this.getLinkedProfileCV(user);
      if (linkedCV) {
        console.log('✅ Usando CV vinculado al perfil para adaptación');
        return linkedCV;
      }

    //   // Si no hay CV vinculado, usar la lógica anterior
    //   const unifiedCVService = UnifiedCVService.getInstance();
    //   const userCVs = await unifiedCVService.getAllUserCVs(user);
      
    //   if (userCVs.length === 0) {
    //     console.log('❌ No se encontró ningún CV para el usuario');
    //     return null;
    //   }

    //   // Priorizar CVs creados, luego subidos, luego analizados
    //   const prioritizedCVs = userCVs.sort((a, b) => {
    //     const priorityOrder = { 'created': 1, 'uploaded': 2, 'analyzed': 3 };
    //     const priorityA = priorityOrder[a.source] || 4;
    //     const priorityB = priorityOrder[b.source] || 4;
        
    //     if (priorityA !== priorityB) {
    //       return priorityA - priorityB;
    //     }
        
    //     // Si tienen la misma prioridad, ordenar por fecha
    //     const dateA = a.updatedAt?.toDate() || a.createdAt?.toDate() || new Date(0);
    //     const dateB = b.updatedAt?.toDate() || b.createdAt?.toDate() || new Date(0);
    //     return dateB.getTime() - dateA.getTime();
    //   });

    //   const mostRecentCV = prioritizedCVs[0];
      
    //   // Si es un CV creado, obtener los datos directamente
    //   if (mostRecentCV.source === 'created' && mostRecentCV.cvData) {
    //     console.log('✅ Usando CV creado para adaptación');
    //     return mostRecentCV.cvData as CVData;
    //   }
      
    //   // Si es un CV subido, extraer datos del onboarding
    //   if (mostRecentCV.source === 'uploaded') {
    //     console.log('🔄 Extrayendo datos de CV subido para adaptación...');
    //     return await this.extractCVDataFromUploadedCV(user, mostRecentCV);
    //   }
      
    //   // Si es un CV analizado, extraer de los análisis
    //   if (mostRecentCV.source === 'analyzed') {
    //     console.log('🔄 Extrayendo datos de CV analizado para adaptación...');
    //     return await this.extractCVDataFromAnalyzedCV(user, mostRecentCV);
    //   }
      
      return null;
      
    } catch (error) {
      console.error('Error obteniendo CV actual del usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene el CV vinculado al perfil del usuario
   */
  private static async getLinkedProfileCV(user: User): Promise<CVData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        console.log('❌ Documento de usuario no encontrado');
        return null;
      }

      const userData = userDoc.data();
      
      // Verificar si tiene un CV vinculado
      if (!userData.cvFileUrl || !userData.cvFileName) {
        console.log('ℹ️ Usuario no tiene CV vinculado al perfil');
        return null;
      }

      console.log(`🔗 CV vinculado encontrado: ${userData.cvFileName}`);
      console.log(`📄 URL del PDF: ${userData.cvFileUrl}`);

      // Extraer datos del PDF usando la IA
      const extractedData = await this.extractCVDataFromPDF(userData.cvFileUrl, user.uid);
      
      if (!extractedData) {
        console.warn('⚠️ No se pudieron extraer datos del CV vinculado');
        return null;
      }

      console.log('✅ Datos extraídos exitosamente del CV vinculado');
      return extractedData;

    } catch (error) {
      console.error('❌ Error obteniendo CV vinculado al perfil:', error);
      return null;
    }
  }

  /**
   * Adapta un CV existente para un puesto específico
   */
  static async adaptCVForJob(
    originalCV: CVData,
    jobContext: JobAdaptationContext,
    user: User
  ): Promise<AdaptedCVResult> {
    try {
      console.log('🔄 Iniciando adaptación de CV para:', jobContext.jobTitle, 'en', jobContext.company);
      
      const adaptedCV = JSON.parse(JSON.stringify(originalCV)) as CVData;
      let totalChanges = 0;
      const changesById = {
        personalInfo: 0,
        summary: 0,
        skills: 0,
        experience: 0,
        projects: 0
      };
      const suggestedImprovements: string[] = [];

      // 1. Adaptar información personal (objetivo profesional en el summary)
      const adaptedSummary = this.adaptSummary(originalCV.personalInfo.summary, jobContext);
      if (adaptedSummary !== originalCV.personalInfo.summary) {
        adaptedCV.personalInfo.summary = adaptedSummary;
        changesById.summary++;
        totalChanges++;
        console.log('✅ Summary adaptado para el puesto');
      }

      // 2. Adaptar y reorganizar habilidades
      const adaptedSkills = this.adaptSkills(originalCV.skills, jobContext);
      if (adaptedSkills.length !== originalCV.skills.length || 
          JSON.stringify(adaptedSkills) !== JSON.stringify(originalCV.skills)) {
        adaptedCV.skills = adaptedSkills;
        changesById.skills++;
        totalChanges++;
        console.log('✅ Habilidades adaptadas y reorganizadas');
      }

      // 3. Adaptar experiencia laboral (reordenar y enfatizar relevancia)
      const adaptedExperience = this.adaptWorkExperience(originalCV.workExperience, jobContext);
      if (JSON.stringify(adaptedExperience) !== JSON.stringify(originalCV.workExperience)) {
        adaptedCV.workExperience = adaptedExperience;
        changesById.experience++;
        totalChanges++;
        console.log('✅ Experiencia laboral adaptada');
      }

      // 4. Adaptar proyectos (destacar relevantes)
      const adaptedProjects = this.adaptProjects(originalCV.projects, jobContext);
      if (JSON.stringify(adaptedProjects) !== JSON.stringify(originalCV.projects)) {
        adaptedCV.projects = adaptedProjects;
        changesById.projects++;
        totalChanges++;
        console.log('✅ Proyectos adaptados');
      }

      // 5. Generar sugerencias de mejora
      suggestedImprovements.push(...this.generateImprovementSuggestions(originalCV, jobContext));

      // 6. Guardar adaptación en Firestore para tracking
      const adaptationId = await this.saveAdaptationRecord(user, jobContext, totalChanges);

      console.log(`🎯 Adaptación completada: ${totalChanges} cambios realizados`);

      return {
        adaptedCV,
        adaptationId,
        adaptationSummary: {
          totalChanges,
          changesById,
          suggestedImprovements
        }
      };

    } catch (error) {
      console.error('❌ Error adaptando CV:', error);
      throw new Error('Error al adaptar el CV para el puesto');
    }
  }

  /**
   * Adapta el summary/objetivo profesional para el puesto
   */
  private static adaptSummary(originalSummary: string, jobContext: JobAdaptationContext): string {
    if (!originalSummary) {
      return `Profesional motivado buscando oportunidades como ${jobContext.jobTitle} en ${jobContext.company}. Enfocado en contribuir al crecimiento de la organización mediante mis habilidades y experiencia.`;
    }

    // Reglas básicas de adaptación del summary
    let adaptedSummary = originalSummary;

    // Añadir mención específica del puesto y empresa al final si no existe
    const jobMention = `${jobContext.jobTitle} en ${jobContext.company}`;
    if (!adaptedSummary.toLowerCase().includes(jobContext.jobTitle.toLowerCase()) ||
        !adaptedSummary.toLowerCase().includes(jobContext.company.toLowerCase())) {
      
      adaptedSummary += ` Especialmente interesado en oportunidades como ${jobMention} donde pueda aplicar mi experiencia y continuar desarrollando mis competencias profesionales.`;
    }

    return adaptedSummary;
  }

  /**
   * Adapta y reorganiza las habilidades según la relevancia para el puesto
   */
  private static adaptSkills(originalSkills: any[], jobContext: JobAdaptationContext): any[] {
    if (!originalSkills || originalSkills.length === 0) return [];

    const skillsArray = [...originalSkills];
    
    // Palabras clave para priorización
    const jobKeywords = [
      ...(jobContext.jobTitle?.toLowerCase().split(' ') || []),
      ...(jobContext.requirements?.toLowerCase().split(/[\s,]+/) || []),
      ...(jobContext.skills || []).map(s => s.toLowerCase()),
      ...(jobContext.industry?.toLowerCase().split(' ') || [])
    ].filter(keyword => keyword.length > 3); // Filtrar palabras muy cortas

    // Función para calcular relevancia de una habilidad
    const calculateRelevance = (skill: any): number => {
      const skillName = skill.name?.toLowerCase() || '';
      let relevance = 0;
      
      jobKeywords.forEach(keyword => {
        if (skillName.includes(keyword) || keyword.includes(skillName)) {
          relevance += 2; // Coincidencia directa
        }
      });
      
      // Boost para habilidades técnicas y de liderazgo
      if (['Technical', 'Leadership', 'Analytical'].includes(skill.category)) {
        relevance += 1;
      }
      
      return relevance;
    };

    // Ordenar por relevancia descendente, manteniendo el orden original para iguales
    return skillsArray.sort((a, b) => {
      const relevanceA = calculateRelevance(a);
      const relevanceB = calculateRelevance(b);
      
      if (relevanceB !== relevanceA) {
        return relevanceB - relevanceA; // Más relevante primero
      }
      
      // Si tienen la misma relevancia, mantener orden original
      return 0;
    });
  }

  /**
   * Adapta la experiencia laboral para destacar la más relevante
   */
  private static adaptWorkExperience(originalExperience: any[], jobContext: JobAdaptationContext): any[] {
    if (!originalExperience || originalExperience.length === 0) return [];

    const experienceArray = [...originalExperience];
    
    // Palabras clave para relevancia
    const jobKeywords = [
      ...(jobContext.jobTitle?.toLowerCase().split(' ') || []),
      ...(jobContext.industry?.toLowerCase().split(' ') || []),
      ...(jobContext.requirements?.toLowerCase().split(/[\s,]+/) || [])
    ].filter(keyword => keyword.length > 3);

    // Función para calcular relevancia de experiencia
    const calculateExperienceRelevance = (exp: any): number => {
      let relevance = 0;
      const position = exp.position?.toLowerCase() || '';
      const company = exp.company?.toLowerCase() || '';
      const description = exp.description?.toLowerCase() || '';
      const achievements = (exp.achievements || []).join(' ').toLowerCase();
      
      const allText = `${position} ${company} ${description} ${achievements}`;
      
      jobKeywords.forEach(keyword => {
        if (allText.includes(keyword)) {
          relevance += 1;
        }
      });
      
      // Boost para experiencia reciente
      if (exp.current) {
        relevance += 2;
      }
      
      return relevance;
    };

    // Ordenar por relevancia, manteniendo experiencia actual al principio
    return experienceArray.sort((a, b) => {
      // Los trabajos actuales siempre van primero
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      
      // Luego por relevancia
      const relevanceA = calculateExperienceRelevance(a);
      const relevanceB = calculateExperienceRelevance(b);
      
      if (relevanceB !== relevanceA) {
        return relevanceB - relevanceA;
      }
      
      // Finalmente por fecha (más reciente primero)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }

  /**
   * Adapta los proyectos para destacar los más relevantes
   */
  private static adaptProjects(originalProjects: any[], jobContext: JobAdaptationContext): any[] {
    if (!originalProjects || originalProjects.length === 0) return [];

    const projectsArray = [...originalProjects];
    
    // Similar lógica que para experiencia
    const jobKeywords = [
      ...(jobContext.jobTitle?.toLowerCase().split(' ') || []),
      ...(jobContext.requirements?.toLowerCase().split(/[\s,]+/) || []),
      ...(jobContext.skills || []).map(s => s.toLowerCase())
    ].filter(keyword => keyword.length > 3);

    const calculateProjectRelevance = (project: any): number => {
      let relevance = 0;
      const name = project.name?.toLowerCase() || '';
      const description = project.description?.toLowerCase() || '';
      const technologies = project.technologies?.toLowerCase() || '';
      const highlights = (project.highlights || []).join(' ').toLowerCase();
      
      const allText = `${name} ${description} ${technologies} ${highlights}`;
      
      jobKeywords.forEach(keyword => {
        if (allText.includes(keyword)) {
          relevance += 1;
        }
      });
      
      return relevance;
    };

    return projectsArray.sort((a, b) => {
      const relevanceA = calculateProjectRelevance(a);
      const relevanceB = calculateProjectRelevance(b);
      
      if (relevanceB !== relevanceA) {
        return relevanceB - relevanceA;
      }
      
      // Por fecha si tienen la misma relevancia
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }

  /**
   * Genera sugerencias de mejora específicas para el puesto
   */
  private static generateImprovementSuggestions(originalCV: CVData, jobContext: JobAdaptationContext): string[] {
    const suggestions: string[] = [];

    // Analizar summary
    if (!originalCV.personalInfo.summary || originalCV.personalInfo.summary.length < 100) {
      suggestions.push(`Considera expandir tu resumen profesional para destacar cómo tu experiencia se alinea con el puesto de ${jobContext.jobTitle}`);
    }

    // Analizar habilidades
    if (!originalCV.skills || originalCV.skills.length < 5) {
      suggestions.push('Agrega más habilidades técnicas y profesionales relevantes para el puesto');
    }

    // Analizar experiencia
    if (!originalCV.workExperience || originalCV.workExperience.length === 0) {
      suggestions.push('Incluye prácticas profesionales, trabajos de medio tiempo o proyectos significativos');
    }

    // Analizar logros cuantificables
    const hasQuantifiableAchievements = originalCV.workExperience?.some(exp => 
      exp.achievements?.some(achievement => 
        /\d+/.test(achievement) || /%/.test(achievement)
      )
    );

    if (!hasQuantifiableAchievements) {
      suggestions.push('Incluye logros cuantificables con números, porcentajes o métricas específicas');
    }

    return suggestions;
  }

  /**
   * Guarda un registro de la adaptación para tracking
   */
  private static async saveAdaptationRecord(
    user: User, 
    jobContext: JobAdaptationContext, 
    totalChanges: number
  ): Promise<string> {
    try {
      const adaptationRef = doc(db, 'cvAdaptations', `${user.uid}_${Date.now()}`);
      
      await setDoc(adaptationRef, {
        userId: user.uid,
        jobTitle: jobContext.jobTitle,
        company: jobContext.company,
        totalChanges,
        createdAt: serverTimestamp(),
        source: 'adaptation_tool'
      });

      return adaptationRef.id;
    } catch (error) {
      console.error('Error guardando registro de adaptación:', error);
      return 'adaptation_' + Date.now();
    }
  }

  /**
   * Guarda el CV adaptado temporalmente para pre-llenar el builder
   */
  static async saveTemporaryAdaptedCV(
    user: User,
    adaptedCV: CVData,
    jobContext: JobAdaptationContext
  ): Promise<string> {
    try {
      const tempCVTitle = `CV adaptado para ${jobContext.jobTitle} - ${jobContext.company}`;
      
      // Guardar como CV temporal usando el servicio existente
      const tempCVId = await cvBuilderService.saveCV(
        user,
        adaptedCV,
        tempCVTitle,
        'harvard'
      );

      console.log('✅ CV adaptado guardado temporalmente con ID:', tempCVId);
      return tempCVId;
      
    } catch (error) {
      console.error('❌ Error guardando CV adaptado temporal:', error);
      throw new Error('Error al guardar el CV adaptado');
    }
  }

  /**
   * Extrae datos de CV subido desde el onboarding
   */
  private static async extractCVDataFromUploadedCV(user: User, unifiedCV: any): Promise<CVData | null> {
    try {
      console.log('🔄 Extrayendo datos de CV subido para:', user.uid);
      console.log('🔍 CV unificado recibido:', unifiedCV);
      
      const { query, where, getDocs, collection, orderBy, doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/firebase/config');
      
      let cvUrl: string | null = null;

      // 1. PRIORIDAD: Usar la URL del CV unificado si está disponible
      if (unifiedCV?.fileUrl) {
        cvUrl = unifiedCV.fileUrl;
        console.log('✅ URL obtenida del CV unificado:', cvUrl);
      }
      
      // 2. FALLBACK: Buscar en el documento del usuario
      if (!cvUrl) {
        console.log('🔍 Buscando URL en documento del usuario...');
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          cvUrl = userData.cvFileUrl || userData.onboarding?.cvFileUrl;
          if (cvUrl) {
            console.log('✅ URL obtenida del documento usuario:', cvUrl);
          }
        }
      }
      
      // 3. FALLBACK: Buscar en onboarding_data
      if (!cvUrl) {
        console.log('🔍 Buscando URL en onboarding_data...');
        const onboardingQuery = query(
          collection(db, 'onboarding_data'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const onboardingSnapshot = await getDocs(onboardingQuery);
        
        if (!onboardingSnapshot.empty) {
          const onboardingData = onboardingSnapshot.docs[0].data();
          cvUrl = onboardingData.cvFileUrl;
          if (cvUrl) {
            console.log('✅ URL obtenida de onboarding_data:', cvUrl);
          }
        }
      }

      // 4. Si no encontramos URL, no podemos continuar
      if (!cvUrl) {
        console.warn('❌ No se encontró URL del CV en ninguna fuente');
        return this.createBasicCVStructure();
      }

      console.log('📄 Extrayendo datos del CV usando IA desde URL:', cvUrl.substring(0, 50) + '...');
      
      // 5. EXTRAER DATOS DEL PDF usando la IA
      const analysisResult = await this.extractCVDataFromPDF(cvUrl, user.uid);
      
      if (analysisResult) {
        console.log('✅ CV analizado exitosamente con IA, datos extraídos');
        return analysisResult;
      }

      // 6. Último fallback: buscar datos básicos en onboarding (solo información básica)
      console.log('⚠️ Análisis con IA falló, usando datos básicos de onboarding como último recurso...');
      const onboardingQuery = query(
        collection(db, 'onboarding_data'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const onboardingSnapshot = await getDocs(onboardingQuery);
      
      if (!onboardingSnapshot.empty) {
        const onboardingData = onboardingSnapshot.docs[0].data();
        return this.convertOnboardingDataToCVData(onboardingData);
      }

      console.warn('⚠️ No se encontraron datos de onboarding, usando estructura básica');
      return this.createBasicCVStructure();
      
    } catch (error) {
      console.error('❌ Error extrayendo datos de CV subido:', error);
      if (error instanceof Error) {
        console.error('❌ Stack trace:', error.stack);
      }
      return this.createBasicCVStructure();
    }
  }

  /**
   * Extrae datos de CV analizado desde cvReviews
   */
  private static async extractCVDataFromAnalyzedCV(user: User, unifiedCV: any): Promise<CVData | null> {
    try {
      // Buscar el análisis más reciente del CV
      const { query, where, getDocs, collection, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/firebase/config');
      
      const reviewsQuery = query(
        collection(db, 'cvReviews'),
        where('userId', '==', user.uid),
        where('status', '==', 'completed'),
        orderBy('createdAt', 'desc')
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      if (reviewsSnapshot.empty) {
        console.warn('No se encontraron análisis de CV');
        return this.createBasicCVStructure();
      }

      const analysisData = reviewsSnapshot.docs[0].data();
      
      // Si el análisis tiene datos estructurados, usarlos
      if (analysisData.extractedData) {
        return this.convertAnalysisDataToCVData(analysisData.extractedData);
      }
      
      return this.createBasicCVStructure();
      
    } catch (error) {
      console.error('Error extrayendo datos de CV analizado:', error);
      return this.createBasicCVStructure();
    }
  }

  /**
   * Convierte datos del onboarding a formato CVData
   */
  private static convertOnboardingDataToCVData(onboardingData: any): CVData {
    const cvData: CVData = this.createBasicCVStructure();

    // Información personal
    if (onboardingData.personalInfo) {
      cvData.personalInfo = {
        fullName: onboardingData.personalInfo.fullName || onboardingData.fullName || '',
        email: onboardingData.personalInfo.email || onboardingData.email || '',
        phone: onboardingData.personalInfo.phone || onboardingData.phone || '',
        address: onboardingData.personalInfo.address || onboardingData.location || '',
        linkedIn: onboardingData.personalInfo.linkedIn || onboardingData.linkedin || '',
        summary: onboardingData.personalInfo.summary || onboardingData.bio || ''
      };
    }

    // Educación
    if (onboardingData.education && Array.isArray(onboardingData.education)) {
      cvData.education = onboardingData.education.map((edu: any) => ({
        id: `edu_${Date.now()}_${Math.random()}`,
        institution: edu.institution || edu.school || '',
        degree: edu.degree || edu.title || '',
        fieldOfStudy: edu.fieldOfStudy || edu.field || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        current: edu.current || false,
        achievements: edu.achievements || []
      }));
    }

    // Experiencia laboral
    if (onboardingData.experience && Array.isArray(onboardingData.experience)) {
      cvData.workExperience = onboardingData.experience.map((exp: any) => ({
        id: `exp_${Date.now()}_${Math.random()}`,
        company: exp.company || '',
        position: exp.position || exp.title || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false,
        description: exp.description || '',
        achievements: exp.achievements || [],
        technologies: exp.technologies || []
      }));
    }

    // Habilidades
    if (onboardingData.skills && Array.isArray(onboardingData.skills)) {
      cvData.skills = onboardingData.skills.map((skill: any) => {
        if (typeof skill === 'string') {
          return {
            id: `skill_${Date.now()}_${Math.random()}`,
            name: skill,
            level: 'Intermedio',
            category: 'Technical'
          };
        }
        return {
          id: `skill_${Date.now()}_${Math.random()}`,
          name: skill.name || skill,
          level: skill.level || 'Intermedio',
          category: skill.category || 'Technical'
        };
      });
    }

    // Proyectos
    if (onboardingData.projects && Array.isArray(onboardingData.projects)) {
      cvData.projects = onboardingData.projects.map((project: any) => ({
        id: `proj_${Date.now()}_${Math.random()}`,
        name: project.name || project.title || '',
        description: project.description || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        current: project.current || false,
        url: project.url || '',
        highlights: project.highlights || [],
        technologies: project.technologies || ''
      }));
    }

    return cvData;
  }

  /**
   * Convierte datos de análisis a formato CVData
   */
  private static convertAnalysisDataToCVData(analysisData: any): CVData {
    const cvData: CVData = this.createBasicCVStructure();

    // Similar conversión pero desde los datos del análisis
    if (analysisData.personal_info) {
      cvData.personalInfo = {
        fullName: analysisData.personal_info.name || '',
        email: analysisData.personal_info.email || '',
        phone: analysisData.personal_info.phone || '',
        address: analysisData.personal_info.address || '',
        linkedIn: analysisData.personal_info.linkedin || '',
        summary: analysisData.professional_summary || analysisData.summary || ''
      };
    }

    // Mapear experience, education, skills, etc. desde el análisis
    if (analysisData.work_experience) {
      cvData.workExperience = analysisData.work_experience.map((exp: any) => ({
        id: `exp_${Date.now()}_${Math.random()}`,
        company: exp.company || '',
        position: exp.position || exp.title || '',
        startDate: exp.start_date || '',
        endDate: exp.end_date || '',
        current: exp.current || false,
        description: exp.description || '',
        achievements: exp.achievements || [],
        technologies: exp.technologies || []
      }));
    }

    if (analysisData.skills) {
      cvData.skills = analysisData.skills.map((skill: any) => ({
        id: `skill_${Date.now()}_${Math.random()}`,
        name: typeof skill === 'string' ? skill : skill.name,
        level: 'Intermedio',
        category: 'Technical'
      }));
    }

    return cvData;
  }

  /**
   * Crea estructura básica de CVData
   */
  private static createBasicCVStructure(): CVData {
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedIn: '',
        summary: ''
      },
      education: [],
      workExperience: [],
      skills: [],
      hobbies: [],
      languages: [],
      volunteer: [],
      projects: [],
      certifications: []
    };
  }

  /**
   * Extrae datos del CV desde PDF usando el API exclusivo para adaptación
   */
  private static async extractCVDataFromPDF(cvUrl: string, userId?: string): Promise<CVData | null> {
    try {
      console.log('🔄 [Adaptación] Extrayendo datos del PDF:', cvUrl);
      
      // Llamar al API exclusivo para adaptación de CV
      const response = await fetch('/api/cv/extract-for-adaptation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvFileUrl: cvUrl,
          fileName: 'cv_for_adaptation.pdf',
          userId: userId || 'unknown'
        }),
      });

      if (!response.ok) {
        console.error('❌ [Adaptación] Error en API de extracción:', response.statusText);
        return null;
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        console.error('❌ [Adaptación] Datos no extraídos exitosamente');
        return null;
      }

      console.log('✅ [Adaptación] Datos extraídos del PDF:', {
        fieldsExtracted: result.metadata?.fieldsExtracted || [],
        totalFields: result.metadata?.totalFields || 0
      });
      
      // Los datos ya vienen en formato CVDataForAdaptation, convertir a CVData
      return this.convertAdaptationDataToCVData(result.data);
      
    } catch (error) {
      console.error('❌ [Adaptación] Error extrayendo datos del PDF:', error);
      return null;
    }
  }

  /**
   * Convierte datos de la API de adaptación (CVDataForAdaptation) a formato CVData
   */
  private static convertAdaptationDataToCVData(adaptationData: any): CVData {
    const cvData: CVData = this.createBasicCVStructure();

    // Información personal
    if (adaptationData.personalInfo) {
      cvData.personalInfo = {
        fullName: adaptationData.personalInfo.fullName || '',
        email: adaptationData.personalInfo.email || '',
        phone: adaptationData.personalInfo.phone || '',
        address: adaptationData.personalInfo.address || '',
        linkedIn: adaptationData.personalInfo.linkedIn || '',
        website: '',
        summary: adaptationData.personalInfo.summary || ''
      };
    }

    // Experiencia laboral
    if (adaptationData.workExperience && Array.isArray(adaptationData.workExperience)) {
      cvData.workExperience = adaptationData.workExperience.map((exp: any) => ({
        id: exp.id || `exp_${Date.now()}_${Math.random()}`,
        company: exp.company || '',
        position: exp.position || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false,
        description: exp.description || '',
        achievements: exp.achievements || [],
        sections: []
      }));
    }

    // Educación
    if (adaptationData.education && Array.isArray(adaptationData.education)) {
      cvData.education = adaptationData.education.map((edu: any) => ({
        id: edu.id || `edu_${Date.now()}_${Math.random()}`,
        institution: edu.institution || '',
        degree: edu.degree || '',
        fieldOfStudy: '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        current: edu.current || false,
        gpa: edu.gpa || '',
        honors: '',
        relevantCourses: [],
        achievements: edu.achievements || [],
        location: ''
      }));
    }

    // Habilidades
    if (adaptationData.skills && Array.isArray(adaptationData.skills)) {
      cvData.skills = adaptationData.skills.map((skill: any) => ({
        id: skill.id || `skill_${Date.now()}_${Math.random()}`,
        name: skill.name || '',
        level: (skill.level || 'Intermedio') as 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto',
        category: (skill.category || 'Technical') as 'Technical' | 'Soft' | 'Language' | 'Other'
      }));
    }

    // Proyectos
    if (adaptationData.projects && Array.isArray(adaptationData.projects)) {
      cvData.projects = adaptationData.projects.map((proj: any) => ({
        id: proj.id || `proj_${Date.now()}_${Math.random()}`,
        name: proj.name || '',
        description: proj.description || '',
        startDate: proj.startDate || '',
        endDate: proj.endDate || '',
        current: false,
        technologies: proj.technologies || [],
        achievements: proj.achievements || [],
        link: '',
        repository: ''
      }));
    }

    // Certificaciones - mapear a certifications
    if (adaptationData.certifications && Array.isArray(adaptationData.certifications)) {
      cvData.certifications = adaptationData.certifications.map((cert: any) => ({
        id: cert.id || `cert_${Date.now()}_${Math.random()}`,
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        expirationDate: cert.expirationDate || '',
        credentialId: '',
        credentialUrl: ''
      }));
    }

    // Idiomas
    if (adaptationData.languages && Array.isArray(adaptationData.languages)) {
      cvData.languages = adaptationData.languages.map((lang: any) => ({
        id: lang.id || `lang_${Date.now()}_${Math.random()}`,
        language: lang.language || '',
        proficiency: lang.proficiency || 'Intermedio'
      }));
    }

    console.log('✅ [Adaptación] Datos convertidos exitosamente a formato CVData');
    return cvData;
  }

  /**
   * Convierte datos extraídos del API a formato CVData
   */
  private static convertExtractedDataToCVData(extractedData: any): CVData {
    const cvData: CVData = this.createBasicCVStructure();

    // Información personal
    if (extractedData.personalInfo) {
      cvData.personalInfo = {
        fullName: extractedData.personalInfo.fullName || '',
        email: extractedData.personalInfo.email || '',
        phone: extractedData.personalInfo.phone || '',
        address: extractedData.personalInfo.location || '',
        linkedIn: extractedData.personalInfo.linkedin || '',
        website: extractedData.personalInfo.portfolio || '',
        summary: extractedData.professional?.bio || ''
      };
    }

    // Experiencia laboral
    if (extractedData.experience && Array.isArray(extractedData.experience)) {
      cvData.workExperience = extractedData.experience.map((exp: any) => ({
        id: `exp_${Date.now()}_${Math.random()}`,
        company: exp.company || '',
        position: exp.position || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.isCurrent || false,
        description: exp.description || '',
        achievements: exp.achievements || [],
        sections: []
      }));
    }

    // Educación
    if (extractedData.education && Array.isArray(extractedData.education)) {
      cvData.education = extractedData.education.map((edu: any) => ({
        id: `edu_${Date.now()}_${Math.random()}`,
        institution: edu.institution || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        current: edu.isCurrent || false,
        gpa: '',
        honors: '',
        relevantCourses: [],
        achievements: [],
        location: ''
      }));
    }

    // Habilidades
    if (extractedData.professional?.skills && Array.isArray(extractedData.professional.skills)) {
      cvData.skills = extractedData.professional.skills.map((skill: string) => ({
        id: `skill_${Date.now()}_${Math.random()}`,
        name: skill,
        level: 'Intermedio' as const,
        category: 'Technical' as const
      }));
    }

    // Proyectos
    if (extractedData.projects && Array.isArray(extractedData.projects)) {
      cvData.projects = extractedData.projects.map((project: any) => ({
        id: `proj_${Date.now()}_${Math.random()}`,
        name: project.name || '',
        description: project.description || '',
        startDate: '',
        endDate: '',
        current: false,
        url: project.url || '',
        highlights: [],
        technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : ''
      }));
    }

    // Idiomas
    if (extractedData.languages && Array.isArray(extractedData.languages)) {
      cvData.languages = extractedData.languages.map((lang: any) => ({
        id: `lang_${Date.now()}_${Math.random()}`,
        language: lang.language || '',
        level: lang.level || 'Intermedio'
      }));
    }

    return cvData;
  }
}
