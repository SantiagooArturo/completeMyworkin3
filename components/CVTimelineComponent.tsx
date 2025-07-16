'use client';

import { Briefcase, GraduationCap, Code2, Calendar, MapPin, Building, Clock, Trophy } from 'lucide-react';

// Tipos para los datos del timeline
export interface TimelineExperience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent: boolean;
}

export interface TimelineEducation {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface TimelineProject {
  name: string;
  description: string;
  technologies: string[];
}

interface CVTimelineComponentProps {
  experience?: TimelineExperience[];
  education?: TimelineEducation[];
  projects?: TimelineProject[];
  title?: string;
  className?: string;
}

export default function CVTimelineComponent({
  experience = [],
  education = [],
  projects = [],
  title = "Experiencia Profesional",
  className = ""
}: CVTimelineComponentProps) {

  // Formatear fechas para mostrar
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.toLowerCase() === 'actualidad' || dateStr.toLowerCase() === 'presente') {
      return 'Actualidad';
    }
    return dateStr;
  };

  // Calcular duración aproximada
  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate) return '';
    
    const start = new Date(startDate.includes('/') ? startDate.split('/').reverse().join('-') : startDate);
    const end = endDate.toLowerCase() === 'actualidad' || endDate.toLowerCase() === 'presente' 
      ? new Date() 
      : new Date(endDate.includes('/') ? endDate.split('/').reverse().join('-') : endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 12) {
      return `${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      let duration = `${years} año${years !== 1 ? 's' : ''}`;
      if (months > 0) {
        duration += ` ${months} mes${months !== 1 ? 'es' : ''}`;
      }
      return duration;
    }
  };

  // Componente para mostrar un ítem de experiencia
  const ExperienceItem = ({ item, index }: { item: TimelineExperience; index: number }) => (
    <div className="relative flex items-start group">
      {/* Línea timeline */}
      <div className="flex flex-col items-center mr-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          item.isCurrent 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
            : 'bg-gradient-to-r from-[#028bbf] to-[#027ba8] text-white'
        } transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
          <Briefcase className="h-5 w-5" />
        </div>
        {index < experience.length - 1 && (
          <div className="w-0.5 h-16 bg-gradient-to-b from-gray-300 to-gray-200 mt-2"></div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300 group-hover:border-blue-200">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#028bbf] transition-colors">
              {item.position}
            </h3>
            <div className="flex items-center text-gray-600 mt-1">
              <Building className="h-4 w-4 mr-1" />
              <span className="font-medium">{item.company}</span>
            </div>
          </div>
          
          {item.isCurrent && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              Actual
            </span>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-3 flex-wrap gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{calculateDuration(item.startDate, item.endDate)}</span>
          </div>
        </div>

        {item.description && (
          <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );

  // Componente para mostrar un ítem de educación
  const EducationItem = ({ item, index }: { item: TimelineEducation; index: number }) => (
    <div className="relative flex items-start group">
      {/* Línea timeline */}
      <div className="flex flex-col items-center mr-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          item.isCurrent 
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
            : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
        } transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
          <GraduationCap className="h-5 w-5" />
        </div>
        {index < education.length - 1 && (
          <div className="w-0.5 h-16 bg-gradient-to-b from-gray-300 to-gray-200 mt-2"></div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300 group-hover:border-purple-200">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
              {item.degree}
            </h3>
            <div className="flex items-center text-gray-600 mt-1">
              <Building className="h-4 w-4 mr-1" />
              <span className="font-medium">{item.institution}</span>
            </div>
          </div>
          
          {item.isCurrent && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Clock className="h-3 w-3 mr-1" />
              En curso
            </span>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-500 flex-wrap gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{calculateDuration(item.startDate, item.endDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente para mostrar un proyecto
  const ProjectItem = ({ item, index }: { item: TimelineProject; index: number }) => (
    <div className="relative flex items-start group">
      {/* Línea timeline */}
      <div className="flex flex-col items-center mr-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
          <Code2 className="h-5 w-5" />
        </div>
        {index < projects.length - 1 && (
          <div className="w-0.5 h-16 bg-gradient-to-b from-gray-300 to-gray-200 mt-2"></div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300 group-hover:border-orange-200">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">
          {item.name}
        </h3>
        
        {item.description && (
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {item.description}
          </p>
        )}

        {item.technologies && item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.technologies.map((tech, techIndex) => (
              <span
                key={techIndex}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const hasAnyData = experience.length > 0 || education.length > 0 || projects.length > 0;

  if (!hasAnyData) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <Trophy className="h-6 w-6 mr-2 text-[#028bbf]" />
          {title}
        </h2>
        <p className="text-gray-600 text-sm">Información extraída automáticamente de tu CV</p>
      </div>

      {/* Timeline Container */}
      <div className="space-y-6">
        
        {/* Experiencia Laboral */}
        {experience.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-[#028bbf]" />
              Experiencia Laboral ({experience.length})
            </h3>
            <div className="space-y-6">
              {experience.map((item, index) => (
                <ExperienceItem key={index} item={item} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Educación */}
        {education.length > 0 && (
          <div className={experience.length > 0 ? 'mt-8' : ''}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
              Educación ({education.length})
            </h3>
            <div className="space-y-6">
              {education.map((item, index) => (
                <EducationItem key={index} item={item} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Proyectos */}
        {projects.length > 0 && (
          <div className={(experience.length > 0 || education.length > 0) ? 'mt-8' : ''}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Code2 className="h-5 w-5 mr-2 text-orange-600" />
              Proyectos ({projects.length})
            </h3>
            <div className="space-y-6">
              {projects.map((item, index) => (
                <ProjectItem key={index} item={item} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-medium">💡 Tip:</span> Esta información se extrajo automáticamente de tu CV. 
          Puedes editarla manualmente en la sección de perfil si necesitas hacer ajustes.
        </p>
      </div>
    </div>
  );
} 