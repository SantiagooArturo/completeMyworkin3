'use client';

import React from 'react';
import CVBuilder from '@/components/cv-builder/CVBuilder';

export default function TestCVBuilderPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test CV Builder - Harvard Format</h1>
      <CVBuilder />
    </div>
  );
}
