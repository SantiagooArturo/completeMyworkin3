'use client';

import React, { useState, useEffect } from 'react';
import { CVData, PersonalInfo, Education, WorkExperience, Skill, Project, Certification } from '@/types/cv';
import ProjectsForm from './forms/ProjectsForm';
import CertificationsForm from './forms/CertificationsForm';
import StudentExperienceForm from './forms/StudentExperienceForm';
import HobbiesForm from './forms/HobbiesForm';
import { cvBuilderService } from '@/services/cvBuilderService';
import { CVPDFGeneratorSimple } from '@/services/cvPDFGeneratorSimple';
import { useAuth } from '@/hooks/useAuth';
import PersonalInfoForm from './forms/PersonalInfoForm';
import EducationForm from './forms/EducationForm';
import WorkExperienceForm from './forms/WorkExperienceForm';
import SkillsForm from './forms/SkillsForm';
import CVPreview from './CVPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Save, Download, Eye, EyeOff, FileText, CheckCircle, AlertCircle, Info, GraduationCap } from 'lucide-react';
import CVBuilderTabs from './CVBuilderTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditService } from '@/services/creditService';
import { useCredits } from '@/hooks/useCredits';

import GuidePanel from './GuidePanel';

const  initialCVData: CVData = {
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
  hobbies: [],
  languages: [],
  volunteer: [],
  projects: [],
  certifications: []
};

interface CVBuilderProps {
  cvId?: string; // Para editar CV existente
}

