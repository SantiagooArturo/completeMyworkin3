import { CVData, PersonalInfo, WorkExperience, Education, Skill } from '@/types/cv';

interface AIEnhancementSuggestions {
  summary?: string;
  achievements?: string[];
  skills?: {
    suggested: string[];
    improvements: { [key: string]: string };
  };
  descriptions?: {
    [key: string]: string;
  };
}

export class CVAIEnhancementService {
  // Método auxiliar para hacer llamadas a la API de IA
  private async callAIAPI(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error en la API de IA: ${response.statusText}`);
    }

    return response.json();
  }

  // Método auxiliar para hacer llamadas a la API de CV
  private async callCVAPI(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`/api/cv/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error en la API de CV: ${response.statusText}`);
    }

    return response.json();
  }

  // Mejorar el resumen profesional con IA real
  async enhanceSummary(currentSummary: string, role: string, experience?: WorkExperience[], education?: Education[]): Promise<string> {
    const context = {
      summary: currentSummary,
      position: role,
      experienceCount: experience?.length || 0,
      hasEducation: education && education.length > 0,
      industries: experience?.map(exp => exp.company).slice(0, 3) || [],
      educationLevel: education?.[0]?.degree || ''
    };

    try {
      const response = await this.callAIAPI('enhance-summary', context);
      return response.enhanced_summary || response.summary || currentSummary;
    } catch (error) {
      console.warn('Fallback to local summary enhancement:', error);
      return this.generateEnhancedSummaryLocal(currentSummary, role, context);
    }
  }

  // Método local de fallback para resumen
  private generateEnhancedSummaryLocal(current: string, role: string, context: any): string {
    if (!current || current.length < 10) {
      const yearsExp = context.experienceCount > 0 ? `${context.experienceCount} años de` : 'sólida';
      return `Profesional ${role.toLowerCase()} con ${yearsExp} experiencia en el desarrollo de soluciones innovadoras. Comprometido/a con la excelencia operacional y el crecimiento continuo, con capacidad demostrada para trabajar en equipos multidisciplinarios y adaptarse a entornos dinámicos.`;
    }

    // Mejorar el resumen existente
    const improvements = [
      'Orientado/a a resultados y con fuerte capacidad analítica',
      'Experiencia en metodologías ágiles y mejores prácticas de la industria',
      'Habilidades sólidas de comunicación y liderazgo',
      'Pasión por la innovación y la mejora continua'
    ];

    return `${current} ${improvements[Math.floor(Math.random() * improvements.length)]}.`;
  }

  // Detectar industria basado en el nombre de la empresa
  private detectIndustry(company: string): string {
    const industryKeywords = {
      'tecnología': ['tech', 'software', 'digital', 'sistemas', 'development', 'innovation'],
      'salud': ['hospital', 'clinic', 'medical', 'health', 'pharma', 'medicina'],
      'educación': ['university', 'school', 'education', 'académic', 'instituto', 'colegio'],
      'finanzas': ['bank', 'financial', 'investment', 'finance', 'credit', 'banco'],
      'retail': ['store', 'market', 'shop', 'retail', 'commerce', 'tienda'],
      'manufactura': ['manufacturing', 'factory', 'production', 'industrial', 'fabrica']
    };

    const companyLower = company.toLowerCase();
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => companyLower.includes(keyword))) {
        return industry;
      }
    }
    return 'general';
  }

  // Sugerir logros cuantificables con IA real
  async suggestAchievements(description: string, role: string, company?: string): Promise<string[]> {
    try {
      const response = await this.callAIAPI('enhance-achievements', { 
        description, 
        position: role,
        company,
        industry: this.detectIndustry(company || '') 
      });
      return response.achievements || response.suggestions || [];
    } catch (error) {
      console.warn('Fallback to local achievements generation:', error);
      return this.generateAchievementsLocal(description, role);
    }
  }

  // Método local para generar logros
  private generateAchievementsLocal(description: string, role: string): string[] {
    const genericAchievements = [
      'Contribución significativa al cumplimiento de objetivos del equipo',
      'Implementación de mejoras en procesos operativos',
      'Colaboración efectiva con equipos multidisciplinarios',
      'Desarrollo de habilidades técnicas y profesionales continuamente',
      'Participación activa en proyectos de innovación'
    ];

    const roleSpecificAchievements: { [key: string]: string[] } = {
      'desarrollador': [
        'Desarrollo de aplicaciones que mejoraron la experiencia del usuario en un 25%',
        'Implementación de código optimizado reduciendo tiempos de carga',
        'Participación en el desarrollo de 5+ proyectos exitosos'
      ],
      'diseñador': [
        'Creación de interfaces que incrementaron la satisfacción del usuario',
        'Desarrollo de identidad visual coherente para múltiples proyectos',
        'Optimización de flujos de usuario mejorando la conversión'
      ],
      'marketing': [
        'Incremento del engagement en redes sociales en un 30%',
        'Desarrollo de campañas que generaron leads calificados',
        'Análisis de métricas que optimizaron el ROI de campañas'
      ]
    };

    const roleLower = role.toLowerCase();
    const matchedRole = Object.keys(roleSpecificAchievements).find(key => 
      roleLower.includes(key)
    );

    return matchedRole ? roleSpecificAchievements[matchedRole] : genericAchievements.slice(0, 3);
  }

  // Mejorar descripciones de trabajo con IA real  
  async enhanceJobDescriptions(description: string, role: string, company?: string): Promise<string> {
    try {
      const response = await this.callCVAPI('enhance-description', { 
        description, 
        position: role,
        company,
        industry: this.detectIndustry(company || '')
      });
      return response.enhanced_description || response.description || description;
    } catch (error) {
      console.warn('Fallback to local description enhancement:', error);
      return this.enhanceDescriptionLocal(description, role);
    }
  }

  // Método local para mejorar descripciones
  private enhanceDescriptionLocal(description: string, role: string): string {
    if (!description || description.length < 10) {
      return `Responsable de liderar iniciativas clave en ${role.toLowerCase()}, colaborando estrechamente con equipos multifuncionales para entregar resultados de alta calidad y cumplir objetivos estratégicos de la organización.`;
    }

    // Verbos de acción fuertes
    const actionVerbs = [
      'Lideré', 'Desarrollé', 'Implementé', 'Optimicé', 'Coordiné', 
      'Diseñé', 'Ejecuté', 'Supervisé', 'Analicé', 'Creé'
    ];

    // Mejorar el texto existente
    let enhanced = description;
    
    // Añadir verbos de acción si no los tiene
    if (!actionVerbs.some(verb => enhanced.includes(verb))) {
      const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
      enhanced = `${randomVerb} ${enhanced.toLowerCase()}`;
    }

    // Añadir contexto de impacto si no lo tiene
    if (!enhanced.includes('%') && !enhanced.includes('mejora') && !enhanced.includes('incremento')) {
      enhanced += ', contribuyendo significativamente al crecimiento y eficiencia del equipo.';
    }

    return enhanced;
  }

  // Sugerir habilidades técnicas basadas en el rol
  async suggestTechnicalSkills(currentSkills: string[], role: string): Promise<string[]> {
    const skillsByRole: { [key: string]: string[] } = {
      'desarrollador': ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL', 'HTML/CSS', 'TypeScript'],
      'diseñador': ['Adobe Photoshop', 'Figma', 'Adobe Illustrator', 'UX/UI Design', 'Sketch', 'InVision'],
      'marketing': ['Google Analytics', 'SEO', 'Social Media', 'Content Marketing', 'AdWords', 'Email Marketing'],
      'analista': ['Excel', 'SQL', 'Python', 'Power BI', 'Tableau', 'R', 'Data Analysis'],
      'gerente': ['Liderazgo', 'Gestión de Proyectos', 'Scrum', 'Agile', 'Strategic Planning', 'Team Management'],
      'ingeniero': ['AutoCAD', 'MATLAB', 'Project Management', 'Quality Control', 'Problem Solving']
    };

    const roleLower = role.toLowerCase();
    const matchedRole = Object.keys(skillsByRole).find(key => 
      roleLower.includes(key) || key.includes(roleLower.split(' ')[0])
    );

    if (matchedRole) {
      const suggestedSkills = skillsByRole[matchedRole];
      // Filtrar habilidades que ya tiene el usuario
      return suggestedSkills.filter(skill => 
        !currentSkills.some(current => 
          current.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(current.toLowerCase())
        )
      ).slice(0, 5);
    }

    // Habilidades genéricas
    return ['Comunicación', 'Trabajo en Equipo', 'Resolución de Problemas', 'Adaptabilidad', 'Creatividad']
      .filter(skill => !currentSkills.includes(skill))
      .slice(0, 3);
  }

  // Mejorar logros académicos con IA
  async enhanceEducationAchievements(institution: string, degree: string, fieldOfStudy?: string): Promise<string[]> {
    const context = {
      institution,
      degree,
      field_of_study: fieldOfStudy || '',
      level: degree.toLowerCase().includes('maestr') ? 'maestria' : 
             degree.toLowerCase().includes('doctor') ? 'doctorado' : 'licenciatura'
    };

    try {
      const response = await this.callAIAPI('enhance-achievements', {
        ...context,
        type: 'education'
      });
      return response.achievements || response.academic_achievements || [];
    } catch (error) {
      console.warn('Fallback to local education achievements:', error);
      return this.generateEducationAchievementsLocal(degree, fieldOfStudy);
    }
  }

  // Sugerir cursos relevantes basados en la carrera
  async suggestRelevantCourses(degree: string, fieldOfStudy?: string, targetRole?: string): Promise<string[]> {
    const coursesByField: { [key: string]: string[] } = {
      'sistemas': ['Algoritmos y Estructuras de Datos', 'Base de Datos', 'Programación Orientada a Objetos', 'Redes y Comunicaciones', 'Ingeniería de Software'],
      'administración': ['Gestión Estratégica', 'Marketing Digital', 'Finanzas Corporativas', 'Liderazgo y Equipos', 'Análisis de Datos'],
      'marketing': ['Comportamiento del Consumidor', 'Marketing Digital', 'Investigación de Mercados', 'Branding', 'Analytics'],
      'contabilidad': ['Contabilidad Financiera', 'Auditoría', 'Costos y Presupuestos', 'Tributación', 'NIIF'],
      'psicología': ['Psicología Organizacional', 'Recursos Humanos', 'Psicometría', 'Coaching', 'Desarrollo Organizacional']
    };

    const field = fieldOfStudy?.toLowerCase() || degree.toLowerCase();
    const matchedKey = Object.keys(coursesByField).find(key => field.includes(key));
    
    return matchedKey ? coursesByField[matchedKey].slice(0, 4) : [
      'Metodología de la Investigación',
      'Ética Profesional',
      'Comunicación Efectiva',
      'Trabajo en Equipo'
    ];
  }

  // Mejorar descripción de proyectos con IA
  async enhanceProjectDescription(projectName: string, currentDescription: string, technologies?: string[]): Promise<string> {
    try {
      const response = await this.callAIAPI('enhance-summary', {
        summary: currentDescription,
        context: 'project',
        project_name: projectName,
        technologies: technologies || []
      });
      return response.enhanced_summary || response.description || currentDescription;
    } catch (error) {
      console.warn('Fallback to local project enhancement:', error);
      return this.enhanceProjectDescriptionLocal(projectName, currentDescription, technologies);
    }
  }

  // Sugerir tecnologías para proyectos
  async suggestProjectTechnologies(projectName: string, description: string, role?: string): Promise<string[]> {
    const techByType: { [key: string]: string[] } = {
      'web': ['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'MongoDB', 'Express'],
      'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
      'data': ['Python', 'SQL', 'Pandas', 'Matplotlib', 'Jupyter', 'Excel'],
      'desktop': ['Java', 'C#', '.NET', 'WPF', 'JavaFX'],
      'ai': ['Python', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'Jupyter']
    };

    const projectLower = (projectName + ' ' + description).toLowerCase();
    
    for (const [type, techs] of Object.entries(techByType)) {
      if (projectLower.includes(type) || 
          (type === 'web' && (projectLower.includes('página') || projectLower.includes('sitio'))) ||
          (type === 'mobile' && (projectLower.includes('app') || projectLower.includes('móvil'))) ||
          (type === 'data' && (projectLower.includes('datos') || projectLower.includes('análisis')))) {
        return techs.slice(0, 4);
      }
    }

    return ['Git', 'GitHub', 'VS Code', 'Metodologías Ágiles'];
  }

  // Mejorar información personal
  async enhancePersonalInfo(personalInfo: PersonalInfo, role: string): Promise<Partial<PersonalInfo>> {
    if (!personalInfo.summary || personalInfo.summary.length < 20) {
      const enhancedSummary = await this.enhanceSummary(
        personalInfo.summary || '', 
        role
      );
      
      return {
        ...personalInfo,
        summary: enhancedSummary
      };
    }
    
    return personalInfo;
  }

  // Mejorar habilidades con IA real
  async enhanceSkills(skills: string[], role: string): Promise<{
    suggested: string[];
    improvements: { [key: string]: string };
  }> {
    try {
      const response = await this.callCVAPI('suggest-skills', { 
        current_skills: skills, 
        position: role 
      });
      
      const suggested = response.suggested_skills || response.suggestions || [];
      const improvements = response.improvements || {};
      
      return { suggested, improvements };
    } catch (error) {
      console.warn('Fallback to local skills enhancement:', error);
      const suggested = await this.suggestTechnicalSkills(skills, role);
      
      const improvements: { [key: string]: string } = {};
      skills.forEach(skill => {
        if (skill.length < 3) {
          improvements[skill] = `Especifica mejor tu nivel en ${skill}`;
        }
      });

      return { suggested, improvements };
    }
  }

  // Análisis completo del CV (método mejorado)
  async analyzeFullCV(cvData: CVData): Promise<AIEnhancementSuggestions> {
    const role = cvData.workExperience.length > 0 ? cvData.workExperience[0].position : 'profesional';
    
    try {
      // Realizar análisis en paralelo para mejorar el rendimiento
      const [summary, skillsAnalysis, suggestedSkills] = await Promise.all([
        this.enhanceSummary(
          cvData.personalInfo.summary || '', 
          role, 
          cvData.workExperience, 
          cvData.education
        ),
        this.enhanceSkills(
          cvData.skills.map(skill => skill.name),
          role
        ),
        this.suggestTechnicalSkills(
          cvData.skills.map(skill => skill.name),
          role
        )
      ]);
      
      // Analizar la primera experiencia laboral para sugerir logros
      let achievements: string[] = [];
      if (cvData.workExperience.length > 0) {
        const firstJob = cvData.workExperience[0];
        achievements = await this.suggestAchievements(
          firstJob.description || '', 
          firstJob.position || '',
          firstJob.company
        );
      }
      
      return {
        summary,
        achievements,
        skills: {
          ...skillsAnalysis,
          suggested: [...skillsAnalysis.suggested, ...suggestedSkills]
        },
        descriptions: {}
      };
    } catch (error) {
      console.error('Error in full CV analysis:', error);
      
      // Fallback con análisis local
      return {
        summary: this.generateEnhancedSummaryLocal(
          cvData.personalInfo.summary || '', 
          role, 
          { experienceCount: cvData.workExperience.length }
        ),
        achievements: this.generateAchievementsLocal('', role),
        skills: {
          suggested: await this.suggestTechnicalSkills(
            cvData.skills.map(s => s.name), 
            role
          ),
          improvements: {}
        }
      };
    }
  }

  // Método local para generar logros académicos
  private generateEducationAchievementsLocal(degree: string, fieldOfStudy?: string): string[] {
    const academicAchievements = [
      'Participación activa en proyectos de investigación académica',
      'Colaboración en trabajos grupales multidisciplinarios',
      'Presentación de proyectos ante paneles académicos',
      'Desarrollo de habilidades analíticas y de resolución de problemas',
      'Aplicación práctica de conocimientos teóricos en proyectos reales'
    ];

    if (degree.toLowerCase().includes('ing')) {
      return [
        'Desarrollo de proyectos de ingeniería con aplicación práctica',
        'Participación en competencias tecnológicas universitarias',
        'Implementación de soluciones innovadoras en proyectos académicos'
      ];
    }

    if (fieldOfStudy?.toLowerCase().includes('administr')) {
      return [
        'Liderazgo en proyectos de gestión empresarial',
        'Análisis de casos de estudio empresariales reales',
        'Desarrollo de planes estratégicos académicos'
      ];
    }

    return academicAchievements.slice(0, 3);
  }

  // Método local para mejorar descripciones de proyectos
  private enhanceProjectDescriptionLocal(projectName: string, currentDescription: string, technologies?: string[]): string {
    if (!currentDescription || currentDescription.length < 10) {
      const techString = technologies && technologies.length > 0 ? 
        ` utilizando ${technologies.slice(0, 3).join(', ')}` : '';
      
      return `Proyecto integral de desarrollo que demuestra aplicación práctica de conocimientos técnicos${techString}. Implementación de soluciones innovadoras con enfoque en funcionalidad y experiencia de usuario.`;
    }

    // Mejorar descripción existente
    let enhanced = currentDescription;
    
    // Añadir impacto si no lo tiene
    if (!enhanced.includes('mejora') && !enhanced.includes('optimiza') && !enhanced.includes('incrementa')) {
      enhanced += ' Este proyecto contribuye significativamente al desarrollo de competencias técnicas y profesionales.';
    }

    // Añadir tecnologías si las hay y no están mencionadas
    if (technologies && technologies.length > 0) {
      const techMentioned = technologies.some(tech => 
        enhanced.toLowerCase().includes(tech.toLowerCase())
      );
      
      if (!techMentioned) {
        enhanced += ` Desarrollado con ${technologies.slice(0, 2).join(' y ')}.`;
      }
    }

    return enhanced;
  }
}

// ✅ Exportar instancia singleton para facilitar uso
export const cvAIEnhancementService = new CVAIEnhancementService();
