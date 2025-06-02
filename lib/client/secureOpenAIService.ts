// ✅ Cliente seguro - NO incluye API keys
export class SecureOpenAIService {
  private static instance: SecureOpenAIService;
  private readonly baseUrl = '/api/ai';

  private constructor() {}

  public static getInstance(): SecureOpenAIService {
    if (!SecureOpenAIService.instance) {
      SecureOpenAIService.instance = new SecureOpenAIService();
    }
    return SecureOpenAIService.instance;
  }

  /**
   * Analiza un CV usando IA de forma segura
   */
  async analyzeCV(cvData: any, analysisType: 'comprehensive' | 'ats' | 'quick' = 'comprehensive') {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData,
          analysisType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error en análisis de CV:', error);
      throw error;
    }
  }
  /**
   * Mejora el resumen de un CV
   */
  async enhanceSummary(currentSummary: string, personalInfo: any, experience: any[]) {
    try {
      const response = await fetch(`${this.baseUrl}/enhance-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSummary,
          personalInfo,
          experience
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error en mejora de resumen:', error);
      throw error;
    }
  }

  /**
   * Sugiere mejoras para logros profesionales
   */
  async enhanceAchievements(achievements: string[], jobTitle: string, industry: string) {
    try {
      const response = await fetch(`${this.baseUrl}/enhance-achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          achievements,
          jobTitle,
          industry
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error en mejora de logros:', error);
      throw error;
    }
  }

  /**
   * Analiza keywords para optimización ATS
   */
  async analyzeKeywords(cvData: any, targetJobDescription?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData,
          targetJobDescription
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error en análisis de keywords:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const secureOpenAIService = SecureOpenAIService.getInstance();
