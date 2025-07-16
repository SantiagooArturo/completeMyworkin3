import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { currentSkills, format, role, cvContext } = await request.json();

    // Construir contexto del CV si está disponible
    let contextualInfo = '';
    if (cvContext) {
      const { personalInfo, education, workExperience, projects, certifications } = cvContext;
      
      contextualInfo = `
CONTEXTO DEL CV:

Perfil profesional: ${personalInfo?.summary || 'No especificado'}

Educación: ${education?.map((edu: any) => 
  `${edu.degree} en ${edu.fieldOfStudy || edu.institution}`
).join(', ') || 'No especificada'}

Experiencia laboral: ${workExperience?.map((exp: any) => 
  `${exp.position} en ${exp.company} - ${exp.description || 'Sin descripción'}`
).join('; ') || 'No especificada'}

Proyectos: ${projects?.map((proj: any) => 
  `${proj.name} - ${proj.description || ''} - Tecnologías: ${proj.technologies?.join(', ') || ''}`
).join('; ') || 'Ninguno'}

Certificaciones: ${certifications?.map((cert: any) => 
  `${cert.name} (${cert.issuer})`
).join(', ') || 'Ninguna'}
`;
    }

    // Intentar usar OpenAI primero
    if (process.env.OPENAI_API_KEY) {
      try {
        const skillsText = currentSkills && currentSkills.length > 0 
          ? currentSkills.join(', ') 
          : 'Microsoft Office (Excel Intermedio, PowerPoint Avanzado, Word Avanzado), SQL Principiante, Microsoft Project, Trello, Notion';

        const prompt = `
Eres un experto en recursos humanos especializado en CVs profesionales formato ${format || 'Harvard'}.

${contextualInfo}

Habilidades actuales: ${skillsText}
Rol objetivo: ${role || 'Profesional de Administración/Gestión'}

INSTRUCCIONES ESPECÍFICAS:
Analiza el CONTEXTO COMPLETO del CV y sugiere habilidades organizadas en las 3 categorías principales del formato Harvard:

1. SOFTWARE (habilidades técnicas específicas)
2. GESTIÓN DE PROYECTOS (metodologías y herramientas de gestión)
3. IDIOMAS (si aplica según el contexto)

REQUISITOS:
- Sugiere 2-3 habilidades por categoría que complementen las existentes
- Prioriza habilidades que se alineen con la trayectoria profesional mostrada
- Incluye herramientas específicas relevantes para el sector identificado
- Considera tecnologías mencionadas en proyectos para sugerir complementarias
- Evita repetir habilidades que ya posee
- Sé específico con niveles cuando sea apropiado (ej: "Power BI (Intermedio)")

FORMATO DE RESPUESTA:
SOFTWARE:
- [Habilidad 1]
- [Habilidad 2] 
- [Habilidad 3]

GESTIÓN DE PROYECTOS:
- [Habilidad 1]
- [Habilidad 2]
- [Habilidad 3]

IDIOMAS:
- [Idioma 1] - [Nivel]
- [Idioma 2] - [Nivel]

IMPORTANTE: Si el contexto no amerita sugerencias de idiomas, omite esa sección.

Ejemplos de habilidades específicas por categoría:
SOFTWARE: Power BI, Tableau, Python (Análisis de Datos), SAP, Google Analytics, VBA Avanzado
GESTIÓN DE PROYECTOS: Metodologías Ágiles (Scrum), Lean Six Sigma, Project Management (PMP), Risk Management
IDIOMAS: Inglés - Intermedio, Francés - Básico
`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Eres un consultor experto en desarrollo profesional especializado en formato Harvard. Analiza el contexto completo del CV para hacer sugerencias organizadas y específicas por categorías."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.6,
        });

        const aiSuggestions = completion.choices[0]?.message?.content?.trim();
        
        if (aiSuggestions) {
          return NextResponse.json({ 
            success: true, 
            suggestions: aiSuggestions,
            source: 'ai_contextual_categorized'
          });
        }
      } catch (aiError) {
        console.error('Error con OpenAI, usando fallback:', aiError);
      }
    }

    // Fallback mejorado organizado por categorías
    return generateCategorizedFallbackSuggestions(currentSkills, cvContext, role);

  } catch (error) {
    console.error('Error en suggest-skills:', error);
    
    // Fallback de emergencia organizado
    const emergencySkills = `
SOFTWARE:
- Power BI
- Tableau
- Google Analytics

GESTIÓN DE PROYECTOS:
- Metodologías Ágiles (Scrum)
- Lean Six Sigma
- Risk Management

IDIOMAS:
- Inglés - Intermedio
`;
    
    return NextResponse.json({ 
      success: true, 
      suggestions: emergencySkills,
      source: 'emergency_categorized'
    });
  }
}

