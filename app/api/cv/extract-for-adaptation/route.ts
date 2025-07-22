import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CVDataForAdaptation {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedIn: string;
    summary: string;
  };
  workExperience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
    location?: string;
    technologies?: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: string;
    achievements?: string[];
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: string;
    category: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    startDate?: string;
    endDate?: string;
    technologies: string[];
    achievements: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    expirationDate?: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    proficiency: string;
  }>;
}

/**
 * API exclusiva para extraer datos de CV vinculado para adaptación
 * Esta API está optimizada para el flujo de adaptación de CVs
 */
export async function POST(request: NextRequest) {
  try {
    const { cvFileUrl, fileName, userId } = await request.json();

    if (!cvFileUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'URL del CV es requerida' 
        },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID del usuario es requerido' 
        },
        { status: 400 }
      );
    }

    console.log('🔍 [Adaptación] Iniciando extracción de CV vinculado:', fileName);
    console.log('👤 Usuario:', userId);
    console.log('🔗 URL CV:', cvFileUrl.substring(0, 50) + '...');

    // Paso 1: Analizar CV con API externa para obtener texto crudo
    const cvAnalysisUrl = `https://myworkin-cv-2.onrender.com/analizar-cv?pdf_url=${encodeURIComponent(cvFileUrl)}&puesto_postular=adaptacion&original_name=${encodeURIComponent(fileName || 'cv.pdf')}`;
    
    console.log('🌐 [Adaptación] Llamando API externa con timeout de 60 segundos...');
    
    const analysisResponse = await fetch(cvAnalysisUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Timeout optimizado para adaptación: 60 segundos
      signal: AbortSignal.timeout(60000) // 60 segundos
    });

    if (!analysisResponse.ok) {
      throw new Error(`Error al analizar CV: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('📄 [Adaptación] Análisis de CV obtenido exitosamente');

    // Extraer texto del CV de la respuesta
    const cvText = analysisData?.extractedData?.analysisResults?.pdf_text || 
                   analysisData?.extractedData?.text || 
                   analysisData?.text ||
                   JSON.stringify(analysisData);

    if (!cvText || cvText.length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo extraer texto válido del CV' 
        },
        { status: 400 }
      );
    }

    console.log('📝 [Adaptación] Texto extraído del CV:', cvText.substring(0, 200) + '...');

    // Truncar el texto del CV si es muy largo (máximo 3000 caracteres para evitar exceder tokens)
    const maxCVTextLength = 3000;
    const truncatedCVText = cvText.length > maxCVTextLength 
      ? cvText.substring(0, maxCVTextLength) + '...[texto truncado]'
      : cvText;

    console.log('📏 [Adaptación] Longitud del texto CV:', cvText.length, '-> truncado a:', truncatedCVText.length);

    // Paso 2: Usar OpenAI para extraer datos estructurados específicamente para adaptación
    const adaptationPrompt = `Extrae los datos del CV en formato JSON. Información disponible:

${truncatedCVText}

Formato requerido (JSON válido):
{
  "personalInfo": {
    "fullName": "", "email": "", "phone": "", "address": "", "linkedIn": "", "summary": ""
  },
  "workExperience": [
    {"id": "exp_1", "company": "", "position": "", "startDate": "", "endDate": "", "current": false, "description": "", "achievements": [], "location": "", "technologies": []}
  ],
  "education": [
    {"id": "edu_1", "institution": "", "degree": "", "startDate": "", "endDate": "", "current": false, "gpa": "", "achievements": []}
  ],
  "skills": [
    {"id": "skill_1", "name": "", "level": "Intermedio", "category": "Technical"}
  ],
  "projects": [
    {"id": "proj_1", "name": "", "description": "", "startDate": "", "endDate": "", "technologies": [], "achievements": []}
  ],
  "certifications": [
    {"id": "cert_1", "name": "", "issuer": "", "date": "", "expirationDate": ""}
  ],
  "languages": [
    {"id": "lang_1", "language": "", "proficiency": "Intermedio"}
  ]
}

Responde SOLO con JSON válido:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más eficiente con mayor límite de contexto
      messages: [
        {
          role: "system",
          content: "Extrae datos estructurados de CVs en formato JSON válido. Responde solo con JSON."
        },
        {
          role: "user",
          content: adaptationPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000, // Reducido para evitar exceder límites
    });

    const responseText = completion.choices[0].message.content?.trim();
    console.log('🤖 [Adaptación] Respuesta de OpenAI:', responseText?.substring(0, 200) + '...');

    if (!responseText) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Parsear JSON con manejo de errores robusto
    let extractedData: CVDataForAdaptation;
    try {
      extractedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error parseando JSON de OpenAI:', parseError);
      console.error('📄 Respuesta problemática:', responseText);
      
      // Intentar limpiar la respuesta
      const cleanedResponse = responseText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
      
      try {
        extractedData = JSON.parse(cleanedResponse);
      } catch (secondParseError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Error al procesar la respuesta de IA',
            details: 'Formato de respuesta inválido'
          },
          { status: 500 }
        );
      }
    }

    // Validar y limpiar datos extraídos para adaptación
    const cleanedData = validateAndCleanCVDataForAdaptation(extractedData);

    // Generar resumen de campos extraídos
    const extractedFieldsSummary = getExtractedFieldsSummaryForAdaptation(cleanedData);

    console.log('✅ [Adaptación] Datos extraídos y limpiados exitosamente');
    console.log('📊 Campos extraídos:', extractedFieldsSummary);

    return NextResponse.json({
      success: true,
      data: cleanedData,
      metadata: {
        userId,
        fileName,
        extractedAt: new Date().toISOString(),
        fieldsExtracted: extractedFieldsSummary,
        totalFields: extractedFieldsSummary.length
      }
    });

  } catch (error: any) {
    console.error('❌ [Adaptación] Error en extracción de CV:', error);
    
    // Manejo específico de diferentes tipos de error
    let errorMessage = 'Error interno al extraer datos del CV';
    let errorDetails = error.message;
    
    if (error.name === 'TimeoutError' || error.message?.includes('timeout') || error.message?.includes('aborted due to timeout')) {
      errorMessage = 'El análisis del CV está tardando más de lo esperado';
      errorDetails = 'El servicio externo está experimentando demoras. Esto puede deberse a un CV complejo o alta demanda del servicio. Por favor, inténtalo de nuevo en unos momentos.';
    } else if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      errorMessage = 'El análisis del CV se interrumpió';
      errorDetails = 'La conexión se perdió durante el procesamiento. Por favor, verifica tu conexión e inténtalo de nuevo.';
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Error de conexión con el servicio de análisis';
      errorDetails = 'No se pudo conectar con el servicio de análisis de CV. Verifica tu conexión e inténtalo de nuevo.';
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'Error al procesar los datos del CV';
      errorDetails = 'Los datos extraídos del CV no tienen el formato esperado.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Función para validar y limpiar datos extraídos específicamente para adaptación
function validateAndCleanCVDataForAdaptation(data: any): CVDataForAdaptation {
  const generateId = (prefix: string, index: number) => `${prefix}_${Date.now()}_${index}`;

  return {
    personalInfo: {
      fullName: cleanString(data.personalInfo?.fullName) || '',
      email: cleanString(data.personalInfo?.email) || '',
      phone: cleanString(data.personalInfo?.phone) || '',
      address: cleanString(data.personalInfo?.address) || '',
      linkedIn: cleanUrl(data.personalInfo?.linkedIn) || '',
      summary: cleanString(data.personalInfo?.summary) || '',
    },
    workExperience: cleanArray(data.workExperience || []).map((exp: any, index: number) => ({
      id: exp.id || generateId('exp', index),
      company: cleanString(exp.company) || '',
      position: cleanString(exp.position) || '',
      startDate: cleanString(exp.startDate) || '',
      endDate: cleanString(exp.endDate) || '',
      current: Boolean(exp.current),
      description: cleanString(exp.description) || '',
      achievements: cleanArray(exp.achievements || []),
      location: cleanString(exp.location) || undefined,
      technologies: cleanArray(exp.technologies || []),
    })),
    education: cleanArray(data.education || []).map((edu: any, index: number) => ({
      id: edu.id || generateId('edu', index),
      institution: cleanString(edu.institution) || '',
      degree: cleanString(edu.degree) || '',
      startDate: cleanString(edu.startDate) || '',
      endDate: cleanString(edu.endDate) || '',
      current: Boolean(edu.current),
      gpa: cleanString(edu.gpa) || undefined,
      achievements: cleanArray(edu.achievements || []),
    })),
    skills: cleanArray(data.skills || []).map((skill: any, index: number) => ({
      id: skill.id || generateId('skill', index),
      name: cleanString(skill.name) || '',
      level: cleanString(skill.level) || 'Intermedio',
      category: cleanString(skill.category) || 'Technical',
    })),
    projects: cleanArray(data.projects || []).map((proj: any, index: number) => ({
      id: proj.id || generateId('proj', index),
      name: cleanString(proj.name) || '',
      description: cleanString(proj.description) || '',
      startDate: cleanString(proj.startDate) || undefined,
      endDate: cleanString(proj.endDate) || undefined,
      technologies: cleanArray(proj.technologies || []),
      achievements: cleanArray(proj.achievements || []),
    })),
    certifications: cleanArray(data.certifications || []).map((cert: any, index: number) => ({
      id: cert.id || generateId('cert', index),
      name: cleanString(cert.name) || '',
      issuer: cleanString(cert.issuer) || '',
      date: cleanString(cert.date) || '',
      expirationDate: cleanString(cert.expirationDate) || undefined,
    })),
    languages: cleanArray(data.languages || []).map((lang: any, index: number) => ({
      id: lang.id || generateId('lang', index),
      language: cleanString(lang.language) || '',
      proficiency: cleanString(lang.proficiency) || 'Intermedio',
    })),
  };
}

// Funciones de utilidad para limpiar datos (adaptadas para el contexto de adaptación)
function cleanString(value: any): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.trim();
}

