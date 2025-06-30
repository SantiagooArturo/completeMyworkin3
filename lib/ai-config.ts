import { openai } from '@ai-sdk/openai';

/**
 * Configuración centralizada para todas las APIs de IA del CV
 * Mejora la mantenibilidad y consistencia
 */

// Modelos disponibles para diferentes tareas
export const AI_MODELS = {
  // Para tareas simples como sugerencias y optimizaciones básicas
  FAST: 'gpt-3.5-turbo',
  // Para tareas complejas que requieren mayor calidad
  ADVANCED: 'gpt-4',
  // Para tareas de análisis de gran volumen
  EFFICIENT: 'gpt-3.5-turbo-16k'
} as const;

// Configuraciones predeterminadas para diferentes tipos de tareas
export const AI_TASK_CONFIGS = {
  // Para sugerencias rápidas (skills, achievements)
  SUGGESTIONS: {
    model: openai(AI_MODELS.FAST),
    temperature: 0.7,
    maxTokens: 400,
  },
  
  // Para optimizaciones de texto (descripciones, summaries)
  OPTIMIZATION: {
    model: openai(AI_MODELS.FAST),
    temperature: 0.6,
    maxTokens: 500,
  },
  
  // Para tareas avanzadas (análisis complejo, resumenes ejecutivos)
  ADVANCED_ANALYSIS: {
    model: openai(AI_MODELS.ADVANCED),
    temperature: 0.7,
    maxTokens: 600,
  },
  
  // Para streaming de contenido (descripciones de proyectos)
  STREAMING: {
    model: openai(AI_MODELS.FAST),
    temperature: 0.6,
    maxTokens: 800,
  }
} as const;

// Prompts base reutilizables
export const BASE_PROMPTS = {
  CV_EXPERT_SYSTEM: "Eres un experto en redacción de CVs con más de 10 años de experiencia ayudando a profesionales a destacar en sus aplicaciones laborales. Te especializas en el formato Harvard y el mercado laboral de LATAM.",
  
  HARVARD_FORMAT: "Utiliza el formato Harvard para CVs: enfócate en logros cuantificables, usa verbos de acción en pasado, incluye métricas específicas y mantén un tono profesional.",
  
  QUANTIFIABLE_RESULTS: "Cada logro debe ser específico, medible y relevante. Usa métricas cuando sea posible (ej: 'Mejoré el rendimiento en 30%', 'Reduje el tiempo de carga en 2 segundos').",
  
  PROFESSIONAL_TONE: "Mantén un tono profesional y formal, adecuado para un CV. Usa verbos de acción fuertes y enfócate en resultados e impacto, no solo en responsabilidades."
} as const;

// Función helper para crear configuraciones personalizadas
export function createAIConfig(taskType: keyof typeof AI_TASK_CONFIGS, customOptions?: {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}) {
  const baseConfig = AI_TASK_CONFIGS[taskType];
  
  return {
    model: customOptions?.model ? openai(customOptions.model) : baseConfig.model,
    temperature: customOptions?.temperature ?? baseConfig.temperature,
    maxTokens: customOptions?.maxTokens ?? baseConfig.maxTokens,
  };
}

// Función para generar prompts consistentes
export function buildPrompt(
  task: string,
  context: Record<string, any>,
  instructions: string[],
  examples?: string[]
) {
  let prompt = `${BASE_PROMPTS.CV_EXPERT_SYSTEM}\n\n`;
  prompt += `**Tarea:** ${task}\n\n`;
  
  if (Object.keys(context).length > 0) {
    prompt += `**Contexto:**\n`;
    Object.entries(context).forEach(([key, value]) => {
      if (value) {
        prompt += `- **${key}:** ${value}\n`;
      }
    });
    prompt += `\n`;
  }
  
  if (instructions.length > 0) {
    prompt += `**Instrucciones:**\n`;
    instructions.forEach((instruction, index) => {
      prompt += `${index + 1}. ${instruction}\n`;
    });
    prompt += `\n`;
  }
  
  if (examples && examples.length > 0) {
    prompt += `**Ejemplos esperados:**\n`;
    examples.forEach(example => {
      prompt += `- ${example}\n`;
    });
    prompt += `\n`;
  }
  
  return prompt;
}

// Funciones helper para manejo de errores consistente
export function createErrorResponse(error: unknown, context: string) {
  console.error(`❌ Error en ${context}:`, error);
  
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  
  return {
    error: `Error en ${context}`,
    details: errorMessage,
    timestamp: new Date().toISOString()
  };
}

// Función para procesar respuestas de texto de manera consistente
export function processTextResponse(text: string, options?: {
  removeNumbering?: boolean;
  removeBullets?: boolean;
  maxItems?: number;
  splitBy?: string;
}) {
  if (!text) return [];
  
  const {
    removeNumbering = true,
    removeBullets = true,
    maxItems,
    splitBy = '\n'
  } = options || {};
  
  let processed = text
    .trim()
    .split(splitBy)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);
  
  if (removeNumbering) {
    processed = processed
      .filter((line: string) => !line.match(/^\d+[\.\)]/))
      .map((line: string) => line.replace(/^\d+[\.\)]\s*/, ''));
  }
  
  if (removeBullets) {
    processed = processed.map((line: string) => 
      line.replace(/^[\-\*\•]\s*/, '')
    );
  }
  
  if (maxItems) {
    processed = processed.slice(0, maxItems);
  }
  
  return processed;
}
