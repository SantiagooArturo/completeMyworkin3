import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedProfileData {
  personalInfo: {
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  professional: {
    position?: string;
    bio?: string;
    skills: string[];
  };
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    isCurrent: boolean;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }>;
  languages: Array<{
    language: string;
    level: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { cvFileUrl, fileName } = await request.json();

    if (!cvFileUrl) {
      return NextResponse.json(
        { error: 'cvFileUrl es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Iniciando extracción de datos del CV:', fileName);

    // Paso 1: Analizar CV con API externa para obtener texto crudo
    const cvAnalysisUrl = `https://myworkin-cv-2.onrender.com/analizar-cv?pdf_url=${encodeURIComponent(cvFileUrl)}&puesto_postular=general&original_name=${encodeURIComponent(fileName || 'cv.pdf')}`;
    
    const analysisResponse = await fetch(cvAnalysisUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!analysisResponse.ok) {
      throw new Error(`Error en análisis de CV: ${analysisResponse.statusText}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('📄 Análisis de CV obtenido exitosamente');

    // Extraer texto del CV de la respuesta
    const cvText = analysisData?.extractedData?.analysisResults?.pdf_text || 
                   analysisData?.extractedData?.text || 
                   analysisData?.text ||
                   JSON.stringify(analysisData);

    if (!cvText || cvText.length < 50) {
      throw new Error('No se pudo extraer texto suficiente del CV');
    }

    console.log('📝 Texto extraído del CV:', cvText.substring(0, 200) + '...');

    // Paso 2: Usar OpenAI para extraer datos estructurados
    const prompt = `Analiza este CV y extrae ÚNICAMENTE la información que está presente. NO inventes ni agregues datos que no estén explícitamente mencionados.

TEXTO DEL CV:
${cvText}

Extrae la información en el siguiente formato JSON EXACTO. Si algún campo no está presente en el CV, déjalo vacío o como array vacío:

{
  "personalInfo": {
    "phone": "número si está presente",
    "location": "ciudad/país si está presente", 
    "linkedin": "URL de LinkedIn si está presente",
    "portfolio": "URL de portfolio/sitio web si está presente"
  },
  "professional": {
    "position": "último puesto de trabajo o puesto actual",
    "bio": "resumen profesional en 2-3 líneas basado en la experiencia mencionada",
    "skills": ["habilidad1", "habilidad2", "habilidad3"]
  },
  "experience": [
    {
      "position": "cargo",
      "company": "nombre empresa",
      "startDate": "fecha inicio (MM/YYYY)",
      "endDate": "fecha fin (MM/YYYY) o 'Actualidad'",
      "description": "descripción de funciones",
      "isCurrent": true/false
    }
  ],
  "education": [
    {
      "degree": "carrera/grado",
      "institution": "universidad/instituto",
      "startDate": "fecha inicio (MM/YYYY)",
      "endDate": "fecha fin (MM/YYYY) o 'Actualidad'",
      "isCurrent": true/false
    }
  ],
  "languages": [
    {
      "language": "idioma",
      "level": "nivel (Básico/Intermedio/Avanzado/Nativo)"
    }
  ],
  "projects": [
    {
      "name": "nombre del proyecto",
      "description": "descripción breve",
      "technologies": ["tech1", "tech2"]
    }
  ]
}

IMPORTANTE: Responde ÚNICAMENTE con el JSON, sin texto adicional. Asegúrate de que el JSON sea válido.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en extracción de datos de CVs. Tu trabajo es extraer información estructurada de manera precisa y solo incluir datos que estén explícitamente presentes en el texto. Responde únicamente con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Baja temperatura para mayor precisión
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content?.trim();
    console.log('🤖 Respuesta de OpenAI:', responseText?.substring(0, 200) + '...');

    if (!responseText) {
      throw new Error('No se pudo generar la extracción de datos');
    }

    // Parsear JSON con manejo de errores robusto
    let extractedData: ExtractedProfileData;
    try {
      extractedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Intentar extraer JSON de la respuesta si viene con texto adicional
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Respuesta de IA no contiene JSON válido');
      }
    }

    // Validar y limpiar datos extraídos
    const cleanedData = validateAndCleanExtractedData(extractedData);

    console.log('✅ Datos extraídos y limpiados exitosamente');
    console.log('📊 Resumen:', {
      hasPersonalInfo: !!cleanedData.personalInfo.phone || !!cleanedData.personalInfo.location,
      skillsCount: cleanedData.professional.skills.length,
      experienceCount: cleanedData.experience.length,
      educationCount: cleanedData.education.length,
      languagesCount: cleanedData.languages.length,
      projectsCount: cleanedData.projects.length
    });

    return NextResponse.json({
      success: true,
      data: cleanedData,
      summary: {
        extractedFields: getExtractedFieldsSummary(cleanedData),
        confidence: 'high'
      }
    });

  } catch (error: any) {
    console.error('❌ Error en extracción de datos del CV:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Función para validar y limpiar datos extraídos
function validateAndCleanExtractedData(data: any): ExtractedProfileData {
  return {
    personalInfo: {
      phone: cleanString(data.personalInfo?.phone),
      location: cleanString(data.personalInfo?.location),
      linkedin: cleanUrl(data.personalInfo?.linkedin),
      portfolio: cleanUrl(data.personalInfo?.portfolio),
    },
    professional: {
      position: cleanString(data.professional?.position),
      bio: cleanString(data.professional?.bio),
      skills: cleanArray(data.professional?.skills || []),
    },
    experience: cleanArray(data.experience || []).map((exp: any) => ({
      position: cleanString(exp.position) || '',
      company: cleanString(exp.company) || '',
      startDate: cleanString(exp.startDate) || '',
      endDate: cleanString(exp.endDate) || '',
      description: cleanString(exp.description) || '',
      isCurrent: Boolean(exp.isCurrent),
    })),
    education: cleanArray(data.education || []).map((edu: any) => ({
      degree: cleanString(edu.degree) || '',
      institution: cleanString(edu.institution) || '',
      startDate: cleanString(edu.startDate) || '',
      endDate: cleanString(edu.endDate) || '',
      isCurrent: Boolean(edu.isCurrent),
    })),
    languages: cleanArray(data.languages || []).map((lang: any) => ({
      language: cleanString(lang.language) || '',
      level: cleanString(lang.level) || '',
    })),
    projects: cleanArray(data.projects || []).map((proj: any) => ({
      name: cleanString(proj.name) || '',
      description: cleanString(proj.description) || '',
      technologies: cleanArray(proj.technologies || []),
    })),
  };
}

// Funciones de utilidad para limpiar datos
function cleanString(value: any): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.trim();
}

function cleanUrl(value: any): string | undefined {
  const cleaned = cleanString(value);
  if (!cleaned) return undefined;
  // Validar que sea una URL válida
  try {
    new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    return cleaned;
  } catch {
    return undefined;
  }
}

function cleanArray(value: any): any[] {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && (typeof item === 'string' ? item.trim() : true));
}

// Función para generar resumen de campos extraídos
function getExtractedFieldsSummary(data: ExtractedProfileData): string[] {
  const fields: string[] = [];
  
  if (data.personalInfo.phone) fields.push('Teléfono');
  if (data.personalInfo.location) fields.push('Ubicación');
  if (data.personalInfo.linkedin) fields.push('LinkedIn');
  if (data.personalInfo.portfolio) fields.push('Portfolio');
  if (data.professional.position) fields.push('Posición actual');
  if (data.professional.bio) fields.push('Biografía profesional');
  if (data.professional.skills.length > 0) fields.push(`${data.professional.skills.length} habilidades`);
  if (data.experience.length > 0) fields.push(`${data.experience.length} experiencias laborales`);
  if (data.education.length > 0) fields.push(`${data.education.length} estudios`);
  if (data.languages.length > 0) fields.push(`${data.languages.length} idiomas`);
  if (data.projects.length > 0) fields.push(`${data.projects.length} proyectos`);
  
  return fields;
} 