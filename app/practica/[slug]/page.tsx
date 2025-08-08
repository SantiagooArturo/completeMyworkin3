'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  ArrowLeft, 
  Clock,
  Share2,
  Bookmark,
  AlertCircle,
  Target
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PracticaMatchCharts from '@/components/PracticaMatchCharts';
import PracticaTools from '@/components/PracticaTools';
import { Practica, SimilitudData } from '@/types/practica';
import { useJobContext } from '@/contexts/JobContext';

export default function PracticaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setSelectedJob } = useJobContext();
  const [practica, setPractica] = useState<Practica | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el clic en "Aplicar ahora"
  const handleApplyClick = () => {
    if (practica) {
      // Establecer los datos completos del trabajo en el contexto
      setSelectedJob({
        title: practica.title,
        company: practica.company,
        location: practica.location,
        type: 'Remoto', // Valor por defecto, puedes ajustar según tus datos
        schedule: 'Tiempo completo', // Valor por defecto, puedes ajustar según tus datos
        salary: practica.salary || 'A negociar',
        url: practica.url,
        description: practica.descripcion,
        requirements: practica.descripcion || '', // Usar descripción si no hay requisitos específicos
        publishedDate: practica.fecha_agregado,
        endDate: practica.fecha_agregado, // Usar fecha_agregado si no hay fecha_limite
        // Datos de similitud específicos del match con los nuevos campos
        similitud_requisitos: practica.similitud_requisitos,
        similitud_puesto: practica.similitud_puesto,
        afinidad_sector: practica.afinidad_sector,
        similitud_semantica: practica.similitud_semantica,
        juicio_sistema: practica.juicio_sistema,
        similitud_total: practica.similitud_total,
        justificacion_requisitos: practica.justificacion_requisitos,
        justificacion_puesto: practica.justificacion_puesto,
        justificacion_afinidad: practica.justificacion_afinidad,
        justificacion_semantica: practica.justificacion_semantica,
        justificacion_juicio: practica.justificacion_juicio,
      });
      
      // Redirigir a la página de postular
      router.push(`/postular?title=${encodeURIComponent(practica.title)}&url=${encodeURIComponent(practica.url)}`);
    }
  };

  // Obtener práctica desde localStorage o API
  useEffect(() => {
    const loadPractica = () => {
      try {
        // Intentar obtener de localStorage primero (datos del match)
        const storedPracticas = localStorage.getItem('matched_practices');
        if (storedPracticas) {
          const practices = JSON.parse(storedPracticas);
          // Buscar por índice o por algún identificador único
          const practicaIndex = parseInt(params.slug as string);
          
          if (practices[practicaIndex]) {
            setPractica(practices[practicaIndex]);
            setIsLoading(false);
            return;
          }
        }

        // Si no se encuentra, mostrar error
        setError('Práctica no encontrada');
        setIsLoading(false);
      } catch (err) {
        console.error('Error cargando práctica:', err);
        setError('Error al cargar la práctica');
        setIsLoading(false);
      }
    };

    loadPractica();
  }, [params.slug]);

  // Preparar datos para gráficos de similitud
  const getSimilitudData = (practica: Practica): SimilitudData[] => {
    return [
      {
        label: 'Match General',
        value:  Math.round(practica.similitud_total) || 0, // Usar el valor calculado del backend
        color: '#6366F1',
        justificacion: 'Evaluación integral de compatibilidad calculada por el sistema'
      },
      {
        label: 'Requisitos Técnicos',
        value:  Math.round(practica.similitud_requisitos) || 0,
        color: '#10B981',
        justificacion: practica.justificacion_requisitos || 'No disponible'
      },
      {
        label: 'Afinidad Sector',
        value:  Math.round(practica.afinidad_sector) || 0,
        color: '#F59E0B',
        justificacion: practica.justificacion_afinidad || 'No disponible'
      },
      {
        label: 'Similitud Semántica',
        value:  Math.round(practica.similitud_semantica) || 0,
        color: '#8B5CF6',
        justificacion: practica.justificacion_semantica || 'No disponible'
      },

    ];
  };

  // Formatear fecha
  const formatFecha = (fechaString: string) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !practica) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Práctica no encontrada'}
            </h2>
            <p className="text-gray-600 mb-6">
              No pudimos cargar los detalles de esta práctica.
            </p>
            <button
              onClick={() => router.push('/portal-trabajo')}
              className="bg-[#028bbf] hover:bg-[#027ba8] text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Volver al portal de trabajo
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Información principal de la práctica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header de la práctica */}
          <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-lg p-1.5">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{practica.title}</h1>
                    <p className="text-sm text-blue-100">{practica.company}</p>
                  </div>
                </div>
                
                {/* Metadatos */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100 mt-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{practica.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{practica.salary || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Publicado {formatFecha(practica.fecha_agregado)}</span>
                  </div>
                </div>
              </div>
              
              {/* Match Score y Botón de aplicar */}
              <div className="ml-4 flex items-center space-x-3">
                {/* Match Score Compacto */}
                <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
                  <div className="text-xl font-bold text-white">
                    {Math.round(practica.similitud_total || 0)}%
                  </div>
                  <div className="text-[10px] text-blue-100 font-medium">
                    {(() => {
                      const total = practica.similitud_total || 0;
                      return total >= 70 ? 'EXCELENTE' : 
                             total >= 50 ? 'BUENO' : 
                             total >= 30 ? 'REGULAR' : 'BAJO';
                    })()} MATCH
                  </div>
                </div>
                
                {/* Botón de aplicar */}
                <button
                  onClick={handleApplyClick}
                  className="bg-white text-[#028bbf] hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1"
                >
                  <span>Aplicar ahora</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sección de gráficos de match */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-200">
            <PracticaMatchCharts similitudes={getSimilitudData(practica)} />
          </div>
        </div>

        {/* Layout de tres columnas: Descripción | Herramientas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          
          {/* Columna principal: Descripción del puesto */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Descripción del puesto
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                {practica.descripcion}
              </div>
            </div>
          </div>

          {/* Columna derecha: Solo Herramientas */}
          <div className="lg:col-span-5">
            <PracticaTools practica={practica} />
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
}