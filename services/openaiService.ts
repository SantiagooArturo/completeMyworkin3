import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class OpenAIService {
  private static instance: OpenAIService;

  private constructor() {}

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  static async enhanceCV(cvData: any) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un experto en optimización de CVs que ayuda a mejorar el contenido manteniendo el formato Harvard.
            Tus sugerencias deben ser específicas, medibles y orientadas a resultados.`
          },
          {
            role: "user",
            content: `Mejora el siguiente CV añadiendo:
            1. Logros cuantificables
            2. Palabras clave relevantes
            3. Métricas de impacto
            4. Verbos de acción
            
            CV Original: ${JSON.stringify(cvData, null, 2)}`
          }
        ],
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error al mejorar el CV con OpenAI:', error);
      throw error;
    }
  }
  static async suggestSkills(role: string, currentSkills: string[]) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `Eres un experto en recursos humanos especializado en identificar habilidades relevantes para diferentes roles profesionales. 
            Para el formato Harvard del CV, debes sugerir habilidades específicas, medibles y relevantes.
            Las sugerencias deben seguir este formato:
            - Habilidades técnicas específicas del rol
            - Herramientas y software relevantes
            - Habilidades blandas importantes para el puesto
            Las respuestas deben ser concisas, una habilidad por línea.`
          },
          {
            role: "user",
            content: `Sugiere habilidades adicionales relevantes para el rol de ${role}.
            Habilidades actuales: ${currentSkills.join(", ")}`
          }
        ],
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error al sugerir habilidades:', error);
      throw error;
    }
  }

  static async enhanceDescription(description: string, role: string) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Eres un experto en redacción profesional que mejora descripciones de experiencia laboral."
          },
          {
            role: "user",
            content: `Mejora la siguiente descripción para el rol de ${role}, añadiendo métricas y logros específicos:
            
            ${description}`
          }
        ],
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error al mejorar la descripción:', error);
      throw error;
    }
  }
}
