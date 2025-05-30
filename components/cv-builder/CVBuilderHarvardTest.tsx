'use client';

import React, { useState } from 'react';
import { CVData } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, EyeOff, Info } from 'lucide-react';
import CVPreviewHarvard from './CVPreviewHarvard';
import HarvardFormatGuide from './HarvardFormatGuide';
import PersonalInfoForm from './forms/PersonalInfoForm';
import EducationFormHarvard from './forms/EducationFormHarvard';

const initialCVData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
    website: '',
    summary: ''
  },
  education: [],
  workExperience: [],
  skills: [],
  references: [],
  projects: [],
  certifications: [],
  languages: [],
};

export default function CVBuilderHarvardTest() {
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const updatePersonalInfo = (personalInfo: any) => {
    setCVData(prev => ({ ...prev, personalInfo }));
  };

  const updateEducation = (education: any) => {
    setCVData(prev => ({ ...prev, education }));
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 2; // Solo personal y educación por ahora

    if (cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.summary) completed++;
    if (cvData.education.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-[#028bbf]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear CV - Formato Harvard (Prueba)</h1>
              <p className="text-gray-600">Progreso: {getCompletionPercentage()}% completado</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Info className="h-4 w-4" />
            {showGuide ? 'Ocultar Guía' : 'Guía Harvard'}
          </Button>
        </div>
      </div>

      {/* Guía de Formato Harvard */}
      {showGuide && (
        <HarvardFormatGuide />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formularios */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del CV</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 text-xs">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="education">Educación</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                  <PersonalInfoForm
                    personalInfo={cvData.personalInfo}
                    onUpdate={updatePersonalInfo}
                  />
                </TabsContent>

                <TabsContent value="education" className="mt-6">
                  <EducationFormHarvard
                    education={cvData.education}
                    onUpdate={updateEducation}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Vista Previa */}
        {showPreview && (
          <div className="lg:sticky lg:top-6">
            <CVPreviewHarvard cvData={cvData} />
          </div>
        )}
      </div>
    </div>
  );
}
