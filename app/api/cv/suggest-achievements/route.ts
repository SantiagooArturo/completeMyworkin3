import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ✅ SEGURO: API Key solo en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Sin NEXT_PUBLIC_
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

    const prompt = `Basado en la siguiente descripción de trabajo para un/a ${role}: "${description}", 
    sugiere 3 logros cuantificables que podrían añadirse al CV en formato Harvard. 
    Cada logro debe ser específico, medible y relevante para el puesto. 
    Devuelve solo los logros, uno por línea, sin numeración ni puntos.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const achievements = completion.choices[0].message.content
      ?.trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0) || [];

    return NextResponse.json({ achievements });
    
  } catch (error) {
    console.error('Error al sugerir logros:', error);
    return NextResponse.json(
      { error: 'Error al sugerir logros' },
      { status: 500 }
    );
  }
}
