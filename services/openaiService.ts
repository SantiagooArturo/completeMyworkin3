// ✅ MIGRADO A SEGURO: Este servicio ahora usa APIs seguras del servidor
import { secureOpenAIService } from '@/lib/client/secureOpenAIService';

/**
 * @deprecated Usar secureOpenAIService directamente para nuevas implementaciones
 * Esta clase se mantiene por compatibilidad pero ahora delega a las APIs seguras
 */
export class OpenAIService {
  private static instance: OpenAIService;

  private constructor() {}

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * @deprecated Usar secureOpenAIService.analyzeCV()
   */
  static async enhanceCV(cvData: any) {
    try {
      console.warn('⚠️ OpenAIService.enhanceCV está deprecated. Usar secureOpenAIService.analyzeCV()');
      
      const result = await secureOpenAIService.analyzeCV(cvData, 'comprehensive');
      return result.analysis || 'CV analizado correctamente';
    } catch (error) {
      console.error('Error al mejorar el CV:', error);
      throw error;
    }
  }

  /**
   * @deprecated Crear API específica para sugerencias de skills
   */
  static async suggestSkills(role: string, currentSkills: string[]) {
    try {
      console.warn('⚠️ OpenAIService.suggestSkills será migrado a API segura');
      
      // Por ahora, usar analyze-keywords como alternativa
      const result = await secureOpenAIService.analyzeKeywords({
        personalInfo: { position: role },
        skills: currentSkills
      });
      
      const suggestions = result.analysis?.missingKeywords || [];
      return suggestions.length > 0 
        ? `Habilidades sugeridas:\n${suggestions.map((skill : string) => `• ${skill}`).join('\n')}`
        : 'No se encontraron sugerencias adicionales';
    } catch (error) {
      console.error('Error al sugerir habilidades:', error);
      throw error;
    }
  }

  /**
   * @deprecated Usar secureOpenAIService.enhanceAchievements()
   */
  static async enhanceDescription(description: string, role: string) {
    try {
      console.warn('⚠️ OpenAIService.enhanceDescription está deprecated. Usar secureOpenAIService.enhanceAchievements()');
      
      const result = await secureOpenAIService.enhanceAchievements([description], role, '');
      return result.enhancedAchievements?.[0] || description;
    } catch (error) {
      console.error('Error al mejorar la descripción:', error);
      throw error;
    }
  }
}
