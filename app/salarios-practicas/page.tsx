'use client';

import { useState } from 'react';
import { TrendingUp, Building2, Users, DollarSign, BarChart3, Filter, Search, Sparkles, ArrowRight, ExternalLink, Info } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function SalariosPracticasPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Estadísticas destacadas
  const stats = [
    {
      icon: Building2,
      value: "150+",
      label: "Empresas",
      description: "Datos reales de salarios",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      value: "2,500+",
      label: "Practicantes",
      description: "Información verificada",
      color: "bg-green-500"
    },
    {
      icon: DollarSign,
      value: "S/1,200",
      label: "Promedio",
      description: "Salario mensual",
      color: "bg-purple-500"
    },
    {
      icon: TrendingUp,
      value: "+15%",
      label: "Crecimiento",
      description: "Último año",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Espaciador para compensar el header fijo */}
      <div className="h-[52px]"></div>

      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#028bbf] via-[#028bbf] to-[#027ba8] py-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">Datos actualizados semanalmente</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Salarios de
              <span className="block text-white">
                 Prácticas 2025
               </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg text-blue-100 mb-4 max-w-2xl mx-auto leading-relaxed">
              Descubre los salarios reales de practicantes en las mejores empresas del Perú. 
              Información transparente para que puedas negociar mejor.
            </p>


          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>



      {/* Main Content Section */}
      <div className="py-4">
        <div className="container mx-auto px-4 max-w-6xl">


          {/* Airtable Embed Section */}
          <div id="airtable-section" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Embed Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-[#028bbf] p-2 rounded-lg text-white mr-3">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Base de Datos de Salarios</h3>
                    <p className="text-sm text-gray-600">Información actualizada de practicantes en Perú</p>
                  </div>
                </div>
                <a 
                  href="https://airtable.com/appRwqu5TD8D29jxc/shrLcWRKfFzEwSttt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[#028bbf] hover:text-[#027ba8] transition-colors text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Abrir en pantalla completa
                </a>
              </div>
            </div>

            {/* Airtable Embed */}
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando datos de salarios...</p>
                    <p className="text-sm text-gray-500 mt-1">Esto puede tomar unos segundos</p>
                  </div>
                </div>
              )}
              
              <iframe
                className="airtable-embed w-full"
                src="https://airtable.com/embed/appRwqu5TD8D29jxc/shrLcWRKfFzEwSttt?backgroundColor=blue&viewControls=on"
                frameBorder="0"
                onLoad={() => setIsLoading(false)}
                style={{ 
                  minHeight: '600px',
                  height: '80vh',
                  background: 'transparent'
                }}
                title="Salarios de Prácticas en Perú"
              />
            </div>
          </div>

          {/* Bottom CTA */}
                     <div className="mt-12 text-center">
             <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">¿Tienes información adicional?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Ayúdanos a mantener esta base de datos actualizada. Si tienes información sobre salarios 
                de prácticas, compártela con la comunidad.
              </p>
              <a 
                href="mailto:contacto@myworkin.com?subject=Información de Salarios de Prácticas"
                className="inline-flex items-center bg-white text-[#028bbf] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Contribuir con Datos
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 