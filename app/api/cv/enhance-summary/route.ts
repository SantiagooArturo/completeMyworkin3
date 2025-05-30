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
    const { currentSummary, role } = await request.json();

    if (!currentSummary || !role) {
      return NextResponse.json(
        { error: 'currentSummary y role son requeridos' },
        { status: 400 }
      );
    }

    const prompt = `Mejora el siguiente resumen profesional para un CV en formato Harvard. 
    El perfil es para un/a ${role}. 
    Resumen actual: "${currentSummary}". 
    Haz que sea más impactante, profesional y específico. Incluye logros cuantificables si es posible. 
    Mantén un tono formal y profesional. No excedas los 250 caracteres.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const summary = completion.choices[0].message.content?.trim() || '';

    return NextResponse.json({ summary });
    
  } catch (error) {
    console.error('Error al mejorar el resumen:', error);
    return NextResponse.json(
      { error: 'Error al mejorar el resumen' },
      { status: 500 }
    );
  }
}