// Función para generar sugerencias categorizadas inteligentes
function generateCategorizedFallbackSuggestions(currentSkills: string[], cvContext: any, role: string) {
  const skillSets = {
    software: {
      administration: ['Power BI', 'Tableau', 'SAP', 'Google Analytics', 'VBA Avanzado', 'Oracle Database'],
      finance: ['Financial Modeling', 'Bloomberg Terminal', 'R (Estadística)', 'Python (Análisis Financiero)', 'QuickBooks', 'Power BI'],
      marketing: ['Google Analytics', 'Adobe Creative Suite', 'HubSpot', 'Mailchimp', 'Canva Pro', 'SEMrush'],
      technology: ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
      general: ['Power BI', 'Tableau', 'Google Analytics', 'Python (Análisis de Datos)', 'SAP', 'VBA Avanzado']
    },
    projectManagement: {
      administration: ['Metodologías Ágiles (Scrum)', 'Lean Six Sigma', 'Change Management', 'Risk Management', 'PRINCE2', 'Process Optimization'],
      finance: ['Financial Planning', 'Budget Management', 'Risk Assessment', 'Compliance Management', 'Audit Management', 'KPI Development'],
      marketing: ['Campaign Management', 'A/B Testing', 'Marketing Automation', 'Customer Journey Mapping', 'ROI Analysis', 'Growth Hacking'],
      technology: ['DevOps', 'CI/CD', 'Agile Development', 'Technical Documentation', 'Quality Assurance', 'Software Architecture'],
      general: ['Metodologías Ágiles (Scrum)', 'Project Management (PMP)', 'Lean Six Sigma', 'Change Management', 'Risk Management', 'Team Leadership']
    },
    languages: [
      'Inglés - Intermedio',
      'Inglés - Avanzado', 
      'Francés - Básico',
      'Portugués - Intermedio',
      'Alemán - Básico'
    ]
  };

  const currentSkillsLower = currentSkills.map(skill => skill.toLowerCase());

  // Determinar sector basado en contexto
  let sector = 'general';
  if (cvContext) {
    const { workExperience, education, projects } = cvContext;
    const contextText = [
      workExperience?.map((exp: any) => `${exp.position} ${exp.company} ${exp.description}`).join(' '),
      education?.map((edu: any) => `${edu.degree} ${edu.fieldOfStudy}`).join(' '),
      projects?.map((proj: any) => `${proj.name} ${proj.description}`).join(' ')
    ].join(' ').toLowerCase();

    if (contextText.includes('administr') || contextText.includes('gestion')) {
      sector = 'administration';
    } else if (contextText.includes('financ') || contextText.includes('contab')) {
      sector = 'finance';
    } else if (contextText.includes('marketing') || contextText.includes('digital')) {
      sector = 'marketing';
    } else if (contextText.includes('program') || contextText.includes('desarrollo')) {
      sector = 'technology';
    }
  }

  // Filtrar habilidades que ya tiene
  const filterExistingSkills = (skills: string[]) => {
    return skills.filter(skill => 
      !currentSkillsLower.some(existing => 
        existing.includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(existing.split('(')[0].trim().toLowerCase())
      )
    );
  };

  const softwareSkills = filterExistingSkills(skillSets.software[sector as keyof typeof skillSets.software] || skillSets.software.general).slice(0, 3);
  const projectSkills = filterExistingSkills(skillSets.projectManagement[sector as keyof typeof skillSets.projectManagement] || skillSets.projectManagement.general).slice(0, 3);
  const languageSkills = skillSets.languages.slice(0, 2);

  const categorizedSuggestions = `
SOFTWARE:
${softwareSkills.map(skill => `- ${skill}`).join('\n')}

GESTIÓN DE PROYECTOS:
${projectSkills.map(skill => `- ${skill}`).join('\n')}

IDIOMAS:
${languageSkills.map(lang => `- ${lang}`).join('\n')}
`;

  return NextResponse.json({ 
    success: true, 
    suggestions: categorizedSuggestions.trim(),
    source: 'smart_categorized_fallback'
  });
}