import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { AI_TASK_CONFIGS, buildPrompt, createErrorResponse, processTextResponse } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    const { description, role } = await request.json();

    if (!description || !role) {
      return NextResponse.json(
        { error: 'description y role son requeridos' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(
      'Sugerir logros cuantificables para experiencia laboral',
      {
        'Puesto': role,
        'Descripción del trabajo': description
      },
      [
        'Sugiere 3 logros cuantificables que podrían añadirse al CV en formato Harvard',
        'Cada logro debe ser específico, medible y relevante para el puesto',
        'Usa métricas cuando sea posible (porcentajes, números, tiempos)',
        'Enfócate en resultados e impacto, no solo en responsabilidades',
        'Devuelve solo los logros, uno por línea, sin numeración ni puntos'
      ],
      [
        'Implementé sistema que redujo costos operativos en 25%',
        'Lideré equipo de 8 personas aumentando productividad en 40%',
        'Desarrollé proceso que mejoró satisfacción del cliente en 30%'
      ]
    );

    const result = await generateText({
      ...AI_TASK_CONFIGS.SUGGESTIONS,
      messages: [{ role: "user", content: prompt }],
    });

    const achievements = processTextResponse(result.text || '', { maxItems: 3 });

    return NextResponse.json({ achievements });
    
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error, 'sugerencias de logros'),
      { status: 500 }
    );
  }
}
