import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { AI_TASK_CONFIGS, buildPrompt, createErrorResponse } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    const { description, role, company, industry } = await request.json();

    if (!description || !role) {
      return NextResponse.json(
        { error: 'description y role son requeridos' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(
      'Mejorar descripción de trabajo para CV en formato Harvard',
      {
        'Puesto': role,
        'Empresa': company || 'No especificada',
        'Industria': industry || 'No especificada',
        'Descripción actual': description
      },
      [
        'Usa verbos de acción fuertes (ej: "Lideré", "Desarrollé", "Implementé")',
        'Cuantifica los logros siempre que sea posible (ej: "aumenté las ventas en un 20%", "reduje los costos en $15,000")',
        'Enfócate en resultados e impacto, no solo en responsabilidades',
        'Mantén un tono profesional y formal, adecuado para un CV',
        'La respuesta debe ser solo la descripción mejorada, sin introducciones ni texto adicional'
      ]
    );

    const result = await generateText({
      ...AI_TASK_CONFIGS.OPTIMIZATION,
      messages: [{ role: "user", content: prompt }],
    });

    const enhancedDescription = result.text?.trim() || '';

    return NextResponse.json({ description: enhancedDescription });
    
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error, 'mejora de descripción'),
      { status: 500 }
    );
  }
}
