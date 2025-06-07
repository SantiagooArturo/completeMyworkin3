'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trackButtonClick, trackBotInteraction } from '@/utils/analytics';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function PostularContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const workyUrl = searchParams.get('worky') || 'https://mc.ht/s/SH1lIgc';
  const jobTitle = searchParams.get('title') || 'Práctica profesional';
  const jobUrl = searchParams.get('url') || '';

  const handleWorkyClick = () => {
    trackButtonClick('Entrenar con Worky');
    trackBotInteraction('Worky');
  };

  const handlePostularClick = () => {
    trackButtonClick('Postular ahora');
    if (jobUrl) {
      window.open(jobUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header con botón de regreso */}
        <div className="mb-8">
          <Link 
            href="/bolsa-trabajo"
            className="inline-flex items-center gap-2 text-[#028bbf] hover:text-[#027ba8] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Volver a la bolsa de trabajo
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para postular?
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {jobTitle}
            </p>
            <p className="text-gray-500">
              Entrena con Worky, nuestro bot de empleabilidad, y mejora tu CV y entrevista antes de postular.
            </p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tarjeta de Worky */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#028bbf] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.83L2.29 22l4.17-1.59C7.88 21.44 9.87 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.38 13.63c-.23.63-.95 1.15-1.55 1.3-.41.1-.95.18-2.76-.63-2.32-1.03-3.82-3.57-3.93-3.73-.12-.17-.96-1.28-.96-2.44 0-1.16.6-1.73.81-1.97.17-.19.37-.27.53-.27.16 0 .32 0 .46.02.15.01.35-.04.54.41.19.45.65 1.59.71 1.71.06.12.1.26.02.41-.08.15-.12.24-.24.37-.12.13-.25.29-.36.39-.11.1-.23.21-.1.41.13.2.59.86 1.27 1.39.87.68 1.6 1.03 1.77 1.14.17.11.27.09.37-.04.1-.13.43-.5.54-.67.11-.17.22-.14.37-.08.15.06 1.74.82 1.97.92.23.1.39.15.45.23.06.08.06.47-.17 1.1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Entrena con Worky
                </h2>
                <p className="text-gray-600">
                  Nuestro asistente de IA te ayuda a prepararte para el proceso de selección
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Análisis de CV con IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Simulación de entrevistas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Consejos personalizados</span>
                </div>
              </div>

              <a
                href={workyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#028bbf] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#027ba8] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                onClick={handleWorkyClick}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.83L2.29 22l4.17-1.59C7.88 21.44 9.87 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.38 13.63c-.23.63-.95 1.15-1.55 1.3-.41.1-.95.18-2.76-.63-2.32-1.03-3.82-3.57-3.93-3.73-.12-.17-.96-1.28-.96-2.44 0-1.16.6-1.73.81-1.97.17-.19.37-.27.53-.27.16 0 .32 0 .46.02.15.01.35-.04.54.41.19.45.65 1.59.71 1.71.06.12.1.26.02.41-.08.15-.12.24-.24.37-.12.13-.25.29-.36.39-.11.1-.23.21-.1.41.13.2.59.86 1.27 1.39.87.68 1.6 1.03 1.77 1.14.17.11.27.09.37-.04.1-.13.43-.5.54-.67.11-.17.22-.14.37-.08.15.06 1.74.82 1.97.92.23.1.39.15.45.23.06.08.06.47-.17 1.1z" clipRule="evenodd"/>
                </svg>
                Entrenar con Worky
              </a>
            </div>

            {/* Tarjeta de Postulación */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z M14 2v6h6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Postular Directamente
                </h2>
                <p className="text-gray-600">
                  Si ya tienes tu CV listo, puedes postular directamente a la oferta
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-yellow-800">Recomendación</span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    Te recomendamos entrenar con Worky primero para aumentar tus posibilidades de éxito.
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>Requisitos básicos:</strong></p>
                  <ul className="space-y-1">
                    <li>• CV actualizado en formato PDF</li>
                    <li>• Carta de presentación (opcional)</li>
                    <li>• Certificados relevantes</li>
                  </ul>
                </div>
              </div>

              {jobUrl ? (
                <button
                  onClick={handlePostularClick}
                  className="w-full bg-gray-100 text-gray-800 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z M14 2v6h6" />
                  </svg>
                  Postular Ahora
                </button>
              ) : (
                <div className="w-full bg-gray-50 text-gray-500 px-6 py-4 rounded-xl text-center border border-gray-200">
                  <p className="text-sm">URL de postulación no disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Sección adicional con tips */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Tips para una postulación exitosa
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z M14 2v6h6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">CV Optimizado</h4>
                <p className="text-gray-600 text-sm">Asegúrate de que tu CV esté adaptado a la oferta específica</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Practica la Entrevista</h4>
                <p className="text-gray-600 text-sm">Usa Worky para simular entrevistas y recibir feedback</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Sé Rápido</h4>
                <p className="text-gray-600 text-sm">Las mejores oportunidades se llenan rápidamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostularPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
        <p className="ml-2">Cargando...</p>
      </div>
    }>
      <PostularContent />
    </Suspense>
  );
}
