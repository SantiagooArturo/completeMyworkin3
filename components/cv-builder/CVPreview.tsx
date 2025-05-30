'use client';

import React from 'react';
import { CVData } from '@/types/cv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, Phone, MapPin, Linkedin, Globe, Star } from 'lucide-react';

interface CVPreviewProps {
  cvData: CVData;
}

export default function CVPreview({ cvData }: CVPreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Asegurarse de que el mes se muestre correctamente
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
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#028bbf]" />
          Vista Previa - Formato Harvard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-8 shadow-lg border space-y-6 text-sm">          {/* Header - Información Personal - Formato Harvard */}
          <header className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
              {cvData.personalInfo.fullName || 'Tu Nombre Completo'}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 text-gray-600">
              {cvData.personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{cvData.personalInfo.email}</span>
                </div>
              )}
              {cvData.personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{cvData.personalInfo.phone}</span>
                </div>
              )}
              {cvData.personalInfo.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{cvData.personalInfo.address}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-gray-600">
              {cvData.personalInfo.linkedIn && (
                <div className="flex items-center gap-1">
                  <Linkedin className="h-4 w-4" />
                  <span>{cvData.personalInfo.linkedIn}</span>
                </div>
              )}
              {cvData.personalInfo.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{cvData.personalInfo.website}</span>
                </div>
              )}
            </div>
          </header>

          {/* Resumen Profesional */}
          {cvData.personalInfo.summary && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                RESUMEN PROFESIONAL
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {cvData.personalInfo.summary}
              </p>
            </section>
          )}

          {/* Experiencia Laboral */}
          {cvData.workExperience.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                EXPERIENCIA PROFESIONAL
              </h2>
              <div className="space-y-4">
                {cvData.workExperience.map((exp, index) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-gray-700 font-medium">{exp.company}</p>
                      </div>
                      <div className="text-right text-gray-600">
                        <p>
                          {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}
                        </p>
                        {exp.location && <p className="text-sm">{exp.location}</p>}
                      </div>
                    </div>
                    
                    {exp.description && (
                      <p className="text-gray-700 mb-2">{exp.description}</p>
                    )}
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                    
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-2">
                        <span className="text-gray-600 font-medium">Tecnologías: </span>
                        <span className="text-gray-700">{exp.technologies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educación */}
          {cvData.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                FORMACIÓN ACADÉMICA
              </h2>
              <div className="space-y-3">
                {cvData.education.map((edu, index) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-700">{edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-gray-600">{edu.fieldOfStudy}</p>
                        )}
                        {edu.gpa && (
                          <p className="text-gray-600">GPA: {edu.gpa}</p>
                        )}
                      </div>
                      <div className="text-right text-gray-600">
                        <p>
                          {formatDate(edu.startDate)} - {edu.current ? 'En curso' : formatDate(edu.endDate)}
                        </p>
                      </div>
                    </div>
                    
                    {edu.achievements && edu.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                        {edu.achievements.map((achievement, achIndex) => (
                          <li key={achIndex}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Proyectos */}
          {cvData.projects.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                PROYECTOS DESTACADOS
              </h2>
              <div className="space-y-3">
                {cvData.projects.map((project, index) => (
                  <div key={project.id}>                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      </div>
                      <div className="text-right text-gray-600">
                        <p>
                          {formatDate(project.startDate)} - {project.current ? 'En curso' : formatDate(project.endDate)}
                        </p>
                        {project.url && (
                          <a href={project.url} className="text-blue-600 text-sm hover:underline">
                            Ver proyecto
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-700 mb-2">{project.description}</p>
                    )}
                    
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 space-y-1 mb-2">
                        {project.highlights.map((highlight, hlIndex) => (
                          <li key={hlIndex}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-medium">Tecnologías: </span>
                        <span className="text-gray-700">{project.technologies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Habilidades */}
          {cvData.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                HABILIDADES Y COMPETENCIAS
              </h2>
                {['Técnica', 'Blanda', 'Idioma'].map((category) => {
                const categorySkills = getSkillsByCategory(category);
                if (categorySkills.length === 0) return null;
                
                const categoryNames = {
                  'Técnica': 'Técnicas',
                  'Blanda': 'Interpersonales', 
                  'Idioma': 'Idiomas'
                };
                
                return (
                  <div key={category} className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-2">{categoryNames[category as keyof typeof categoryNames]}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categorySkills.map((skill, index) => (
                        <div key={skill.id} className="flex items-center justify-between">
                          <span className="text-gray-700">{skill.name}</span>
                          {renderSkillLevel(skill.level)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Certificaciones */}
          {cvData.certifications.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                CERTIFICACIONES
              </h2>
              <div className="space-y-2">
                {cvData.certifications.map((cert, index) => (
                  <div key={cert.id} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                      <p className="text-gray-700">{cert.issuer}</p>
                      {cert.credentialId && (
                        <p className="text-gray-600 text-sm">ID: {cert.credentialId}</p>
                      )}
                    </div>
                    <div className="text-right text-gray-600">
                      <p>{formatDate(cert.date)}</p>
                      {cert.expiryDate && (
                        <p className="text-sm">Expira: {formatDate(cert.expiryDate)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
