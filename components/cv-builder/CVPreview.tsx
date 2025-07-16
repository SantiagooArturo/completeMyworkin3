'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CVData } from '@/types/cv';
import { Card, CardContent,  } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface CVPreviewProps {
  cvData: CVData;
  onPageCalculated?: (pageInfo: { totalPages: number; currentPageHeight: number }) => void;
}

// Función para obtener sugerencias de optimización (exportada para uso externo)
export const getOptimizationSuggestions = (cvData: CVData) => {
  const suggestions = [];
  
  // Verificar longitud del resumen
  if (cvData.personalInfo.summary && cvData.personalInfo.summary.length > 150) {
    suggestions.push("Reducir el resumen a máximo 2-3 líneas");
  }

  // Verificar número de experiencias
  if (cvData.workExperience.length > 3) {
    suggestions.push("Mostrar solo las 2-3 experiencias más relevantes");
  }

  // Verificar logros por experiencia
  cvData.workExperience.forEach((exp, index) => {
    if (exp.achievements && exp.achievements.length > 4) {
      suggestions.push(`Reducir logros en ${exp.company} a máximo 3-4 puntos`);
    }
  });

  // Verificar número de proyectos
  if (cvData.projects.length > 3) {
    suggestions.push("Limitar a los 2-3 proyectos más destacados");
  }

  // Verificar habilidades
  if (cvData.skills.length > 12) {
    suggestions.push("Reducir habilidades a las más relevantes (máximo 10-12)");
  }

  // Verificar certificaciones
  if (cvData.certifications.length > 4) {
    suggestions.push("Mostrar solo las certificaciones más relevantes");
  }

  return suggestions;
};