function cleanUrl(value: any): string | undefined {
  const cleaned = cleanString(value);
  if (!cleaned) return undefined;
  
  // Validar que sea una URL válida
  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    // Si no es una URL completa, intentar agregar protocolo
    if (cleaned.includes('linkedin.com') && !cleaned.startsWith('http')) {
      return `https://${cleaned}`;
    }
    return undefined;
  }
}

function cleanArray(value: any): any[] {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && (typeof item === 'string' ? item.trim() : true));
}

// Función para generar resumen de campos extraídos para adaptación
function getExtractedFieldsSummaryForAdaptation(data: CVDataForAdaptation): string[] {
  const fields: string[] = [];
  
  // Información personal
  if (data.personalInfo.fullName) fields.push('Nombre completo');
  if (data.personalInfo.email) fields.push('Email');
  if (data.personalInfo.phone) fields.push('Teléfono');
  if (data.personalInfo.address) fields.push('Dirección');
  if (data.personalInfo.linkedIn) fields.push('LinkedIn');
  if (data.personalInfo.summary) fields.push('Resumen profesional');
  
  // Secciones principales
  if (data.workExperience.length > 0) fields.push(`${data.workExperience.length} experiencia(s) laboral(es)`);
  if (data.education.length > 0) fields.push(`${data.education.length} formación(es) académica(s)`);
  if (data.skills.length > 0) fields.push(`${data.skills.length} habilidad(es)`);
  if (data.projects.length > 0) fields.push(`${data.projects.length} proyecto(s)`);
  if (data.certifications.length > 0) fields.push(`${data.certifications.length} certificación(es)`);
  if (data.languages.length > 0) fields.push(`${data.languages.length} idioma(s)`);
  
  return fields;
}
