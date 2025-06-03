'use client';

import React from 'react';
import CVPreview from '@/components/cv-builder/CVPreview';
import { francescoLucchesiCV } from '@/types/cv';

export default function PruebaPreviewPage() {
  // Modificar los datos para tener campos "current" activados
  const testCVData = {
    ...francescoLucchesiCV,
    workExperience: [
      {
        ...francescoLucchesiCV.workExperience[0],
        current: true, // Trabajo actual
        endDate: '' // Sin fecha de fin
      },
      ...francescoLucchesiCV.workExperience.slice(1)
    ],
    education: [
      {
        ...francescoLucchesiCV.education[0],
        current: true, // Estudiando actualmente
        endDate: '' // Sin fecha de fin
      },
      ...francescoLucchesiCV.education.slice(1)
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Prueba de Vista Previa CV - Campo "Current"
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Datos de Prueba:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Experiencia laboral:</strong> Yape marcado como "Trabajo actual" (current: true)</li>
              <li>• <strong>Educación:</strong> Universidad de Lima marcada como "Actualmente estudiando" (current: true)</li>
              <li>• <strong>Fechas de fin:</strong> Removidas cuando current = true</li>
            </ul>
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-6">
            <CVPreview cvData={testCVData} />
          </div>
        </div>
      </div>
    </div>
  );
}
