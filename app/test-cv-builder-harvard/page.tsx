'use client';

import React from 'react';
import CVBuilder from '@/components/cv-builder/CVBuilder';

export default function TestCVBuilderHarvardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test CV Builder - Harvard Format Integration</h1>
      <p className="text-gray-600 mb-4">
        Esta página prueba la integración completa del formato Harvard en el CVBuilder.
        Cambia a formato Harvard y activa la guía para ver el componente HarvardFormatGuide integrado.
      </p>
      <CVBuilder />
    </div>
  );
}
