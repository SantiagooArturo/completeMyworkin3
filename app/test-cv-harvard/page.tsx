'use client';

import React from 'react';
import HarvardFormatGuide from '@/components/cv-builder/HarvardFormatGuide';

export default function TestCVHarvardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Prueba del Componente Harvard Format Guide
        </h1>
        <HarvardFormatGuide />
      </div>
    </div>
  );
}
