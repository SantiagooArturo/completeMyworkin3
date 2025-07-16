import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description, projectName, technologies } = await request.json();

    if (!description || !projectName) {
      return new Response(
        JSON.stringify({ error: 'Se requiere descripción y nombre del proyecto' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const prompt = `Eres un experto en redacción de CVs para LATAM. Mejora la siguiente descripción de proyecto para que sea más impactante, profesional y relevante para reclutadores. 

INSTRUCCIONES:
- Usa verbos de acción en pasado (desarrollé, implementé, lideré)
- Cuantifica logros cuando sea posible (ej: "mejoré el rendimiento en 30%")
- Destaca el uso de tecnologías
- Mantén un tono profesional pero directo
- Devuelve SOLO la descripción optimizada, sin explicaciones adicionales

PROYECTO:
Nombre: ${projectName}
Tecnologías: ${technologies || 'No especificadas'}
Descripción actual: ${description}

DESCRIPCIÓN OPTIMIZADA:`;

    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: [
        { 
          role: 'system', 
          content: 'Eres un experto en redacción de CVs para LATAM. Tu trabajo es optimizar descripciones de proyectos para que sean más atractivas para reclutadores. Responde únicamente con la descripción mejorada, sin explicaciones adicionales.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 400,
    });

    return result.toDataStreamResponse();
    
  } catch (error: any) {
    console.error('❌ Error optimizando descripción del proyecto:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