export default function CVBuilder({ cvId }: CVBuilderProps) {
  const { user } = useAuth();
  const { credits, hasEnoughCredits, refreshCredits } = useCredits(user);
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvTitle, setCVTitle] = useState('Mi CV');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isStudentMode, setIsStudentMode] = useState(true); // Modo estudiante por defecto
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (cvId && user) {
      loadExistingCV();
    }
  }, [cvId, user]);

  // Detectar cambios no guardados
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [cvData, cvTitle]);

  // Evento beforeunload para advertir sobre cambios no guardados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const loadExistingCV = async () => {
    try {
      setIsLoading(true);      const savedCV = await cvBuilderService.getCV(cvId!);
      if (savedCV) {
        // Cargar datos del CV
        setCVData(savedCV.data as CVData);
        setCVTitle(savedCV.title);
        setHasUnsavedChanges(false); // No hay cambios no guardados al cargar
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

  const updateProjects = (projects: Project[]) => {
    setCVData(prev => ({ ...prev, projects }));
    clearValidationErrors();
  };

  const updateCertifications = (certifications: Certification[]) => {
    setCVData(prev => ({ ...prev, certifications }));
    clearValidationErrors();
  };

  // Función para actualizar hobbies
  const updateHobbies = (hobbies: string[]) => {
    setCVData(prev => ({ ...prev, hobbies }));
    clearValidationErrors();
  };

  const clearValidationErrors = () => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Validación específica para estudiantes
  const validateStudentCV = (cvData: CVData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validar información personal obligatoria SOLO si todos los campos están vacíos
    const personal = cvData.personalInfo;
    const personalFields = [personal.fullName, personal.email, personal.phone, personal.summary];
    if (personalFields.every(f => !f.trim())) {
      errors.push('Completa al menos un campo de información personal');
    }

    // Validar que tenga al menos una educación si la sección no está vacía
    if (cvData.education.length > 0) {
      cvData.education.forEach((edu, index) => {
        if (!edu.institution.trim()) {
          errors.push(`La institución en educación ${index + 1} es obligatoria`);
        }
      });
    }

    // Experiencia o proyectos: solo si hay datos, validar campos mínimos
    // Solo validar que el nombre de la empresa o proyecto no esté vacío, pero permitir guardar aunque falten otros campos
    // No validar logros, fechas, ni otros detalles para permitir guardado parcial
    if (cvData.workExperience.length > 0) {
      cvData.workExperience.forEach((exp, index) => {
        if (!exp.company.trim()) {
          errors.push(`La empresa en experiencia ${index + 1} es obligatoria`);
        }
      });
    }
    if (cvData.projects.length > 0) {
      cvData.projects.forEach((proj, index) => {
        if (!proj.name.trim()) {
          errors.push(`El nombre del proyecto ${index + 1} es obligatorio`);
        }
      });
    }
    // Habilidades: solo si hay alguna, validar nombre
    if (cvData.skills.length > 0) {
      cvData.skills.forEach((skill, index) => {
        if (!skill.name.trim()) {
          errors.push(`El nombre de la habilidad ${index + 1} es obligatorio`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };
  const handleSaveCV = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar tu CV');
      return;
    }

    try {
      setIsSaving(true);
      
      // Usar validación específica para estudiantes
      const validation = isStudentMode 
        ? validateStudentCV(cvData)
        : cvBuilderService.validateCVData(cvData);
        
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      // Solo consumir crédito para CVs nuevos (no para ediciones)
      if (!cvId) {
        // Verificar si tiene suficientes créditos
        if (!hasEnoughCredits('cv-creation')) {
          alert('No tienes suficientes créditos para crear un CV. Necesitas 1 crédito.');
          return;
        }

        // Consumir crédito antes de guardar
        const consumeResult = await CreditService.consumeCredits(user, 'cv-creation', 'Creación de CV');
        
        if (!consumeResult.success) {
          alert(consumeResult.message || 'Error al procesar los créditos');
          return;
        }
        
        // Actualizar balance de créditos en la UI
        await refreshCredits();
      }

      if (cvId) {
        await cvBuilderService.updateCV(cvId, cvData, cvTitle);
      } else {
        await cvBuilderService.saveCV(user, cvData, cvTitle, 'harvard');
      }

      setHasUnsavedChanges(false); // Marcar como guardado
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
      // Usar validación específica para estudiantes
      const validation = isStudentMode 
        ? validateStudentCV(cvData)
        : cvBuilderService.validateCVData(cvData);
        
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }
      await CVPDFGeneratorSimple.generatePDF(cvData);
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
        key: 'experience_projects', 
        // Para estudiantes: experiencia O proyectos es suficiente
        isComplete: isStudentMode 
          ? (cvData.workExperience.length > 0 || cvData.projects.length > 0)
          : (cvData.workExperience.length > 0 && cvData.workExperience.every(exp => exp.company && exp.position && exp.achievements.length > 0))
      },
      { 
        key: 'skills_certifications', 
        isComplete: cvData.skills.length > 0 || cvData.certifications.length > 0
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
    <>
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
          <div className="flex items-center justify-between gap-4 mt-2">
            <input
              type="text"
              value={cvTitle}
              onChange={(e) => setCVTitle(e.target.value)}
              className="text-lg font-medium bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-[#028bbf] focus:ring-1 focus:ring-[#028bbf] outline-none shadow-sm min-w-[250px]"
              placeholder="Nombre de tu CV"
            />``
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

      {/* Panel de Guía Modal */}
      {showGuide && <GuidePanel onClose={() => setShowGuide(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formularios */}
        <div className="space-y-6">
          <Card className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <CardHeader>
              <CardTitle>Información del CV</CardTitle>
            </CardHeader>
            <CardContent>
              <CVBuilderTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                cvData={cvData}
                isStudentMode={isStudentMode}
                onSave={handleSaveCV}
                isSaving={isSaving}
              >
                <TabsContent value="personal" className="mt-6">
                  <PersonalInfoForm
                    personalInfo={cvData.personalInfo}
                    onUpdate={updatePersonalInfo}
                  />
                </TabsContent>

                <TabsContent value="education" className="mt-6">
                  <EducationForm
                    education={cvData.education}
                    onUpdate={updateEducation}
                  />
                </TabsContent>
                
                <TabsContent value="experience_projects" className="mt-6">
                  {isStudentMode ? (
                    <StudentExperienceForm
                      workExperience={cvData.workExperience}
                      projects={cvData.projects}
                      onUpdateWorkExperience={updateWorkExperience}
                      onUpdateProjects={updateProjects}
                    />
                  ) : (
                    <div className="space-y-6">
                      <WorkExperienceForm
                        workExperience={cvData.workExperience}
                        onUpdate={updateWorkExperience}
                      />
                      <ProjectsForm
                        projects={cvData.projects}
                        onUpdate={updateProjects}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="skills_certifications" className="mt-6">
                  <div className="space-y-6">
                    <SkillsForm
                      skills={cvData.skills}
                      onUpdate={updateSkills}
                      cvData={cvData} // Pasar el contexto completo del CV
                    />
                    <CertificationsForm 
                      certifications={cvData.certifications}
                      onUpdate={updateCertifications}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="hobbies" className="mt-6">
                  <HobbiesForm
                    hobbies={cvData.hobbies || []}
                    onUpdate={updateHobbies}
                  />
                </TabsContent>
              </CVBuilderTabs>
            </CardContent>
          </Card>
        </div>

        {/* Vista Previa */}
        {showPreview && (
          <div className="lg:sticky lg:top-6">
            <CVPreview 
              cvData={cvData}
            />
          </div>
        )}
      </div>
    </>
  );
}
