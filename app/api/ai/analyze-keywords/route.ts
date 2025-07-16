import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { cvData, targetJobDescription } = await request.json();

    if (!cvData) {
      return NextResponse.json(
        { error: 'Se requiere la información del CV (cvData)' },
        { status: 400 }
      );
    }

    const prompt = `Como experto en optimización ATS y reclutamiento, analiza este CV de estudiante/profesional junior:

DATOS DEL CV:
${JSON.stringify(cvData, null, 2)}

${targetJobDescription ? `PUESTO OBJETIVO:\n${targetJobDescription}\n` : ''}

CONTEXTO: Este es un CV de estudiante/recién graduado en tecnología.

Proporciona análisis enfocado en:
1. Keywords técnicas actuales vs. requeridas
2. Habilidades blandas identificables  
3. Palabras clave de industria tech
4. Optimización específica para junior roles
5. Score ATS realista para nivel junior

FORMATO JSON REQUERIDO:
{
  "currentKeywords": ["react", "javascript", ...],
  "missingKeywords": ["keyword faltante", ...],
  "juniorFocusKeywords": ["entry-level", "intern", "junior", ...],
  "atsScore": 75,
  "recommendations": [...],
  "industryAlignment": "high/medium/low"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en sistemas ATS y optimización de CV con profundo conocimiento sobre cómo los algoritmos de reclutamiento procesan y califican documentos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Menos creativo, más analítico
      max_tokens: 1000,
    });

    const responseText = completion.choices[0].message.content?.trim();

    if (!responseText) {
      throw new Error('No se pudo generar el análisis de keywords');
    }

    // Intentar parsear como JSON
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      // Si falla el parsing, crear estructura básica
      analysis = {
        currentKeywords: [],
        missingKeywords: [],
        keywordDensity: {
          technical: "medium",
          skills: "medium", 
          industry: "medium"
        },
        atsScore: 50,
        recommendations: [{
          section: "General",
          suggestion: "Se requiere análisis manual detallado",
          keywords: []
        }],
        improvementAreas: ["Análisis manual requerido"],
        rawResponse: responseText
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        hasTargetJob: !!targetJobDescription,
        model: "gpt-4",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error analizando keywords:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
