import { CVData } from '@/types/cv';

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
  // Método auxiliar para hacer llamadas a la API
  private async callServerAPI(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`/api/cv/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.statusText}`);
    }

    return response.json();
  }

  // Mejorar el resumen profesional
  async enhanceSummary(currentSummary: string, role: string): Promise<string> {
    const response = await this.callServerAPI('enhance-summary', { currentSummary, role });
    return response.summary;
  }

  // Sugerir logros cuantificables
  async suggestAchievements(description: string, role: string): Promise<string[]> {
    const response = await this.callServerAPI('suggest-achievements', { description, role });
    return response.achievements;
  }

  // Analizar y mejorar las habilidades
  async enhanceSkills(skills: string[], role: string): Promise<{
    suggested: string[];
    improvements: { [key: string]: string };
  }> {
    return this.callServerAPI('suggest-skills', { skills, role });
  }

  // Mejorar descripciones de trabajo
  async enhanceJobDescriptions(description: string, role: string): Promise<string> {
    const response = await this.callServerAPI('enhance-description', { description, role });
    return response.description;
  }

  // Análisis completo del CV
  async analyzeFullCV(cvData: CVData): Promise<AIEnhancementSuggestions> {
    const role = cvData.workExperience.length > 0 ? cvData.workExperience[0].position : 'profesional';
    
    // Realizar análisis en paralelo para mejorar el rendimiento
    const [summary, skillsAnalysis] = await Promise.all([
      this.enhanceSummary(cvData.personalInfo.summary, role),
      this.enhanceSkills(
        cvData.skills.map(skill => skill.name),
        role
      )
    ]);
    
    // Analizar la primera experiencia laboral para sugerir logros
    let achievements: string[] = [];
    if (cvData.workExperience.length > 0) {
      const firstJob = cvData.workExperience[0];
      achievements = await this.suggestAchievements(firstJob.description ?? '', firstJob.position ?? '');
    }
    
    return {
      summary,
      achievements,
      skills: skillsAnalysis,
      descriptions: {}
    };
  }
}

export const cvAIEnhancementService = new CVAIEnhancementService();
