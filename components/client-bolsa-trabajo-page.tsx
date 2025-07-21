'use client';

import { useEffect, useState } from 'react';
import { Info } from "lucide-react"
import JobCategory from "@/components/job-category"
import JobListing from "@/components/job-listing"
import CategoryNav from "@/components/category-nav"
import { getRecentPracticesByCategory, getTodayPracticesByCategory, Practice } from "@/services/firebase"
import Link from 'next/link'

interface CategoryData {
  icon: string;
  bgColor: string;
  practices: Practice[];
}

// Iconos para las categorías
const categoryIcons: Record<string, string> = {
  'Ingeniería Industrial y Mecánica': '🔧',
  'Ingeniería Civil y Arquitectura': '🏗️',
  'Tecnología e innovación': '💻',
  'Administración, economía y finanzas': '📊',
  'Comercial y ventas': '💼',
  'Operaciones, cadena y proyectos': '📦',
  'Marketing y comunicaciones': '📱',
  'Capital humano': '👥',
  'Legal y derecho': '⚖️',
  'Otros': '🔍'
};

export default function ClientBolsaTrabajoPage() {
  const [loading, setLoading] = useState(true);
  const [practicesByCategory, setPracticesByCategory] = useState<Record<string, Practice[]>>({});
  const [extractionDate, setExtractionDate] = useState<string | null>(null);

  useEffect(() => {
    const loadPractices = async () => {
      try {
        const result = await getRecentPracticesByCategory();
        setPracticesByCategory(result.practices);
        setExtractionDate(result.extractionDate);
      } catch (error) {
        console.error('Error loading practices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPractices();
  }, []);

  const formattedDate = new Date(extractionDate || '').toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Preparar las categorías para el menú de navegación
  const navigationCategories = Object.entries(practicesByCategory)
    .map(([name, practices]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      count: practices.length,
      icon: categoryIcons[name] || '📋'
    }))
    .sort((a, b) => b.count - a.count); // Ordenar por cantidad de prácticas

  // Crear un objeto con todas las categorías configuradas y sus prácticas
  const categoriesData: Record<string, CategoryData> = {};
  
  Object.entries(categoryIcons).forEach(([category, icon]) => {
    categoriesData[category] = {
      icon: icon,
      bgColor: category === 'Otros' ? 'bg-gray-50' : 'bg-amber-50',
      practices: practicesByCategory[category] || []
    };
  });

  // Función para renderizar las prácticas de una categoría
  const renderPractices = (practices: Practice[]) => {
    if (practices.length === 0) {
      return (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-md text-center">
          <p className="text-gray-500">No hay prácticas disponibles en esta categoría actualmente.</p>
        </div>
      );
    }

    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-md overflow-y-auto">
        {practices.map((practice) => (
          <JobListing key={practice.id} practice={practice} />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Title Section - Oportunidades Laborales */}
      <div className="mb-4 bg-[#028bbf] p-4 rounded-xl shadow-xl transform transition-transform duration-300 hover:scale-[1.01]">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xl">💼</span>
          <h2 className="text-2xl font-bold text-white">
            Oportunidades Laborales
          </h2>
        </div>
        <p className="text-white/90 ml-12 text-sm">
          @MyWorkIn #PrácticasProfesionales
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Info Card con fecha de actualización */}
        <div className="bg-white p-3 rounded-xl shadow-md flex items-center gap-3 border border-indigo-100">
          <div className="text-indigo-500 bg-indigo-50 p-1.5 rounded-full">
            <Info className="h-4 w-4" />
          </div>
          <p className="text-gray-700 text-xs">
            Última actualización: <span className="font-medium text-indigo-700">{formattedDate}</span>
          </p>
        </div>

        {/* Proceso de Aplicación */}
        <div className="bg-white p-3 rounded-xl shadow-md border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-[#028bbf] text-white h-6 w-6 rounded-full flex items-center justify-center mr-2 shadow-sm text-xs">1</span>
              <h3 className="text-sm font-bold text-gray-800">Proceso:</h3>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-lg mr-1">🔍</span>
                <span className="text-gray-700 text-xs">Encuentra</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-1">📋</span>
                <span className="text-gray-700 text-xs">Revisa</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-1">✅</span>
                <span className="text-gray-700 text-xs">Postula</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menú de navegación por categorías */}
      <CategoryNav categories={navigationCategories} />

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf]"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(practicesByCategory).map(([category, practices]) => (
            practices.length > 0 ? (
              <JobCategory 
                key={category}
                id={category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                icon={categoryIcons[category] || '📋'}
                title={`${category} (${practices.length})`}
                bgColor={category === 'Otros' ? 'bg-gray-50' : 'bg-amber-50'}
              >
                {renderPractices(practices)}
              </JobCategory>
            ) : null
          ))}
        </div>
      )}
    </>
  );
}