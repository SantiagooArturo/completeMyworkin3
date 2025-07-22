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

    const prompt = buildPrompt(
      'Mejorar resumen profesional para CV',
      {
        'Resumen actual': currentSummary || 'No proporcionado',
        'Información personal': personalInfo ? JSON.stringify(personalInfo, null, 2) : 'No proporcionada',
        'Experiencia profesional': experience && experience.length > 0 ? JSON.stringify(experience, null, 2) : 'No proporcionada',
        'Formación académica': `Estudiante de ${cycleNumber} ciclo de ${career} en la/el ${universityName}. En esta sección, tienes la oportunidad de describir tu identidad profesional de una manera integral. Combina elementos personales, como tu mentalidad y trayectoria, con tus intereses profesionales para ofrecer una visión completa de quién eres y qué persigues en tu carrera. Puedes destacar tus fortalezas, experiencias relevantes y áreas de interés específicas para transmitir una imagen clara y auténtica de ti mismo/a.`
      },
      [
        'Mantén un tono profesional y conciso',
        'Incluye logros cuantificables cuando sea posible',
        'Destaca habilidades técnicas relevantes',
        'Máximo 4-5 líneas',
        'Usa verbos de acción en presente',
        'Personaliza según la experiencia proporcionada',
        'Devuelve solo el resumen mejorado, sin explicaciones adicionales'
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
