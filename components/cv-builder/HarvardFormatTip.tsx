'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { HelpCircle, X } from 'lucide-react';

interface HarvardFormatTipProps {
  section: string;
  tips?: string[];
  title?: string;
  className?: string;
}

const HARVARD_TIPS = {
  'personal-info': {
    title: '📝 Formato Harvard - Información Personal',
    tips: [
      'Usa un formato limpio y profesional con información de contacto clara',
      'Incluye nombre completo, teléfono, email y ubicación',
      'LinkedIn es opcional pero recomendado para profesionales',
      'El resumen debe ser conciso (2-3 líneas) y orientado a resultados',
      'Enfócate en tu valor único y objetivos profesionales específicos',
      'Evita información personal irrelevante (edad, estado civil, foto)'
    ]
  },
  'education': {
    title: '📚 Formato Harvard - Educación',
    tips: [
      'Lista la educación en orden cronológico inverso (más reciente primero)',
      'Incluye el nombre completo de la institución',
      'Especifica el tipo de título y campo de estudio',
      'Menciona honores académicos si los tienes (Magna Cum Laude, etc.)',
      'Para estudios en curso, indica "Esperado: [fecha]"',
      'Incluye solo educación relevante para el puesto objetivo'
    ]
  },
  'work-experience': {
    title: '💼 Formato Harvard - Experiencia Laboral',
    tips: [
      'Organiza en orden cronológico inverso (trabajo más reciente primero)',
      'Formato: Empresa, Puesto, Fechas, Ubicación',
      'Usa verbos de acción en pasado (desarrollé, lideré, implementé)',
      'Cuantifica logros con números específicos (aumenté ventas 25%)',
      'Enfócate en resultados e impacto, no solo responsabilidades',
      'Incluye 3-5 puntos clave por posición',
      'Usa parallelismo en la estructura de las frases'
    ]
  },
  'projects': {
    title: '🚀 Formato Harvard - Proyectos',
    tips: [
      'Lista proyectos relevantes para el puesto objetivo',
      'Incluye nombre del proyecto, tecnologías utilizadas y duración',
      'Describe el propósito y alcance del proyecto brevemente',
      'Destaca tu rol específico y contribuciones clave',
      'Cuantifica el impacto cuando sea posible',
      'Menciona metodologías aplicadas (Agile, Scrum, etc.)',
      'Incluye enlaces a repositorios o demos si están disponibles'
    ]
  },
  'skills': {
    title: '🎯 Formato Harvard - Habilidades',
    tips: [
      'Organiza por categorías: Software, Gestión de Proyectos, Idiomas',
      'Ejemplos: "Microsoft Office (Excel - Avanzado), SQL, Power BI"',
      'Sé específico: "Microsoft Project, Metodologías Ágiles"',
      'Para idiomas: "Inglés - Avanzado, Francés - Intermedio"',
      'Enfócate en herramientas específicas que dominas',
      'Incluye el nivel de competencia cuando sea relevante',
      'Evita habilidades demasiado básicas o irrelevantes'
    ]
  },
  'certifications': {
    title: '🏆 Formato Harvard - Certificaciones',
    tips: [
      'Lista certificaciones en orden cronológico inverso',
      'Incluye solo certificaciones relevantes para tu campo',
      'Verifica que las certificaciones estén vigentes',
      'Menciona el nombre completo y oficial de la certificación',
      'Incluye la organización emisora reconocida',
      'Agrega ID de credencial si está disponible para verificación',
      'Destaca certificaciones de organizaciones prestigiosas'
    ]
  },
  'languages': {
    title: '🌍 Formato Harvard - Idiomas',
    tips: [
      'Usa el Marco Común Europeo (A1-C2) para niveles precisos',
      'Sé honesto sobre tu nivel real de competencia',
      'Incluye certificaciones oficiales cuando las tengas (TOEFL, IELTS)',
      'Prioriza idiomas relevantes para el puesto',
      'Considera incluir idiomas nativos/maternos',
      'Ordena por nivel de dominio (de mayor a menor)',
      'Formato: "Inglés (C1), Francés (B2), Alemán (A2)"'
    ]
  },
  'volunteer': {
    title: '❤️ Formato Harvard - Voluntariado',
    tips: [
      'Incluye solo experiencias de voluntariado relevantes y significativas',
      'Enfócate en el impacto y los resultados obtenidos',
      'Menciona habilidades desarrolladas y aplicadas',
      'Cuantifica cuando sea posible (personas impactadas, fondos recaudados)',
      'Destaca liderazgo y trabajo en equipo',
      'Usa el mismo formato que la experiencia laboral',
      'Demuestra compromiso y valores personales'
    ]
  },
  'references': {
    title: '👥 Formato Harvard - Referencias',
    tips: [
      'Incluye 2-3 referencias profesionales relevantes',
      'Contacta previamente a tus referencias para solicitar permiso',
      'Elige personas que puedan hablar específicamente de tu trabajo',
      'Incluye información de contacto actualizada y verificada',
      'Prioriza supervisores directos o colegas de nivel senior',
      'Evita referencias familiares o amigos personales',
      'Alternativa: "Referencias disponibles bajo solicitud"'
    ]
  },
  'hobbies': {
    title: '🎨 Formato Harvard - Hobbies e Intereses',
    tips: [
      'Incluye solo hobbies que agreguen valor profesional',
      'Selecciona 3-5 intereses que muestren personalidad balanceada',
      'Evita hobbies controvertidos o muy personales',
      'Destaca actividades que demuestren liderazgo o trabajo en equipo',
      'Menciona logros específicos si los tienes',
      'Considera la relevancia cultural y profesional',
      'Mantén la sección breve y al final del CV'
    ]
  }
};

export default function HarvardFormatTip({ 
  section, 
  tips, 
  title, 
  className = "" 
}: HarvardFormatTipProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Usar tips predefinidos o los proporcionados
  const sectionData = HARVARD_TIPS[section as keyof typeof HARVARD_TIPS];
  const finalTips = tips || sectionData?.tips || [];
  const finalTitle = title || sectionData?.title || 'Consejos de Formato Harvard';

  if (finalTips.length === 0) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 transition-colors ${className}`}
          title="Ver consejos de formato Harvard"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 shadow-lg border-blue-200" 
        align="start"
        side="bottom"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-blue-900 text-sm">
              {finalTitle}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          <ul className="space-y-2">
            {finalTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <span className="text-blue-400 font-medium mt-0.5">•</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-blue-50 border-t border-blue-200 p-3">
          <p className="text-xs text-blue-600 text-center">
            💡 El formato Harvard es reconocido mundialmente por reclutadores
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
