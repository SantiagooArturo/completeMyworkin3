import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createErrorResponse, generateRequestId, OpenAIError, ValidationError, ErrorLogger } from '@/lib/error/ErrorHandler';

// ✅ SEGURO: API Key solo en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Sin NEXT_PUBLIC_
});

export async function POST(request: NextRequest) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    const { cvData, analysisType = 'comprehensive' } = await request.json();

    if (!cvData) {
      return NextResponse.json(
        { error: 'Datos del CV requeridos' },
        { status: 400 }
      );
    }

    // Prompt específico según el tipo de análisis
    const systemPrompts = {
      comprehensive: `Eres un experto consultor de carrera especializado en análisis de CVs.
        Analiza el CV siguiendo el formato Harvard y proporciona:
        1. Fortalezas específicas identificadas
        2. Áreas de mejora concretas
        3. Sugerencias de optimización ATS
        4. Recomendaciones de contenido
        5. Puntuación general (1-100)
        
        Responde en español de forma profesional y constructiva.`,
      
      ats: `Eres un experto en sistemas ATS (Applicant Tracking Systems).
        Analiza este CV para optimización ATS y proporciona:
        1. Keywords faltantes por industria
        2. Estructura y formato para ATS
        3. Recomendaciones de secciones
        4. Score de compatibilidad ATS
        
        Responde en español con recomendaciones específicas.`,
      
      quick: `Proporciona un análisis rápido del CV en formato Harvard:
        1. 3 fortalezas principales
        2. 3 mejoras prioritarias
        3. Puntuación general
        
        Sé conciso pero específico. Responde en español.`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompts[analysisType as keyof typeof systemPrompts] || systemPrompts.comprehensive
        },
        {
          role: "user",
          content: `Analiza este CV en formato Harvard:
            
            INFORMACIÓN PERSONAL:
            ${JSON.stringify(cvData.personalInfo, null, 2)}
            
            EDUCACIÓN:
            ${JSON.stringify(cvData.education, null, 2)}
            
            EXPERIENCIA:
            ${JSON.stringify(cvData.workExperience, null, 2)}
            
            HABILIDADES:
            ${JSON.stringify(cvData.skills, null, 2)}
            
            PROYECTOS:
            ${JSON.stringify(cvData.projects || [], null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const analysis = completion.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error('No se pudo generar el análisis');
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      type: analysisType
    });

  } catch (error: any) {
    console.error('❌ Error en análisis de CV:', error);
    
    // Manejo específico de errores de OpenAI
    if (error?.error?.type === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'Límite de API alcanzado. Intenta más tarde.' },
        { status: 429 }
      );
    }

    if (error?.error?.type === 'invalid_request_error') {
      return NextResponse.json(
        { error: 'Datos del CV inválidos' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}