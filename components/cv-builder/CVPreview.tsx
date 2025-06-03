'use client';

import React, { useEffect } from 'react';
import { CVData } from '@/types/cv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, Phone, MapPin, Linkedin, Globe, Star } from 'lucide-react';

interface CVPreviewProps {
  cvData: CVData;
}

export default function CVPreview({ cvData }: CVPreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Si el formato es YYYY-MM, procesarlo correctamente
    if (dateString.includes('-') && dateString.length === 7) {
      const [year, month] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 15); // Día 15 para evitar problemas de zona horaria
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric',
        month: 'long'
      });
    }
    
    // Para otros formatos, usar el método original pero con día fijo
    const date = new Date(dateString + '-15');
    return new Intl.DateTimeFormat('es-ES', { 
      year: 'numeric',
      month: 'long'
    }).format(date);
  };

  const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
    const start = formatDate(startDate);
    if (current) {
      return `${start} - Presente`;
    }
    const end = formatDate(endDate);
    return `${start} - ${end}`;
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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#028bbf]" />
          Vista Previa - Formato Harvard
        </CardTitle>
      </CardHeader>
      <CardContent>        <div className="bg-white p-8 shadow-lg border space-y-6 text-sm">
          {/* Header - Información Personal - Formato Harvard */}
          <header className="text-center border-b border-gray-300 pb-4">
            <h1 className="text-2xl font-bold text-black mb-3 tracking-normal font-serif">
              {cvData.personalInfo.fullName || 'Tu Nombre Completo'}
            </h1>
            
            {/* Contacto en una sola línea */}
            <div className="text-gray-700 text-sm font-serif">
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
            <section className="text-gray-800 leading-relaxed text-justify font-serif">
              {cvData.personalInfo.summary}
            </section>          )}

          {/* Experiencia Laboral y Proyectos - Sección combinada */}
          {(cvData.workExperience.length > 0 || cvData.projects.length > 0) && (
            <section>
              <h2 className="text-lg font-semibold text-center text-black pb-2 mb-4 font-serif">
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
                        )}
                        {/* Puesto y fechas en la misma línea */}
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-black font-serif">{exp.position}</span>
                          <span className="text-black font-serif">{formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}</span>
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
                              {formatDate(project.startDate)} - {project.current ? 'En curso' : formatDate(project.endDate)}
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
                            <span className="text-black font-serif">{project.technologies.join(', ')}</span>
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
              <h2 className="text-lg text-center font-semibold text-black pb-2 mb-4 font-serif">
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
                      </span>
                      <span className="font-normal text-black font-serif">
                        {edu.startDate ? `${formatDate(edu.startDate)}${edu.current ? ' – Actualidad' : edu.endDate ? ` – ${formatDate(edu.endDate)}` : ''}` : ''}
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
              <h2 className="text-lg font-semibold text-center text-black pb-2 mb-4 font-serif">
                Habilidades & Certificaciones
              </h2>
              {(() => {
                const skillsOrganized = getSkillsForHarvardFormat();
                return (
                  <div className="space-y-2">
                    {/* Software */}
                    {skillsOrganized.software.length > 0 && (
                      <p className="text-black font-serif leading-relaxed">
                        <span className="font-semibold">Software:</span> {skillsOrganized.software.map(skill =>
                          `${skill.name}${skill.level !== 'Experto' ? ` (${skill.level})` : ''}`
                        ).join(', ')}
                      </p>
                    )}
                    {/* Gestión de proyectos */}
                    {skillsOrganized.projectManagement.length > 0 && (
                      <p className="text-black font-serif leading-relaxed">
                        <span className="font-semibold">Gestión de Proyectos:</span> {skillsOrganized.projectManagement.map(skill =>
                          `${skill.name}${skill.level !== 'Experto' ? ` (${skill.level})` : ''}`
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
                            `${skill.name}${skill.level !== 'Experto' ? ` (${skill.level})` : ''}`
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
                          `${skill.name}${skill.level !== 'Experto' ? ` (${skill.level})` : ''}`
                        ).join(', ')}
                      </p>
                    )}
                  </div>
                );
              })()}
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
