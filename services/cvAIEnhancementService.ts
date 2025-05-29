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

// Configuración para la API de OpenAI
const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''; // Asegúrate de configurar esta variable de entorno

export class CVAIEnhancementService {
  // Método auxiliar para hacer llamadas a la API de OpenAI
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error al llamar a la API de OpenAI:', error);
      throw new Error('No se pudo conectar con el servicio de IA. Por favor, inténtalo más tarde.');
    }
  }

  // Mejorar el resumen profesional
  async enhanceSummary(currentSummary: string, role: string): Promise<string> {
    const prompt = `Mejora el siguiente resumen profesional para un CV en formato Harvard. 
    El perfil es para un/a ${role}. 
    Resumen actual: "${currentSummary}". 
    Haz que sea más impactante, profesional y específico. Incluye logros cuantificables si es posible. 
    Mantén un tono formal y profesional. No excedas los 250 caracteres.`;
    
    return await this.callOpenAI(prompt);
  }

  // Sugerir logros cuantificables
  async suggestAchievements(description: string, role: string): Promise<string[]> {
    const prompt = `Basado en la siguiente descripción de trabajo para un/a ${role}: "${description}", 
    sugiere 3 logros cuantificables que podrían añadirse al CV en formato Harvard. 
    Cada logro debe ser específico, medible y relevante para el puesto. 
    Devuelve solo los logros, uno por línea, sin numeración ni puntos.`;
    
    const response = await this.callOpenAI(prompt);
    return response.split('\n').filter(line => line.trim() !== '');
  }

  // Analizar y mejorar las habilidades
  async enhanceSkills(skills: string[], role: string): Promise<{
    suggested: string[];
    improvements: { [key: string]: string };
  }> {
    const skillsList = skills.join(', ');
    const prompt = `Analiza las siguientes habilidades para un/a ${role}: ${skillsList}. 
    1. Sugiere 3 habilidades adicionales relevantes que no estén en la lista. 
    2. Para cada habilidad existente, sugiere una mejora en la forma de describirla para un CV en formato Harvard. 
    Formato de respuesta: 
    SUGERIDAS:\n[habilidad1]\n[habilidad2]\n[habilidad3]\n\nMEJORAS:\n[habilidad original]: [mejora]`;
    
    const response = await this.callOpenAI(prompt);
    
    // Procesar la respuesta
    const parts = response.split('MEJORAS:');
    const suggestedPart = parts[0].replace('SUGERIDAS:', '').trim();
    const improvementsPart = parts.length > 1 ? parts[1].trim() : '';
    
    const suggested = suggestedPart.split('\n').filter(s => s.trim() !== '');
    
    const improvements: { [key: string]: string } = {};
    if (improvementsPart) {
      improvementsPart.split('\n').forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          improvements[key] = value;
        }
      });
    }
    
    return { suggested, improvements };
  }

  // Mejorar descripciones de trabajo
  async enhanceJobDescriptions(description: string, role: string): Promise<string> {
    const prompt = `Mejora la siguiente descripción de trabajo para un CV en formato Harvard. 
    El puesto es: ${role}. 
    Descripción actual: "${description}". 
    Haz que sea más impactante, utiliza verbos de acción, sé específico y cuantifica los logros cuando sea posible. 
    Mantén un tono profesional y formal.`;
    
    return await this.callOpenAI(prompt);
  }

  // Análisis completo del CV
  async analyzeFullCV(cvData: CVData): Promise<AIEnhancementSuggestions> {
    // Implementación simplificada para el análisis completo
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
      achievements = await this.suggestAchievements(firstJob.description, firstJob.position);
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
