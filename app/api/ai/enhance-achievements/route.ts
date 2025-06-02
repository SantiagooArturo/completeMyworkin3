import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ✅ SEGURO: API Key solo en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Sin NEXT_PUBLIC_
});

export async function POST(request: NextRequest) {
  try {
    const { achievements, jobTitle, industry } = await request.json();

    if (!achievements || !Array.isArray(achievements) || achievements.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de logros (achievements)' },
        { status: 400 }
      );
    }

    const prompt = `Como experto en optimización de CV, mejora los siguientes logros profesionales para que sean más impactantes y específicos:

Puesto: ${jobTitle || 'No especificado'}
Industria: ${industry || 'No especificada'}

Logros actuales:
${achievements.map((achievement, index) => `${index + 1}. ${achievement}`).join('\n')}

Instrucciones para cada logro:
1. Añade métricas cuantificables cuando sea posible (porcentajes, números, fechas)
2. Usa verbos de acción fuertes en pasado
3. Incluye el impacto específico de la acción
4. Mantén cada logro en una línea concisa pero descriptiva
5. Asegúrate de que sea específico para la industria mencionada
6. Usa palabras clave relevantes para optimización ATS

Devuelve SOLO los logros mejorados en formato JSON:
{
  "enhancedAchievements": [
    "Logro mejorado 1",
    "Logro mejorado 2",
    ...
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en redacción de CV especializado en transformar logros básicos en declaraciones impactantes que destacan el valor agregado del candidato."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content?.trim();

    if (!responseText) {
      throw new Error('No se pudo generar logros mejorados');
    }

    // Intentar parsear como JSON
    let enhancedAchievements;
    try {
      const parsed = JSON.parse(responseText);
      enhancedAchievements = parsed.enhancedAchievements || [];
    } catch {
      // Si falla el parsing, intentar extraer logros del texto
      const lines = responseText.split('\n').filter(line => line.trim() && 
        (line.match(/^\d+\./) || line.includes('•') || line.includes('-')));
      enhancedAchievements = lines.map(line => 
        line.replace(/^\d+\.\s*/, '').replace(/^[•-]\s*/, '').trim()
      );
    }

    if (!enhancedAchievements || enhancedAchievements.length === 0) {
      throw new Error('No se pudieron extraer logros válidos de la respuesta');
    }

    return NextResponse.json({
      success: true,
      enhancedAchievements,
      metadata: {
        originalCount: achievements.length,
        enhancedCount: enhancedAchievements.length,
        jobTitle,
        industry,
        model: "gpt-4",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error mejorando logros:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
