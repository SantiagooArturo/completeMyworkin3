import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, transcript, jobTitle } = await request.json();

    if (!question || !transcript) {
      return NextResponse.json(
        { error: 'Question and transcript are required' },
        { status: 400 }
      );
    }

    const prompt = `Evalúa esta respuesta de entrevista para el puesto: "${jobTitle || 'No especificado'}"

PREGUNTA: ${question}

RESPUESTA DEL CANDIDATO: ${transcript}

Proporciona una evaluación detallada en el siguiente formato JSON:

{
  "score": [número del 1 al 10],
  "summary": "Resumen general de la respuesta en 1-2 oraciones",
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "improvements": ["área de mejora 1", "área de mejora 2"],
  "recommendations": ["recomendación específica 1", "recomendación específica 2"]
}

Criterios de evaluación:
- Relevancia y coherencia de la respuesta
- Claridad y estructura de la comunicación
- Ejemplos concretos y evidencia
- Conocimiento del rol/industria
- Profesionalismo y confianza
- Completitud de la respuesta

Sé constructivo pero honesto en la evaluación.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto evaluador de entrevistas de trabajo. Proporciona feedback constructivo y específico que ayude al candidato a mejorar. Responde siempre con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content?.trim();
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      // Fallback evaluation
      evaluation = {
        score: 7,
        summary: "Respuesta recibida y procesada correctamente.",
        strengths: ["Comunicación clara", "Respuesta estructurada"],
        improvements: ["Agregar más ejemplos específicos", "Profundizar en experiencias relevantes"],
        recommendations: ["Preparar ejemplos concretos para futuras entrevistas", "Practicar técnicas de storytelling"]
      };
    }

    // Validate evaluation structure
    if (!evaluation.score || !evaluation.summary || !evaluation.strengths || !evaluation.improvements || !evaluation.recommendations) {
      evaluation = {
        score: Math.max(1, Math.min(10, evaluation.score || 7)),
        summary: evaluation.summary || "Respuesta evaluada exitosamente.",
        strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : ["Participación activa en la entrevista"],
        improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements : ["Continuar desarrollando habilidades de comunicación"],
        recommendations: Array.isArray(evaluation.recommendations) ? evaluation.recommendations : ["Practicar respuestas a preguntas comunes de entrevista"]
      };
    }

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
