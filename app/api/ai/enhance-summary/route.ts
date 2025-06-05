import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Datos recibidos:', JSON.stringify(body, null, 2));
    
    // Solo extraer lo que necesitamos
    const { summary, generateFromScratch = false } = body;
    
    console.log('🎯 Datos procesados:', { summary, generateFromScratch });
    
    if (!summary) {
      return NextResponse.json(
        { error: 'Se requiere el resumen profesional actual' },
        { status: 400 }
      );
    }

    // Tu prompt exacto con el contenido del resumen
    const basePrompt = `Estudiante de "Numero" ciclo de "Carrera" en la/el "NombredelaUniversidad". En esta sección, tienes la oportunidad de describir tu identidad profesional de una manera integral. Combina elementos personales, como tu mentalidad y trayectoria, con tus intereses profesionales para ofrecer una visión completa de quién eres y qué persigues en tu carrera. Puedes destacar tus fortalezas, experiencias relevantes y áreas de interés específicas para transmitir una imagen clara y auténtica de ti mismo/a.

RESUMEN ACTUAL:
${summary}

INSTRUCCIONES:
- ${generateFromScratch ? 'Crea un resumen completamente nuevo basado en la estructura proporcionada' : 'Mejora el resumen existente manteniendo la esencia'}
- Mantén un tono profesional pero auténtico
- Máximo 4-5 líneas impactantes
- Incluye palabras clave técnicas relevantes
- Describe la identidad profesional de manera integral

Devuelve SOLO el resumen mejorado, sin explicaciones.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en redacción de CV especializado en crear resúmenes profesionales que destaquen el potencial único de cada candidato, especialmente estudiantes y profesionales junior."
        },
        {
          role: "user",
          content: basePrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    const enhancedSummary = completion.choices[0].message.content?.trim();

    if (!enhancedSummary) {
      throw new Error('No se pudo generar el resumen mejorado');
    }

    return NextResponse.json({
      success: true,
      summary: enhancedSummary,
      metadata: {
        originalLength: summary.length, // Cambiar aquí también
        enhancedLength: enhancedSummary.length,
        model: "gpt-4",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error en enhance-summary:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}