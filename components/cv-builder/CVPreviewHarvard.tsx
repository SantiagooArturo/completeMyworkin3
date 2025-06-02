'use client';

import React from 'react';
import { CVData } from '@/types/cv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface CVPreviewHarvardProps {
  cvData: CVData;
  isStudentMode?: boolean;
}

export default function CVPreviewHarvard({ cvData, isStudentMode = false }: CVPreviewHarvardProps) {
  // Determinar el orden de las secciones según el modo
  const getSectionOrder = () => {
    if (isStudentMode) {
      return [
        'summary',
        'education', 
        'projects',
        'experience',
        'skills',
        'certifications',
        'hobbies'
      ];
    } else {
      return [
        'summary',
        'experience',
        'education',
        'projects', 
        'skills',
        'certifications',
        'hobbies'
      ];
    }
  };

  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case 'summary':
        return cvData.personalInfo.summary && (
          <div className="space-y-2">
            <h2 className="text-cv-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
              {isStudentMode ? 'Perfil Estudiante' : 'Perfil Profesional'}
            </h2>
            <p className="text-cv-base text-gray-700 text-justify leading-relaxed">
              {cvData.personalInfo.summary}
            </p>
          </div>
        );
      
      case 'education':
        return cvData.education.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-cv-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
              Educación
            </h2>
            {cvData.education.map((edu) => (
              <div key={edu.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {edu.degree}{edu.fieldOfStudy ? ` en ${edu.fieldOfStudy}` : ''}
                    </h3>
                    <p className="text-gray-700 italic">{edu.institution}</p>
                    {edu.gpa && (
                      <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
                    )}
                    {edu.honors && (
                      <p className="text-gray-600 text-sm">{edu.honors}</p>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm text-right">
                    {formatDate(edu.startDate)} - {edu.current ? 'Presente' : formatDate(edu.endDate)}
                  </p>
                </div>
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                    {edu.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                )}
                {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Cursos Relevantes:</span> {edu.relevantCourses.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 'projects':
        return cvData.projects && cvData.projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-cv-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
              {isStudentMode ? 'Proyectos Académicos y Personales' : 'Proyectos Destacados'}
            </h2>
            {cvData.projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-700 text-sm">{project.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">
                      {formatDate(project.startDate)} - {project.current ? 'Presente' : formatDate(project.endDate)}
                    </p>
                    {project.url && (
                      <a href={project.url} className="text-blue-600 text-sm hover:underline" target="_blank">
                        Ver proyecto
                      </a>
                    )}
                  </div>
                </div>
                {project.highlights && project.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                    {project.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Tecnologías:</span> {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 'experience':
        return cvData.workExperience.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-cv-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
              {isStudentMode ? 'Experiencia Laboral y Prácticas' : 'Experiencia Profesional'}
            </h2>
            {cvData.workExperience.map((exp) => (
              <div key={exp.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700 italic">{exp.company}</p>
                    {exp.location && (
                      <p className="text-gray-600 text-sm">{exp.location}</p>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm text-right">
                    {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-gray-700 text-sm">{exp.description}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies && exp.technologies.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Tecnologías:</span> {exp.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 'skills':
        return cvData.skills.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-cv-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
              Habilidades y Competencias
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(groupSkillsByCategory(cvData.skills)).map(([category, skills]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-bold text-gray-900">{translateCategory(category)}</h3>
                  <ul className="space-y-1">
                    {skills.map((skill) => (
                      <li key={skill.id} className="flex justify-between text-gray-700 text-sm">
                        <span>{skill.name}</span>
                        <span className="text-gray-500">{skill.level}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        return cvData.certifications && cvData.certifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-cv-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
              Certificaciones
            </h2>
            {cvData.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-gray-700 italic">{cert.issuer}</p>
                  {cert.credentialId && (
                    <p className="text-gray-600 text-sm">ID: {cert.credentialId}</p>
                  )}
                </div>
                <p className="text-gray-600 text-sm text-right">
                  {formatDate(cert.date)}
                  {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                </p>
              </div>
            ))}
          </div>
        );

      case 'hobbies':
        return cvData.hobbies && cvData.hobbies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-cv-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1">
              Intereses y Hobbies
            </h2>
            <div className="flex flex-wrap gap-2">
              {cvData.hobbies.map((hobby, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      {isStudentMode && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-sm font-medium">✨ Vista Previa - Modo Estudiante</span>
          </div>
        </div>
      )}
      
      <CardContent className="p-8 space-y-6 font-garamond text-cv-base">
        {/* Header - Información Personal */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-cv-2xl font-bold tracking-wider text-gray-900 uppercase">{cvData.personalInfo.fullName}</h1>
          <div className="flex justify-center items-center gap-2 text-cv-base text-gray-700">
            {[
              cvData.personalInfo.address,
              cvData.personalInfo.phone,
              cvData.personalInfo.email
            ].filter(Boolean).join(' • ')}
          </div>
          {(cvData.personalInfo.linkedIn || cvData.personalInfo.website) && (
            <div className="flex justify-center items-center gap-2 text-cv-base text-gray-700">
              {[cvData.personalInfo.linkedIn, cvData.personalInfo.website]
                .filter(Boolean)
                .join(' • ')}
            </div>
          )}
        </div>

        {/* Renderizar secciones en el orden apropiado */}
        {getSectionOrder().map(sectionType => (
          <React.Fragment key={sectionType}>
            {renderSection(sectionType)}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // Si el formato es YYYY-MM, procesarlo correctamente
  if (dateString.includes('-') && dateString.length === 7) {
    const [year, month] = dateString.split('-');
    const monthNumber = parseInt(month);
    const yearNumber = parseInt(year);
    
    // Crear fecha específica sin problemas de zona horaria
    const date = new Date(yearNumber, monthNumber - 1, 1);
    
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    return `${monthNames[monthNumber - 1]} ${yearNumber}`;
  }
  
  // Para otros formatos, intentar parsearlo
  try {
    const [year, month] = dateString.split('-');
    if (year && month) {
      const monthNumber = parseInt(month);
      const yearNumber = parseInt(year);
      
      const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      
      return `${monthNames[monthNumber - 1]} ${yearNumber}`;
    }
  } catch (error) {
    console.error('Error formateando fecha:', error);
  }
  
  return dateString; // Fallback
}

function groupSkillsByCategory(skills: CVData['skills']) {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);
}

function translateCategory(category: string): string {
  const translations: Record<string, string> = {
    'Technical': 'Competencias Técnicas',
    'Analytical': 'Habilidades Analíticas',
    'Leadership': 'Liderazgo y Gestión',
    'Communication': 'Comunicación',
    'Research': 'Investigación'
  };
  return translations[category] || category;
}
