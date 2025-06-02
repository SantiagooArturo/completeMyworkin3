import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ✅ SEGURO: API Key solo en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Sin NEXT_PUBLIC_
});

export async function POST(request: NextRequest) {
  try {
    const { currentSummary, personalInfo, experience } = await request.json();

    if (!currentSummary && !personalInfo && !experience) {
      return NextResponse.json(
        { error: 'Se requiere al menos un parámetro: currentSummary, personalInfo o experience' },
        { status: 400 }
      );
    }

    const prompt = `Como experto en CV, mejora el siguiente resumen profesional haciéndolo más impactante y específico:

${currentSummary ? `Resumen actual: ${currentSummary}` : ''}

Información personal disponible:
${personalInfo ? JSON.stringify(personalInfo, null, 2) : 'No proporcionada'}

Experiencia profesional:
${experience && experience.length > 0 ? JSON.stringify(experience, null, 2) : 'No proporcionada'}

Instrucciones:
1. Mantén un tono profesional y conciso
2. Incluye logros cuantificables cuando sea posible
3. Destaca habilidades técnicas relevantes
4. Máximo 4-5 líneas
5. Usa verbos de acción en presente
6. Personaliza según la experiencia proporcionada

Devuelve solo el resumen mejorado, sin explicaciones adicionales.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en redacción de CV con más de 10 años de experiencia ayudando a profesionales a destacar en sus aplicaciones laborales."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const enhancedSummary = completion.choices[0].message.content?.trim();

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
    console.error('❌ Error mejorando resumen:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}