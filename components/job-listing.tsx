'use client';

import { Practice } from '@/services/firebase';
import { trackApplicationStart } from '@/utils/analytics';
import { useRouter } from 'next/navigation';
import { useJobContext } from '@/contexts/JobContext';

interface JobListingProps {
  practice: Practice;
}

export default function JobListing({ practice }: JobListingProps) {
  const router = useRouter();
  const { setSelectedJob } = useJobContext();

  const handleApply = () => {
    trackApplicationStart(practice.title);
    
    // Guardar los datos completos del trabajo en el contexto
    setSelectedJob({
      id: practice.id?.toString() || Date.now().toString(),
      title: practice.title,
      company: practice.company,
      location: practice.location || 'No especificado',
      type: 'Práctica profesional',
      schedule: 'Tiempo completo',
      salary: practice.salary || 'No especificado',
      url: practice.link || practice.url || '',
      requirements: practice.requirements,
      publishedDate: practice.posted_date,
      endDate: practice.end_date,
      // Agregar datos de similitud con nueva estructura
      requisitos_tecnicos: (practice as any).requisitos_tecnicos,
      similitud_puesto: (practice as any).similitud_puesto,
      afinidad_sector: (practice as any).afinidad_sector,
      similitud_semantica: (practice as any).similitud_semantica,
      juicio_sistema: (practice as any).juicio_sistema,
      similitud_total: (practice as any).similitud_total,
      justificacion_requisitos: (practice as any).justificacion_requisitos,
      justificacion_puesto: (practice as any).justificacion_puesto,
      justificacion_afinidad: (practice as any).justificacion_afinidad,
      justificacion_semantica: (practice as any).justificacion_semantica,
      justificacion_juicio: (practice as any).justificacion_juicio,
    });
    
    const params = new URLSearchParams({
      title: practice.title,
      url: practice.link || practice.url || '',
      worky: 'https://mc.ht/s/SH1lIgc'
    });
    router.push(`/postular?${params.toString()}`);
  };

  // Formatear la fecha de finalización si existe
  const formattedEndDate = practice.end_date 
    ? new Date(practice.end_date).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : null;

  return (
    <div className="mb-6 group">
      <div className="flex items-start mb-2">
        <div className="h-6 w-6 rounded-full bg-[#028bbf]/10 flex items-center justify-center mr-3 text-[#028bbf] group-hover:bg-[#028bbf]/20 transition-all">
          •
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{practice.title}</h3>
          <h4 className="text-gray-700 mb-2">{practice.company}</h4>
          
          {practice.location && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-[#028bbf] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{practice.location}</span>
            </div>
          )}

          {practice.salary && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-[#028bbf] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{practice.salary}</span>
            </div>
          )}

          {practice.posted_date && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-[#028bbf] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{practice.posted_date}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Información adicional */}
      <div className="ml-9 space-y-2 mb-3">
        {formattedEndDate && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Finaliza: {formattedEndDate}</span>
          </div>
        )}
      </div>
      
      {/* Requisitos (truncados) */}
      {practice.requirements && (
        <div className="ml-9 mb-3 bg-[#028bbf]/5 p-3 rounded-lg border border-[#028bbf]/20">
          <h4 className="text-sm font-medium text-[#028bbf] mb-1">Requisitos</h4>
          <p className="text-sm text-gray-700 line-clamp-3">{practice.requirements}</p>
        </div>
      )}
      
      {/* Contenedor original comentado */}
      {/*
      <a 
        href={practice.url}
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-9 bg-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col hover:border-[#028bbf]/30 transition-all duration-300 hover:shadow-lg"
      >
        <div className="flex items-center gap-2 mb-1">
          <svg className="h-4 w-4 text-[#028bbf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-sm text-[#028bbf] font-medium">Ver oferta completa</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{practice.url}</p>
      </a>
      */}

      {/* Nuevo botón de Aplicar */}
      <div className="flex justify-center w-full">
        <button 
          onClick={handleApply}
          className="w-full mt-3 bg-[#028bbf] text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-[#027ba8] transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z M14 2v6h6" />
          </svg>
          Aplicar ahora
        </button>
      </div>
    </div>
  )
}