export default function CVPreview({ cvData, onPageCalculated }: CVPreviewProps) {
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, currentPageHeight: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  // Configuración de página A4 en píxeles (coincidiendo exactamente con jsPDF)
  // jsPDF usa 210 x 297 mm a 72 DPI = 595.28 x 841.89 puntos
  // Convertimos a píxeles para vista previa: 1 punto = 1.33 píxeles aproximadamente
  const A4_HEIGHT_PX = 1356; // Altura A4 ajustada para coincidir con PDF (841.89 * 1.61)
  const PAGE_MARGIN = 84; // Márgenes ajustados proporcionalmente (15 + 25) * 2.1
  const USABLE_HEIGHT = A4_HEIGHT_PX - (PAGE_MARGIN * 2);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Si el formato es YYYY-MM o YYYY-MM-DD, mostrar solo mes/año
      if (/^\d{4}-\d{2}/.test(dateString)) {
        const [year, month] = dateString.split('-');
        return `${month}/${year}`;
      }
      // Si el formato es solo YYYY
      if (/^\d{4}$/.test(dateString)) {
        return dateString;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };  const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
    const start = formatDate(startDate);
    
    if (current === true) {
      return `${start} - Actualidad`;
    } else {
      const end = formatDate(endDate);
      return `${start} - ${end}`;
    }
  };

  const renderSkillLevel = (level: string) => {
    const stars = level === 'Básico' ? 1 : level === 'Intermedio' ? 2 : level === 'Avanzado' ? 3 : 4;
    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };
  const getSkillsByCategory = (category: string) => {
    return cvData.skills.filter(skill => skill.category === category);
  };  // Función para organizar habilidades por categorías específicas del formato Harvard
  const getSkillsForHarvardFormat = () => {
    const softwareSkills = cvData.skills.filter(skill => 
      skill.category === 'Technical'
    );
    const projectManagementSkills = cvData.skills.filter(skill => 
      skill.category === 'Leadership' || skill.category === 'Analytical'
    );
    const languageSkills = cvData.skills.filter(skill => 
      skill.category === 'Language'
    );
    const otherSkills = cvData.skills.filter(skill => 
      skill.category === 'Research' || skill.category === 'Communication'
    );

    return {
      software: softwareSkills,
      projectManagement: projectManagementSkills,
      languages: languageSkills,
      other: otherSkills
    };
  };

  // Función para calcular el número de páginas basado en el contenido
  const calculatePages = () => {
    if (!contentRef.current) return;
    
    const contentHeight = contentRef.current.scrollHeight;
    const totalPages = Math.ceil(contentHeight / USABLE_HEIGHT);
    
    const newPageInfo = {
      totalPages: Math.max(1, totalPages),
      currentPageHeight: contentHeight
    };
    
    setPageInfo(newPageInfo);
    
    // Notificar al componente padre sobre el cálculo de páginas
    if (onPageCalculated) {
      onPageCalculated(newPageInfo);
    }
  };

  // Monitorear cambios en el contenido del CV
  useEffect(() => {
    const timer = setTimeout(() => {
      calculatePages();
    }, 100); // Pequeño delay para que el DOM se actualice

    return () => clearTimeout(timer);
  }, [cvData]);

  // Recalcular al redimensionar la ventana
  useEffect(() => {
    const handleResize = () => {
      setTimeout(calculatePages, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcular inicialmente
  useEffect(() => {
    setTimeout(calculatePages, 200);
  }, []);

  // Función helper para estilos que coinciden exactamente con el PDF
  const getPDFMatchingStyles = (type: 'title' | 'body' | 'header') => {
    const baseStyle = {
      fontFamily: 'Times, "Times New Roman", serif'
    };

    switch (type) {
      case 'header':
        return {
          ...baseStyle,
          fontSize: '24px', // 18pt del PDF * 1.33
          lineHeight: '1.2'
        };
      case 'title':
        return {
          ...baseStyle,
          fontSize: '14.6px', // 11pt del PDF * 1.33
          lineHeight: '1.3',
          fontWeight: 'bold'
        };
      case 'body':
        return {
          ...baseStyle,
          fontSize: '14.6px', // 11pt del PDF * 1.33
          lineHeight: '1.4'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="space-y-4">      
      <Card className="relative mx-auto bg-white shadow-lg border border-gray-300" style={{
        width: '793px', // A4 width en px (595.28pt * 1.333)
        minHeight: `${A4_HEIGHT_PX}px`,
        maxWidth: '100%',
        fontFamily: 'Times, Times New Roman, serif',
        fontSize: '14.67px', // 11pt en px
        lineHeight: 1.15,
        boxSizing: 'border-box',
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}>
      <CardContent
        ref={contentRef}
        className="p-0"
        style={{
          margin: `${PAGE_MARGIN}px`,
          minHeight: `${USABLE_HEIGHT}px`,
          maxHeight: 'none',
          background: 'transparent',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
        }}
      >
        {/* Header - Información Personal - Formato Harvard */}
        <header className="text-center border-b border-gray-300 pb-4">
          <h1 
            className="font-bold text-black mb-3 tracking-normal"
            style={getPDFMatchingStyles('header')}
          >
            {cvData.personalInfo.fullName || 'Tu Nombre Completo'}
          </h1>
          
          {/* Contacto en una sola línea */}
          <div 
            className="text-black font-serif text-sm mb-2"
            style={getPDFMatchingStyles('body')}
          >
            {[
              cvData.personalInfo.email,
              cvData.personalInfo.phone,
              cvData.personalInfo.address,
              cvData.personalInfo.linkedIn,
              cvData.personalInfo.website
            ].filter(Boolean).join(' • ')}
          </div>
        </header>

        {/* Resumen (sin título) */}
        {cvData.personalInfo.summary && (
          <section 
            className="text-black text-justify"
          >
            {cvData.personalInfo.summary}
          </section>
        )}

        {/* Experiencia Laboral y Proyectos - Sección combinada */}
        {(cvData.workExperience.length > 0 || cvData.projects.length > 0) && (
          <section>
            <h2 
              className="text-center text-black my-4"
              style={{
                ...getPDFMatchingStyles('title'),
                textAlign: 'center'
              }}
            >
              Experiencia
            </h2>
            
            {/* Experiencia Laboral */}
            {cvData.workExperience.length > 0 && (
              <div className="mb-6">
                <div className="space-y-4">
                  {cvData.workExperience.map((exp, index) => (
                    <div key={exp.id}>
                      {/* Empresa */}
                      <h4 className="font-bold text-black font-serif">{exp.company}</h4>
                      {/* Descripción de la empresa */}
                      {exp.description && (
                        <p className="text-black italic font-serif mb-1">{exp.description}</p>
                      )}                        {/* Puesto y fechas en la misma línea */}
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-black font-serif">{exp.position}</span>
                        <span className="text-black font-serif">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</span>
                      </div>
                      {/* Sub-secciones (si existen) */}
                      {exp.sections && exp.sections.length > 0 ? (
                        <div className="space-y-3">
                          {exp.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                              <h5 className="font-semibold text-black font-serif mb-1">{section.title}</h5>
                              {section.achievements && section.achievements.length > 0 && (
                                <ul className="list-disc list-inside text-black space-y-1 font-serif ml-4">
                                  {section.achievements.map((achievement, achIndex) => (
                                    <li key={achIndex}>{achievement}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        exp.achievements && exp.achievements.length > 0 && (
                          <ul className="list-disc list-inside text-black space-y-1 font-serif">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex}>{achievement}</li>
                            ))}
                          </ul>
                        )
                      )}
                      {/* Tecnologías */}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="mt-2">
                          <span className="text-black font-medium font-serif">Tecnologías: </span>
                          <span className="text-black font-serif">{exp.technologies.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proyectos */}
            {cvData.projects.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-black mb-3 font-serif">Proyectos Destacados</h3>
                <div className="space-y-3">
                  {cvData.projects.map((project, index) => (
                    <div key={project.id}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-bold text-black font-serif">{project.name}</h4>
                        </div>                          
                        <div className="text-right text-black">
                          <p className="font-medium font-serif">
                            {formatDateRange(project.startDate, project.endDate, project.current)}
                          </p>
                          {project.url && (
                            <a href={project.url} className="text-blue-600 text-sm hover:underline font-serif">
                              Ver proyecto
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="text-black mb-2 font-serif">{project.description}</p>
                      )}
                      
                      {project.highlights && project.highlights.length > 0 && (
                        <ul className="list-disc list-inside text-black space-y-1 mb-2 font-serif">
                          {project.highlights.map((highlight, hlIndex) => (
                            <li key={hlIndex}>{highlight}</li>
                          ))}
                        </ul>                        )}
                        
                        {project.technologies && project.technologies.length > 0 && (
                          <div>
                            <span className="text-black font-medium font-serif">Tecnologías: </span>
                            <span className="text-black font-serif">{project.technologies}</span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}          {/* Educación */}
        {cvData.education.length > 0 && (
          <section>
            <h2 
              className="text-center text-black pb-2 mb-4"
              style={{
                ...getPDFMatchingStyles('title'),
                textAlign: 'center'
              }}
            >
              Educación
            </h2>
            <div className="space-y-4">
              {cvData.education.map((edu, index) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black font-serif">
                      {edu.institution}
                      {edu.fieldOfStudy && (
                        <span className="font-normal text-black font-serif"> — {edu.fieldOfStudy}</span>
                      )}
                    </span>                      <span className="font-normal text-black font-serif">
                      {edu.startDate ? formatDateRange(edu.startDate, edu.endDate, edu.current) : ''}
                    </span>
                  </div>
                  {edu.achievements && edu.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-black mt-1 space-y-1 font-serif">
                      {edu.achievements.map((achievement, achIndex) => (
                        <li key={achIndex}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}          {/* Habilidades y Certificaciones - Sección reorganizada */}
        {(cvData.skills.length > 0 || cvData.certifications.length > 0 || (cvData as any).hobbies?.length > 0) && (
          <section>
            <h2 
              className="text-center text-black pb-2 mb-4"
              style={{
                ...getPDFMatchingStyles('title'),
                textAlign: 'center'
              }}
            >
              Habilidades & Certificaciones
            </h2>
            {(() => {
              const skillsOrganized = getSkillsForHarvardFormat();
              return (
                <div className="space-y-2">
                  {/* Software */}
                  {skillsOrganized.software.length > 0 && (
                    <p 
                      className="text-black leading-relaxed"
                      style={getPDFMatchingStyles('body')}
                    >
                      <span className="font-semibold">Software:</span> {skillsOrganized.software.map(skill =>
                        `${skill.name}${skill.level !== 'Proficiente' ? ` (${skill.level})` : ''}`
                      ).join(', ')}
                    </p>
                  )}
                  {/* Gestión de proyectos */}
                  {skillsOrganized.projectManagement.length > 0 && (
                    <p className="text-black font-serif leading-relaxed">
                      <span className="font-semibold">Gestión de Proyectos:</span> {skillsOrganized.projectManagement.map(skill =>
                        `${skill.name}${skill.level !== 'Proficiente' ? ` (${skill.level})` : ''}`
                      ).join(', ')}
                    </p>
                  )}
                  {/* Certificaciones */}
                  {cvData.certifications.length > 0 && (
                    <p className="text-black font-serif leading-relaxed">
                      <span className="font-semibold">Certificaciones:</span> {cvData.certifications.map(cert => {
                        let certText = cert.name;
                        if (cert.issuer) certText += ` - ${cert.issuer}`;
                        if (cert.date) certText += ` (${formatDate(cert.date)})`;
                        return certText;
                      }).join(', ')}
                    </p>
                  )}
                  {/* Idiomas */}
                  {((cvData.languages && cvData.languages.length > 0) || skillsOrganized.languages.length > 0) && (
                    <p className="text-black font-serif leading-relaxed">
                      <span className="font-semibold">Idiomas:</span> {[
                        ...(cvData.languages?.map(lang =>
                          `${lang.language} (${lang.proficiency})`
                        ) || []),
                        ...skillsOrganized.languages.map(skill =>
                          `${skill.name}${skill.level !== 'Proficiente' ? ` (${skill.level})` : ''}`
                        )
                      ].join(', ')}
                    </p>
                  )}
                  {/* Hobbies */}
                  {(cvData as any).hobbies && (cvData as any).hobbies.length > 0 && (
                    <p className="text-black font-serif leading-relaxed">
                      <span className="font-semibold">Hobbies:</span> {(cvData as any).hobbies.join(', ')}
                    </p>
                  )}
                  {/* Otras habilidades */}
                  {skillsOrganized.other.length > 0 && (
                    <p className="text-black font-serif leading-relaxed">
                      <span className="font-semibold">Otras Competencias:</span> {skillsOrganized.other.map(skill =>
                        `${skill.name}${skill.level !== 'Proficiente' ? ` (${skill.level})` : ''}`
                      ).join(', ')}
                    </p>
                  )}
                </div>
              );
            })()}
          </section>
        )}

        {/* Sección de Voluntariado */}
        {cvData.volunteer && cvData.volunteer.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-3 text-[#028bbf]">
              VOLUNTARIADO
            </h3>
            <div className="space-y-4">
              {cvData.volunteer.map((vol: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold">{vol.position}</h4>
                    <span className="text-sm text-gray-600">
                      {vol.startDate} - {vol.currentlyVolunteering ? 'Presente' : vol.endDate}
                    </span>
                  </div>
                  <div className="text-gray-700 mb-1">
                    <span className="font-medium">{vol.organization}</span>
                    {vol.location && <span className="text-gray-500"> • {vol.location}</span>}
                  </div>
                  {vol.description && (
                    <p className="text-sm text-gray-600 mb-2">{vol.description}</p>
                  )}
                  {vol.impact && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Impacto:</strong> {vol.impact}
                    </p>
                  )}
                  {vol.skills && vol.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vol.skills.map((skill: string, skillIndex: number) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
