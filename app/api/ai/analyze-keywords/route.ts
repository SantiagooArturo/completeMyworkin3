import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ✅ SEGURO: API Key solo en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Sin NEXT_PUBLIC_
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

    const prompt = `Como experto en optimización ATS (Applicant Tracking System), analiza el siguiente CV y proporciona recomendaciones sobre palabras clave:

CV a analizar:
${JSON.stringify(cvData, null, 2)}

${targetJobDescription ? `Descripción del puesto objetivo:\n${targetJobDescription}\n` : ''}

Proporciona un análisis detallado que incluya:

1. PALABRAS CLAVE IDENTIFICADAS: Lista las palabras clave técnicas y habilidades que ya están presentes en el CV
2. PALABRAS CLAVE FALTANTES: Si hay descripción del puesto, identifica palabras clave importantes que faltan
3. DENSIDAD DE KEYWORDS: Evalúa si hay suficiente repetición de términos importantes
4. RECOMENDACIONES ESPECÍFICAS: Sugiere dónde y cómo incorporar nuevas palabras clave
5. SCORE ATS: Califica de 1-100 qué tan optimizado está el CV para ATS
6. ÁREAS DE MEJORA: Secciones específicas que necesitan más keywords

Devuelve la respuesta en formato JSON:
{
  "currentKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["missing1", "missing2", ...],
  "keywordDensity": {
    "technical": "low/medium/high",
    "skills": "low/medium/high",
    "industry": "low/medium/high"
  },
  "atsScore": 85,
  "recommendations": [
    {
      "section": "Sección del CV",
      "suggestion": "Recomendación específica",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "improvementAreas": ["área1", "área2", ...]
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
