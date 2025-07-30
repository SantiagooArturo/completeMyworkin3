import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { AI_TASK_CONFIGS, buildPrompt, createErrorResponse, processTextResponse } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    const { description, projectName, technologies } = await request.json();

    if (!description || !projectName) {
      return NextResponse.json(
        { error: 'description y projectName son requeridos' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(
      'Sugerir logros específicos para proyecto en CV',
      {
        'Nombre del proyecto': projectName,
        'Descripción': description,
        'Tecnologías': technologies || 'No especificadas'
      },
      [
        'Cada logro debe ser específico, medible y relevante',
        'Usa métricas cuando sea posible (ej: "Mejoré el rendimiento en 30%", "Reduje el tiempo de carga en 2 segundos")',
        'Enfócate en resultados e impacto técnico y de negocio',
        'Analiza el puesto al que se postula y relaciona con el logro',

        'Usa verbos de acción en pasado (desarrollé, implementé, optimicé)',
        'Hazlos atractivos para reclutadores técnicos',
        'Devuelve solo los logros, uno por línea, sin numeración ni puntos'
      ],
      [
        'Implementé arquitectura de microservicios que redujo los tiempos de respuesta en 40%',
        'Desarrollé funcionalidad que incrementó la retención de usuarios en 25%',
        'Optimicé consultas a base de datos mejorando el rendimiento general en 50%'
      ]
    );

    const result = await generateText({
      ...AI_TASK_CONFIGS.SUGGESTIONS,
      messages: [{ role: "user", content: prompt }],
    });

    const highlights = processTextResponse(result.text || '', { maxItems: 4 });

    return NextResponse.json({ highlights });
    
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error, 'sugerencias de logros de proyecto'),
      { status: 500 }
    );
  }
}
