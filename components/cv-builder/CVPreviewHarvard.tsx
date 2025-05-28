'use client';

import React from 'react';
import { CVData } from '@/types/cv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface CVPreviewHarvardProps {
  cvData: CVData;
}

export default function CVPreviewHarvard({ cvData }: CVPreviewHarvardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-sm text-gray-600 flex items-center justify-center gap-2">
          <FileText className="h-4 w-4" />
          Vista Previa - Formato Harvard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6 text-sm leading-relaxed">
        {/* Header con información personal - Formato Harvard */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
            {cvData.personalInfo.fullName || 'Tu Nombre Completo'}
          </h1>
          <div className="flex flex-wrap justify-center gap-2 text-gray-700 text-sm">
            {cvData.personalInfo.address && <span>{cvData.personalInfo.address}</span>}
            {cvData.personalInfo.phone && cvData.personalInfo.address && <span>•</span>}
            {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
            {cvData.personalInfo.email && (cvData.personalInfo.phone || cvData.personalInfo.address) && <span>•</span>}
            {cvData.personalInfo.email && <span>{cvData.personalInfo.email}</span>}
          </div>
          {(cvData.personalInfo.linkedIn || cvData.personalInfo.website) && (
            <div className="flex flex-wrap justify-center gap-2 text-gray-700 text-sm">
              {cvData.personalInfo.linkedIn && <span>{cvData.personalInfo.linkedIn}</span>}
              {cvData.personalInfo.website && cvData.personalInfo.linkedIn && <span>•</span>}
              {cvData.personalInfo.website && <span>{cvData.personalInfo.website}</span>}
            </div>
          )}
        </div>

        <div className="border-b border-gray-400 my-4"></div>

        {/* Resumen Profesional */}
        {cvData.personalInfo.summary && (
          <div className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Perfil Profesional
            </h2>
            <p className="text-gray-800 text-justify leading-relaxed">
              {cvData.personalInfo.summary}
            </p>
          </div>
        )}

        {/* Educación */}
        {cvData.education.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Educación
            </h2>
            {cvData.education.map((edu) => (
              <div key={edu.id} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {edu.degree} {edu.fieldOfStudy && `en ${edu.fieldOfStudy}`}
                    </p>
                    <p className="text-gray-700 italic">{edu.institution}</p>
                    {edu.gpa && (
                      <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
                    )}
                    {edu.honors && (
                      <p className="text-gray-600 text-sm">{edu.honors}</p>
                    )}
                  </div>
                  <div className="text-right text-gray-600 text-sm ml-4">
                    <p>
                      {formatDate(edu.startDate)} - {edu.current ? 'Presente' : formatDate(edu.endDate)}
                    </p>
                  </div>
                </div>
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 text-sm ml-4 space-y-1">
                    {edu.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                )}
                {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                  <p className="text-gray-600 text-sm ml-4">
                    <span className="font-medium">Cursos relevantes: </span>
                    {edu.relevantCourses.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Experiencia Laboral */}
        {cvData.workExperience.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Experiencia Profesional
            </h2>
            {cvData.workExperience.map((exp) => (
              <div key={exp.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{exp.position}</p>
                    <p className="text-gray-700 italic">{exp.company}</p>
                    {exp.location && (
                      <p className="text-gray-600 text-sm">{exp.location}</p>
                    )}
                  </div>
                  <div className="text-right text-gray-600 text-sm ml-4">
                    <p>
                      {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}
                    </p>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-700 text-sm">{exp.description}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 text-sm ml-4 space-y-1">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies && exp.technologies.length > 0 && (
                  <p className="text-gray-600 text-sm ml-4">
                    <span className="font-medium">Tecnologías: </span>
                    {exp.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Proyectos */}
        {cvData.projects && cvData.projects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Proyectos Destacados
            </h2>
            {cvData.projects.map((project) => (
              <div key={project.id} className="space-y-1">                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{project.name}</p>
                  </div>
                  <div className="text-right text-gray-600 text-sm ml-4">
                    <p>
                      {formatDate(project.startDate)} - {project.current ? 'Presente' : formatDate(project.endDate)}
                    </p>
                  </div>
                </div>
                {project.description && (
                  <p className="text-gray-700 text-sm">{project.description}</p>
                )}
                {project.highlights && project.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 text-sm ml-4 space-y-1">
                    {project.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Tecnologías: </span>
                    {project.technologies.join(', ')}
                  </p>
                )}
                {project.url && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">URL: </span>
                    <span className="text-blue-600">{project.url}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Habilidades */}
        {cvData.skills.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Competencias y Habilidades
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">              {['Técnica', 'Blanda', 'Idioma'].map((category) => {
                const categorySkills = cvData.skills.filter(skill => skill.category === category);
                if (categorySkills.length === 0) return null;
                
                const categoryNames = {
                  'Técnica': 'Técnicas',
                  'Blanda': 'Interpersonales',
                  'Idioma': 'Idiomas'
                };
                
                return (
                  <div key={category} className="space-y-1">
                    <p className="font-medium text-gray-800">
                      {categoryNames[category as keyof typeof categoryNames]}:
                    </p>
                    <div className="flex flex-wrap gap-1">                      {categorySkills.map((skill, index) => (
                        <span key={skill.id} className="text-gray-700">
                          {skill.name}
                          {skill.level !== 'Intermedio' && ` (${skill.level})`}
                          {index < categorySkills.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certificaciones */}
        {cvData.certifications && cvData.certifications.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Certificaciones
            </h2>
            <div className="space-y-2">
              {cvData.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cert.name}</p>
                    <p className="text-gray-700">{cert.issuer}</p>
                    {cert.credentialId && (
                      <p className="text-gray-600 text-sm">ID: {cert.credentialId}</p>
                    )}
                  </div>
                  <div className="text-right text-gray-600 text-sm ml-4">
                    <p>{formatDate(cert.date)}</p>
                    {cert.expiryDate && (
                      <p>Expira: {formatDate(cert.expiryDate)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Idiomas */}
        {cvData.languages && cvData.languages.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Idiomas
            </h2>
            <div className="grid grid-cols-2 gap-4">              {cvData.languages.map((lang) => (
                <div key={lang.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{lang.language}</span>
                    <span className="text-gray-600 text-sm capitalize">{lang.proficiency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referencias */}
        {cvData.references.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Referencias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cvData.references.map((ref) => (
                <div key={ref.id} className="space-y-1">
                  <p className="font-semibold text-gray-900">{ref.name}</p>
                  <p className="text-gray-700 text-sm">{ref.position}</p>
                  <p className="text-gray-700 text-sm">{ref.company}</p>
                  <p className="text-gray-600 text-sm">{ref.phone}</p>
                  <p className="text-gray-600 text-sm">{ref.email}</p>
                  {ref.relationship && (
                    <p className="text-gray-600 text-sm italic">Relación: {ref.relationship}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer con nota sobre referencias si no hay referencias */}
        {cvData.references.length === 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1">
              Referencias
            </h2>
            <p className="text-gray-700 italic text-center">Disponibles bajo solicitud</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
