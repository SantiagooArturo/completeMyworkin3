import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { AI_TASK_CONFIGS, buildPrompt, createErrorResponse, processTextResponse } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    const { skills, role } = await request.json();

    if (!skills || !role) {
      return NextResponse.json(
        { error: 'skills y role son requeridos' },
        { status: 400 }
      );
    }

    const skillsList = skills.join(', ');
    
    const prompt = buildPrompt(
      'Analizar y mejorar habilidades para CV',
      {
        'Puesto objetivo': role,
        'Habilidades actuales': skillsList
      },
      [
        'Sugiere 3 habilidades adicionales relevantes que no estén en la lista actual',
        'Para cada habilidad existente, sugiere una mejora en la forma de describirla para un CV en formato Harvard',
        'Las habilidades deben ser específicas y relevantes para el puesto',
        'Usa el siguiente formato de respuesta exacto:'
      ]
    ) + `
SUGERIDAS:
[habilidad1]
[habilidad2] 
[habilidad3]

MEJORAS:
[habilidad original]: [mejora]`;

    const result = await generateText({
      ...AI_TASK_CONFIGS.SUGGESTIONS,
      messages: [{ role: "user", content: prompt }],
    });

    const response = result.text || '';
    
    // Procesar la respuesta de manera más robusta
    const sections = response.split('\n\n');
    const suggestedSection = sections.find(section => section.includes('SUGERIDAS:')) || '';
    const improvementsSection = sections.find(section => section.includes('MEJORAS:')) || '';
    
    const suggested = processTextResponse(
      suggestedSection.replace('SUGERIDAS:', ''),
      { maxItems: 3 }
    );
    
    // Procesar mejoras de manera más robusta
    const improvementLines = processTextResponse(
      improvementsSection.replace('MEJORAS:', ''),
      { removeNumbering: false, removeBullets: false }
    );
    
    const improvements = improvementLines.reduce((acc: {[key: string]: string}, line: string) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const skill = line.substring(0, colonIndex).trim();
        const improvement = line.substring(colonIndex + 1).trim();
        if (skill && improvement) {
          acc[skill] = improvement;
        }
      }
      return acc;
    }, {});

    return NextResponse.json({
      suggested,
      improvements
    });
    
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error, 'sugerencias de habilidades'),
      { status: 500 }
    );
  }
}
