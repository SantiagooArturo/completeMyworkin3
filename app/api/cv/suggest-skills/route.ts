import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ✅ SEGURO: API Key solo en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Sin NEXT_PUBLIC_
});

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
    const prompt = `Analiza las siguientes habilidades para un/a ${role}: ${skillsList}. 
    1. Sugiere 3 habilidades adicionales relevantes que no estén en la lista. 
    2. Para cada habilidad existente, sugiere una mejora en la forma de describirla para un CV en formato Harvard.
    Formato de respuesta:
    SUGERIDAS:
    [habilidad1]
    [habilidad2]
    [habilidad3]
    
    MEJORAS:
    [habilidad original]: [mejora]`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const response = completion.choices[0].message.content || '';
    
    // Procesar la respuesta
    const [suggestedSection, improvementsSection] = response.split('\n\n');
    
    const suggested = suggestedSection
      .replace('SUGERIDAS:', '')
      .trim()
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    const improvements = improvementsSection
      .replace('MEJORAS:', '')
      .trim()
      .split('\n')
      .reduce((acc: {[key: string]: string}, line) => {
        const [skill, improvement] = line.split(':').map(s => s.trim());
        if (skill && improvement) {
          acc[skill] = improvement;
        }
        return acc;
      }, {});

    return NextResponse.json({
      suggested,
      improvements
    });
    
  } catch (error) {
    console.error('Error al generar sugerencias:', error);
    return NextResponse.json(
      { error: 'Error al generar sugerencias' },
      { status: 500 }
    );
  }
}
