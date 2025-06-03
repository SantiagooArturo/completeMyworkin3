'use client';

import { francescoLucchesiCV } from '@/types/cv';
import { CVPDFGeneratorSimple } from '@/services/cvPDFGeneratorSimple';
import { useState } from 'react';

export default function PruebaGenerationPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('🔧 Datos del CV para prueba:', francescoLucchesiCV);
      
      // Verificar que el CV tiene datos válidos
      if (!francescoLucchesiCV.personalInfo.fullName) {
        throw new Error('Los datos del CV están incompletos');
      }
      
      // Generar el PDF
      await CVPDFGeneratorSimple.generatePDF(francescoLucchesiCV);
      
      console.log('✅ PDF generado exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test Generación PDF
          </h1>
          
          <p className="text-gray-600 mb-6">
            Prueba la generación de PDF con el CV de ejemplo de Francesco Lucchesi
          </p>
          
          <div className="space-y-4">
            {/* Información del CV de prueba */}
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Datos del CV de prueba:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Nombre:</strong> {francescoLucchesiCV.personalInfo.fullName}</li>
                <li>• <strong>Email:</strong> {francescoLucchesiCV.personalInfo.email}</li>
                <li>• <strong>Experiencias:</strong> {francescoLucchesiCV.workExperience.length}</li>
                <li>• <strong>Educación:</strong> {francescoLucchesiCV.education.length}</li>
                <li>• <strong>Habilidades:</strong> {francescoLucchesiCV.skills.length}</li>
                <li>• <strong>Certificaciones:</strong> {francescoLucchesiCV.certifications?.length || 0}</li>
              </ul>
            </div>
            
            {/* Botón para generar PDF */}
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generando PDF...
                </div>
              ) : (
                'Generar PDF de Prueba'
              )}
            </button>
            
            {/* Mostrar error si ocurre */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-400">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error al generar PDF</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-blue-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Instrucciones</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Haz clic en "Generar PDF de Prueba"</li>
                      <li>Se abrirá una nueva pestaña con el PDF</li>
                      <li>Verifica que las fechas aparezcan correctamente</li>
                      <li>Revisa la sección de educación y experiencia</li>
                      <li>Chequea que "Presente" y "Actualidad" aparezcan cuando corresponda</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
