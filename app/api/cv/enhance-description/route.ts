import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY no está configurado');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { description, role } = await request.json();

    if (!description || !role) {
      return NextResponse.json(
        { error: 'description y role son requeridos' },
        { status: 400 }
      );
    }

    const prompt = `Mejora la siguiente descripción de trabajo para un CV en formato Harvard. 
    El puesto es: ${role}. 
    Descripción actual: "${description}". 
    Haz que sea más impactante, utiliza verbos de acción, sé específico y cuantifica los logros cuando sea posible. 
    Mantén un tono profesional y formal.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const enhancedDescription = completion.choices[0].message.content?.trim() || '';

    return NextResponse.json({ description: enhancedDescription });
    
  } catch (error) {
    console.error('Error al mejorar la descripción:', error);
    return NextResponse.json(
      { error: 'Error al mejorar la descripción' },
      { status: 500 }
    );
  }
}
