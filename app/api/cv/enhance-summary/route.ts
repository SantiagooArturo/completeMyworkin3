import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { AI_TASK_CONFIGS, buildPrompt, createErrorResponse } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    const { currentSummary, personalInfo, experience, cycleNumber, career, universityName } = await request.json();

    if (!currentSummary && !personalInfo && !experience) {
      return NextResponse.json(
        { error: 'Se requiere al menos un parámetro: currentSummary, personalInfo o experience' },
        { status: 400 }
      );
    }

    // Prompt mejorado para mayor adaptación al CVBuilder y objetivo profesional personalizado
    const prompt = buildPrompt(
      'Generar resumen profesional y objetivo para CV',
      {
        'Resumen actual': currentSummary || 'No proporcionado',
        'Información personal': personalInfo ? JSON.stringify(personalInfo, null, 2) : 'No proporcionada',
        'Experiencia profesional': experience && experience.length > 0 ? JSON.stringify(experience, null, 2) : 'No proporcionada',
        'Formación académica': `Estudiante de ${cycleNumber} ciclo de ${career} en la/el ${universityName}.`,
        'Instrucciones': `
1. Mejora el resumen profesional para que sea claro, impactante y adaptado a un CV moderno. Incluye logros, habilidades técnicas y blandas, y una breve descripción de tu perfil profesional.
2. Después del resumen, agrega una sección de "Objetivo profesional" personalizada para el puesto y empresa objetivo si se proveen (por ejemplo: "Especialmente interesado en oportunidades como PRACTICANTE DE DESARROLLO DE PROYECTOS IA en Luz del Sur donde pueda aplicar mi experiencia y continuar desarrollando mis competencias profesionales."). Si no hay puesto/empresa, genera un objetivo profesional genérico pero atractivo.
3. Usa una estructura clara:

Resumen profesional:
[Texto del resumen mejorado, 3-5 líneas]

Objetivo profesional:
[Texto del objetivo profesional, 1-2 líneas]

4. Mantén un tono profesional, positivo y personalizado. No repitas frases genéricas. No incluyas explicaciones ni instrucciones, solo el texto final para el CV.`
      },
      [
        'Devuelve el texto listo para pegar en el CV, sin explicaciones ni encabezados adicionales.',
        'No incluyas frases como "A continuación" o "El objetivo profesional es..."',
        'No repitas información innecesaria.'
      ]
    );

    const result = await generateText({
      ...AI_TASK_CONFIGS.ADVANCED_ANALYSIS,
      messages: [
        {
          role: "system",
          content: "Eres un experto en redacción de CV con más de 10 años de experiencia ayudando a profesionales a destacar en sus aplicaciones laborales."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const enhancedSummary = result.text?.trim();

    if (!enhancedSummary) {
      throw new Error('No se pudo generar el resumen mejorado');
    }

    return NextResponse.json({
      success: true,
      summary: enhancedSummary,
      metadata: {
        originalLength: currentSummary?.length || 0,
        enhancedLength: enhancedSummary.length,
        model: "gpt-4",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(error, 'mejora de resumen'),
      { status: 500 }
    );
  }
}
