import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { jobTitle } = await request.json();

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    const prompt = `Genera exactamente 4 preguntas de entrevista profesionales para el puesto: "${jobTitle}".

Las preguntas deben:
- Ser específicas para el rol y la industria
- Evaluar competencias técnicas y blandas relevantes
- Variar en dificultad (3 intermedias, 1 avanzada)
- Ser claras y directas con respecto al puesto y la industria
- Permitir respuestas de 1-3 minutos

Responde SOLO con un array JSON de exactamente 4 strings, sin texto adicional.

Ejemplo de formato:
["¿Cuál es tu experiencia previa en ventas?", "¿Cómo manejas la presión en el trabajo?", "Describe una situación donde superaste un objetivo difícil", "¿Qué estrategias usarías para retener clientes?"]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en recursos humanos que genera preguntas de entrevista precisas y relevantes. Responde siempre con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content?.trim();
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let questions;
    try {
      questions = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      // Fallback questions
      questions = [
        `¿Qué te motiva a aplicar para este puesto de ${jobTitle}?`,
        `¿Cuáles son tus principales fortalezas para este rol?`,
        `Describe una situación desafiante que hayas enfrentado profesionalmente`,
        `¿Cómo te ves contribuyendo a nuestra organización?`
      ];
    }

    // Validate that we have exactly 4 questions
    if (!Array.isArray(questions) || questions.length !== 4) {
      questions = [
        `¿Qué experiencia tienes relacionada con ${jobTitle}?`,
        `¿Cómo manejas la presión y los plazos ajustados?`,
        `Describe tus objetivos profesionales a corto y largo plazo`,
        `¿Qué valor único puedes aportar a este puesto?`
      ];
    }

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
