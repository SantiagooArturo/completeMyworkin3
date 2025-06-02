import { CVData, CVDataHarvard, Skill, SkillCategory } from '@/types/cv';

/**
 * Clase para convertir entre formatos CVData tradicional y CVDataHarvard
 */
export class CVDataConverter {
  /**
   * Convierte CVData tradicional a CVDataHarvard
   */
  static toHarvardFormat(cvData: CVData): CVDataHarvard {
    // Convertir skills individuales a skillCategories
    const skillCategories = this.skillsToCategories(cvData.skills);
    
    return {
      personalInfo: cvData.personalInfo,
      education: cvData.education,
      workExperience: cvData.workExperience,
      skillCategories: skillCategories,
      certifications: cvData.certifications,
      languages: cvData.languages || [],
      projects: cvData.projects,
      hobbies: cvData.hobbies || [],
      references: cvData.references
    };
  }

  /**
   * Convierte CVDataHarvard a CVData tradicional
   */
  static fromHarvardFormat(cvDataHarvard: CVDataHarvard): CVData {
    // Convertir skillCategories a skills individuales
    const skills = this.categoriesToSkills(cvDataHarvard.skillCategories);
    
    return {
      personalInfo: cvDataHarvard.personalInfo,
      education: cvDataHarvard.education,
      workExperience: cvDataHarvard.workExperience,
      skills: skills,
      projects: cvDataHarvard.projects || [],
      certifications: cvDataHarvard.certifications,
      languages: cvDataHarvard.languages,
      references: cvDataHarvard.references,
      hobbies: cvDataHarvard.hobbies
    };
  }

  /**
   * Convierte skills individuales a categorías de habilidades
   */
  private static skillsToCategories(skills: Skill[]): SkillCategory[] {
    const categoriesMap = new Map<string, SkillCategory>();

    skills.forEach(skill => {
      const categoryName = this.mapSkillCategoryToHarvard(skill.category);
      
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          id: Date.now().toString() + Math.random(),
          category: categoryName,
          skills: []
        });
      }

      const category = categoriesMap.get(categoryName)!;
      category.skills.push({
        name: skill.name,
        level: skill.level ? `(${skill.level})` : ''
      });
    });

    return Array.from(categoriesMap.values());
  }

  /**
   * Convierte categorías de habilidades a skills individuales
   */
  private static categoriesToSkills(skillCategories: SkillCategory[]): Skill[] {
    const skills: Skill[] = [];

    skillCategories.forEach(category => {
      category.skills.forEach(categorySkill => {
        const skill: Skill = {
          id: Date.now().toString() + Math.random(),
          name: categorySkill.name,
          level: this.extractLevelFromString(categorySkill.level),
          category: this.mapHarvardCategoryToSkill(category.category)
        };
        skills.push(skill);
      });
    });

    return skills;
  }

  /**
   * Mapea categorías de skill tradicional a formato Harvard
   */
  private static mapSkillCategoryToHarvard(category: string): string {
    const mapping: Record<string, string> = {
      'Technical': 'Software',
      'Analytical': 'Análisis de datos',
      'Leadership': 'Gestión de proyectos',
      'Communication': 'Comunicación',
      'Research': 'Investigación'
    };

    return mapping[category] || 'Software';
  }

  /**
   * Mapea categorías Harvard a categorías tradicionales
   */
  private static mapHarvardCategoryToSkill(category: string): 'Technical' | 'Analytical' | 'Leadership' | 'Communication' | 'Research' {
    const mapping: Record<string, 'Technical' | 'Analytical' | 'Leadership' | 'Communication' | 'Research'> = {
      'Software': 'Technical',
      'Programación': 'Technical',
      'Análisis de datos': 'Analytical',
      'Gestión de proyectos': 'Leadership',
      'Comunicación': 'Communication',
      'Investigación': 'Research',
      'Certificaciones': 'Technical'
    };

    return mapping[category] || 'Technical';
  }

  /**
   * Extrae el nivel de competencia de una cadena como "(Avanzado)"
   */
  private static extractLevelFromString(levelString?: string): 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto' {
    if (!levelString) return 'Intermedio';
    
    const cleaned = levelString.replace(/[()]/g, '').toLowerCase();
    
    if (cleaned.includes('básico') || cleaned.includes('principiante')) return 'Básico';
    if (cleaned.includes('avanzado')) return 'Avanzado';
    if (cleaned.includes('experto') || cleaned.includes('maestro')) return 'Experto';
    
    return 'Intermedio';
  }

  /**
   * Verifica si un CVData está en formato tradicional o Harvard
   */
  static isHarvardFormat(data: any): data is CVDataHarvard {
    return 'skillCategories' in data && Array.isArray(data.skillCategories);
  }

  /**
   * Convierte automáticamente entre formatos según sea necesario
   */
  static ensureFormat<T extends CVData | CVDataHarvard>(
    data: CVData | CVDataHarvard, 
    targetFormat: 'traditional' | 'harvard'
  ): T {
    if (targetFormat === 'harvard') {
      if (this.isHarvardFormat(data)) {
        return data as T;
      }
      return this.toHarvardFormat(data as CVData) as T;
    } else {
      if (this.isHarvardFormat(data)) {
        return this.fromHarvardFormat(data) as T;
      }
      return data as T;
    }
  }

  /**
   * Crea un CV Harvard vacío con estructura básica
   */
  static createEmptyHarvardCV(): CVDataHarvard {
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
      skillCategories: [],
      certifications: [],
      languages: [],
      projects: [],
      hobbies: []
    };
  }

  /**
   * Migra datos de ejemplo de Francesco Lucchesi
   */
  static createStudentExampleCV(): CVDataHarvard {
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedIn: '',
        summary: 'Estudiante universitario comprometido con el aprendizaje continuo y el desarrollo profesional. Con experiencia en proyectos académicos y extracurriculares que han desarrollado mis habilidades analíticas, de trabajo en equipo y resolución de problemas.'
      },
      education: [
        {
          id: 'edu-1',
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: new Date().getFullYear().toString(),
          endDate: '',
          current: true,
          achievements: []
        }
      ],
      workExperience: [],
      skillCategories: [
        {
          id: 'skills-1',
          category: 'Software',
          skills: [
            { name: 'Microsoft Office: Word', level: '(Intermedio)' },
            { name: 'Microsoft Office: Excel', level: '(Básico)' },
            { name: 'Microsoft Office: PowerPoint', level: '(Intermedio)' }
          ]
        }
      ],
      certifications: [],
      languages: [
        {
          id: 'lang-1',
          language: 'Español',
          proficiency: 'Nativo'
        },
        {
          id: 'lang-2',
          language: 'Inglés',
          proficiency: 'Intermedio'
        }
      ],
      projects: [],
      hobbies: []
    };
  }
}
