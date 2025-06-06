import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Datos recibidos:', JSON.stringify(body, null, 2));
    
    // Solo extraer lo que necesitamos
    const { summary, generateFromScratch = false } = body;
    
    console.log('🎯 Datos procesados:', { summary, generateFromScratch });
    
    if (!summary) {
      return NextResponse.json(
        { error: 'Se requiere el resumen profesional actual' },
        { status: 400 }
      );
    }

    // Análisis del contenido para determinar el tipo de perfil
    const isStudent = summary.toLowerCase().includes('estudiante') || 
                     summary.toLowerCase().includes('cursando') ||
                     summary.toLowerCase().includes('ciclo') ||
                     summary.toLowerCase().includes('universidad') ||
                     summary.toLowerCase().includes('carrera');

    const hasProfessionalExperience = summary.toLowerCase().includes('años de experiencia') ||
                                    summary.toLowerCase().includes('experiencia profesional') ||
                                    summary.toLowerCase().includes('trabajado en') ||
                                    summary.toLowerCase().includes('especialista en');

    // Determinar estructura inicial basada en el contenido
    let structureTemplate = '';
    
    if (isStudent && !hasProfessionalExperience) {
      // Estructura para estudiantes
      structureTemplate = `Estudiante de [ciclo] de [carrera] en [institución]. En esta sección, tienes la oportunidad de describir tu identidad profesional de una manera integral. Combina elementos personales, como tu mentalidad y trayectoria, con tus intereses profesionales para ofrecer una visión completa de quién eres y qué persigues en tu carrera. Puedes destacar tus fortalezas, experiencias relevantes y áreas de interés específicas para transmitir una imagen clara y auténtica de ti mismo/a.`;
    } else if (hasProfessionalExperience) {
      // Estructura para profesionales con experiencia
      structureTemplate = `Profesional con [X años] de experiencia en [área/industria]. Especialista en [habilidades clave] con un historial comprobado de [logros principales]. Mi trayectoria profesional se caracteriza por [fortalezas distintivas] y una pasión por [áreas de interés profesional]. Busco oportunidades para [objetivos profesionales] y contribuir al crecimiento de organizaciones innovadoras.`;
    } else {
      // Estructura híbrida para recién graduados o con poca experiencia
      structureTemplate = `Recién graduado/Profesional junior en [área] con conocimientos sólidos en [habilidades técnicas]. A través de mi formación académica y experiencias prácticas, he desarrollado competencias en [áreas específicas]. Mi enfoque profesional se centra en [intereses y objetivos] y estoy comprometido con el aprendizaje continuo y la excelencia en [campo de especialización].`;
    }

    const basePrompt = `Analiza el siguiente resumen profesional y determina el perfil del candidato. Luego, reescribe el resumen siguiendo la estructura apropiada y manteniendo la información relevante del original.

RESUMEN ACTUAL:
${summary}

ESTRUCTURA SUGERIDA:
${structureTemplate}

INSTRUCCIONES ESPECÍFICAS:
- ${generateFromScratch ? 'Crea un resumen completamente nuevo basado en la estructura sugerida' : 'Mejora el resumen existente adaptándolo a la estructura apropiada'}
- Mantén un tono profesional pero auténtico
- Máximo 4-5 líneas impactantes
- Incluye palabras clave técnicas relevantes del resumen original
- Respeta la información factual del resumen original (institución, carrera, experiencia)
- Adapta la estructura según el perfil detectado (estudiante/profesional/junior)
- Si es estudiante: enfócate en formación, proyectos académicos y potencial
- Si es profesional: destaca experiencia, logros cuantificables y expertise
- Si es junior/recién graduado: combina formación con experiencia inicial

IMPORTANTE: Devuelve SOLO el resumen mejorado, sin explicaciones adicionales.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en redacción de CV especializado en crear resúmenes profesionales que destaquen el potencial único de cada candidato. Tienes experiencia trabajando con estudiantes, profesionales junior y profesionales experimentados. Tu objetivo es crear resúmenes que sigan estructuras profesionales apropiadas para cada tipo de perfil."
        },
        {
          role: "user",
          content: basePrompt
        }
      ],
      temperature: 0.7, // Menos creatividad para mantener estructura
      max_tokens: 400,
    });

    const enhancedSummary = completion.choices[0].message.content?.trim();

    if (!enhancedSummary) {
      throw new Error('No se pudo generar el resumen mejorado');
    }

    return NextResponse.json({
      success: true,
      summary: enhancedSummary,
      metadata: {
        originalLength: summary.length,
        enhancedLength: enhancedSummary.length,
        profileType: isStudent ? 'student' : hasProfessionalExperience ? 'professional' : 'junior',
        structureUsed: structureTemplate.substring(0, 50) + '...',
        model: "gpt-4",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error en enhance-summary:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}