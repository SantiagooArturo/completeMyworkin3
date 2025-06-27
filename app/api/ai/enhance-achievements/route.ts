import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { description, position, company, industry } = await request.json();

    if (!description || !position) {
      return NextResponse.json(
        { error: 'Se requiere descripción y posición del cargo (description, position)' },
        { status: 400 }
      );
    }

    const prompt = `Como experto en reclutamiento y redacción de CVs para LATAM, genera 3 logros cuantificables y de alto impacto para un CV, basados en la siguiente descripción de un puesto de trabajo.

    **Contexto:**
    - **Puesto:** ${position}
    - **Empresa:** ${company || 'No especificada'}
    - **Industria:** ${industry || 'No especificada'}
    - **Descripción del puesto:** "${description}"

    **Instrucciones:**
    1.  Crea 3 logros específicos y creíbles.
    2.  Usa verbos de acción fuertes en tiempo pasado (ej: "Lideré", "Desarrollé", "Incrementé").
    3.  Cuantifica el impacto con métricas realistas (ej: %, $, número de proyectos, reducción de tiempo).
    4.  Cada logro debe ser una sola frase, concisa y directa.
    5.  La respuesta debe ser únicamente un array de strings en formato JSON, así: 
        { "achievements": ["Logro 1", "Logro 2", "Logro 3"] }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en la creación de CVs que genera logros impactantes y cuantificables basados en la descripción de un trabajo. Tu respuesta debe ser siempre un JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }, // Habilitar modo JSON
      temperature: 0.8, // Aumentar un poco la creatividad
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content?.trim();

    if (!responseText) {
      throw new Error('La respuesta de la IA estaba vacía.');
    }

    const parsed = JSON.parse(responseText);
    const achievements = parsed.achievements || [];

    if (!achievements || achievements.length === 0) {
      throw new Error('No se pudieron generar logros válidos.');
    }

    return NextResponse.json({ achievements });

  } catch (error: any) {
    console.error('❌ Error generando logros con IA:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
