'use client';

import React, { useState, useEffect } from 'react';
import { CVData, PersonalInfo, Education, WorkExperience, Skill } from '@/types/cv';
import { cvBuilderService } from '@/services/cvBuilderService';
import { CVPDFGeneratorHarvard } from '@/services/cvPDFGeneratorHarvard';
import { useAuth } from '@/hooks/useAuth';
import PersonalInfoForm from './forms/PersonalInfoForm';
import EducationFormHarvard from './forms/EducationFormHarvard';
import WorkExperienceForm from './forms/WorkExperienceForm';
import SkillsForm from './forms/SkillsForm';
import CVPreviewHarvard from './CVPreviewHarvard';
import HarvardFormatGuide from './HarvardFormatGuide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Save, Download, Eye, EyeOff, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import CVBuilderTabs from './CVBuilderTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const initialCVData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
    summary: ''
  },
  education: [],
  workExperience: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  references: []
};

interface CVBuilderProps {
  cvId?: string; // Para editar CV existente
}

export default function CVBuilder({ cvId }: CVBuilderProps) {
  const { user } = useAuth();
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvTitle, setCVTitle] = useState('Mi CV');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (cvId && user) {
      loadExistingCV();
    }
  }, [cvId, user]);

  const loadExistingCV = async () => {
    try {
      setIsLoading(true);
      const savedCV = await cvBuilderService.getCV(cvId!);
      if (savedCV) {
        setCVData(savedCV.data);
        setCVTitle(savedCV.title);
      }
    } catch (error) {
      console.error('Error cargando CV:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePersonalInfo = (personalInfo: PersonalInfo) => {
    setCVData(prev => ({ ...prev, personalInfo }));
    clearValidationErrors();
  };

  const updateEducation = (education: Education[]) => {
    setCVData(prev => ({ ...prev, education }));
    clearValidationErrors();
  };

  const updateWorkExperience = (workExperience: WorkExperience[]) => {
    setCVData(prev => ({ ...prev, workExperience }));
    clearValidationErrors();
  };

  const updateSkills = (skills: Skill[]) => {
    setCVData(prev => ({ ...prev, skills }));
  };

  const clearValidationErrors = () => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSaveCV = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar tu CV');
      return;
    }

    try {
      setIsSaving(true);
      
      const validation = cvBuilderService.validateCVData(cvData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      if (cvId) {
        await cvBuilderService.updateCV(cvId, cvData, cvTitle);
      } else {
        await cvBuilderService.saveCV(user, cvData, cvTitle, 'harvard');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error al guardar CV:', error);
      alert('Error al guardar el CV. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const validation = cvBuilderService.validateCVData(cvData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      await CVPDFGeneratorHarvard.generatePDF(cvData);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const getCompletionPercentage = () => {
    const sections = [
      { 
        key: 'personal', 
        isComplete: !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone && cvData.personalInfo.summary)
      },
      { 
        key: 'education', 
        isComplete: cvData.education.length > 0 && cvData.education.every(edu => edu.institution && edu.degree)
      },
      { 
        key: 'experience', 
        isComplete: cvData.workExperience.length > 0 && cvData.workExperience.every(exp => exp.company && exp.position && exp.achievements.length > 0)
      },
      { 
        key: 'skills', 
        isComplete: cvData.skills.length > 0
      }
    ];

    const completedSections = sections.filter(section => section.isComplete).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-[#028bbf]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear CV - Formato Harvard</h1>
              <p className="text-gray-600">Progreso: {getCompletionPercentage()}% completado</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={cvTitle}
              onChange={(e) => setCVTitle(e.target.value)}
              className="text-lg font-medium bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-[#028bbf] focus:ring-1 focus:ring-[#028bbf] outline-none shadow-sm min-w-[250px]"
              placeholder="Nombre de tu CV"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">{showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}</span>
            <span className="sm:hidden">{showPreview ? 'Ocultar' : 'Ver'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 shadow-sm"
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">{showGuide ? 'Ocultar Guía' : 'Guía Harvard'}</span>
            <span className="sm:hidden">Guía</span>
          </Button>
          
          <Button 
            onClick={handleSaveCV} 
            disabled={isSaving}
            className="bg-[#028bbf] hover:bg-[#027ba8] text-white flex items-center gap-2 shadow-sm"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isSaving ? 'Guardando...' : 'Guardar CV'}</span>
            <span className="sm:hidden">{isSaving ? '...' : 'Guardar'}</span>
          </Button>
            
          <Button 
            onClick={handleDownloadPDF} 
            variant="secondary"
            className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            CV guardado exitosamente
          </AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-2">Por favor, completa los siguientes campos:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

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
              <CVBuilderTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                cvData={cvData}
              >
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

                <TabsContent value="experience" className="mt-6">
                  <WorkExperienceForm
                    workExperience={cvData.workExperience}
                    onUpdate={updateWorkExperience}
                  />
                </TabsContent>

                <TabsContent value="skills" className="mt-6">
                  <SkillsForm
                    skills={cvData.skills}
                    onUpdate={updateSkills}
                  />
                </TabsContent>
              </CVBuilderTabs>
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
