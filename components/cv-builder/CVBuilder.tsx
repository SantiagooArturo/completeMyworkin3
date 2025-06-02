'use client';

import React, { useState, useEffect } from 'react';
import { CVData, CVDataHarvard, PersonalInfo, Education, WorkExperience, Skill, SkillCategory, Project, Certification } from '@/types/cv';
import ProjectsForm from './forms/ProjectsForm';
import CertificationsForm from './forms/CertificationsForm';
import StudentExperienceForm from './forms/StudentExperienceForm';
import SkillsFormHarvard from './forms/SkillsFormHarvard';
import HobbiesForm from './forms/HobbiesForm';
import { cvBuilderService } from '@/services/cvBuilderService';
import { CVPDFGeneratorHarvard } from '@/services/cvPDFGeneratorHarvard';
import { CVPDFGeneratorHarvardImproved } from '@/services/cvPDFGeneratorHarvardImproved';
import { CVDataConverter } from '@/lib/cv/CVDataConverter';
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
import { Save, Download, Eye, EyeOff, FileText, CheckCircle, AlertCircle, Info, GraduationCap } from 'lucide-react';
import CVBuilderTabs from './CVBuilderTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  projects: [],
  certifications: []
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
  const [isStudentMode, setIsStudentMode] = useState(true); // Modo estudiante por defecto

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
        // Si es CVDataHarvard, convertir a CVData
        const data = savedCV.data;
        if ('skillCategories' in data) {
          // Es CVDataHarvard, convertir a CVData
          setCVData(CVDataConverter.fromHarvardFormat(data as any));
        } else {
          // Es CVData normal
          setCVData(data as CVData);
        }
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

  // Función para actualizar skill categories (formato Harvard)
  const updateSkillCategories = (skillCategories: SkillCategory[]) => {
    // Convertir skillCategories a skills tradicionales para mantener compatibilidad
    const skills: Skill[] = [];
    skillCategories.forEach((category, catIndex) => {
      category.skills.forEach((skill, skillIndex) => {
        skills.push({
          id: `skill-${catIndex}-${skillIndex}`,
          name: skill.name,
          level: skill.level || 'Intermedio' as any,
          category: category.category === 'Software' ? 'Technical' : 
                    category.category === 'Gestión de proyectos' ? 'Leadership' :
                    category.category === 'Comunicación' ? 'Communication' :
                    category.category === 'Investigación' ? 'Research' : 'Technical'
        });
      });
    });
    
    setCVData(prev => ({ ...prev, skills }));
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

    // Validar información personal obligatoria
    if (!cvData.personalInfo.fullName.trim()) {
      errors.push('El nombre completo es obligatorio');
    }
    if (!cvData.personalInfo.email.trim()) {
      errors.push('El correo electrónico es obligatorio');
    }
    if (!cvData.personalInfo.phone.trim()) {
      errors.push('El teléfono es obligatorio');
    }
    if (!cvData.personalInfo.summary.trim()) {
      errors.push('El resumen profesional es obligatorio');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cvData.personalInfo.email && !emailRegex.test(cvData.personalInfo.email)) {
      errors.push('El formato del correo electrónico no es válido');
    }

    // Validar que tenga al menos una educación
    if (cvData.education.length === 0) {
      errors.push('Debe incluir al menos una formación académica');
    }

    // Validar educación
    cvData.education.forEach((edu, index) => {
      if (!edu.institution.trim()) {
        errors.push(`La institución en educación ${index + 1} es obligatoria`);
      }
      if (!edu.degree.trim()) {
        errors.push(`El título en educación ${index + 1} es obligatorio`);
      }
    });

    // Para estudiantes: Validar que tenga EXPERIENCIA O PROYECTOS (no ambos obligatorios)
    const hasWorkExperience = cvData.workExperience.length > 0 && 
      cvData.workExperience.some(exp => exp.company.trim() && exp.position.trim());
    const hasProjects = cvData.projects.length > 0 && 
      cvData.projects.some(proj => proj.name.trim() && proj.description.trim());

    if (!hasWorkExperience && !hasProjects) {
      errors.push('Como estudiante, debes incluir al menos experiencia laboral O proyectos académicos/personales');
    }

    // Validar que tenga habilidades
    if (cvData.skills.length === 0) {
      errors.push('Debe incluir al menos algunas habilidades');
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
      // Usar validación específica para estudiantes
      const validation = isStudentMode 
        ? validateStudentCV(cvData)
        : cvBuilderService.validateCVData(cvData);
        
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      const dataForPDF = isStudentMode 
        ? CVDataConverter.fromHarvardFormat(CVDataConverter.toHarvardFormat(cvData))
        : cvData;

      await CVPDFGeneratorHarvard.generatePDF(dataForPDF);
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
          <div className="flex items-center justify-between gap-4 mt-2">
            <input
              type="text"
              value={cvTitle}
              onChange={(e) => setCVTitle(e.target.value)}
              className="text-lg font-medium bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-[#028bbf] focus:ring-1 focus:ring-[#028bbf] outline-none shadow-sm min-w-[250px]"
              placeholder="Nombre de tu CV"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-[#028bbf]" />
                <label className="text-sm font-medium text-gray-700">Modo estudiante</label>
                <input
                  type="checkbox"
                  checked={isStudentMode}
                  onChange={(e) => setIsStudentMode(e.target.checked)}
                  className="w-4 h-4 text-[#028bbf] bg-gray-100 border-gray-300 rounded focus:ring-[#028bbf] focus:ring-2"
                />
              </div>
            </div>
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
                isStudentMode={isStudentMode}
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
                    {isStudentMode ? (
                      <SkillsFormHarvard
                        skills={cvData.skills}
                        skillCategories={CVDataConverter.toHarvardFormat(cvData).skillCategories}
                        onUpdateSkills={updateSkills}
                        onUpdateSkillCategories={updateSkillCategories}
                      />
                    ) : (
                      <SkillsForm
                        skills={cvData.skills}
                        onUpdate={updateSkills}
                      />
                    )}
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
            <CVPreviewHarvard 
              cvData={isStudentMode ? CVDataConverter.fromHarvardFormat(CVDataConverter.toHarvardFormat(cvData)) : cvData}
              isStudentMode={isStudentMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}
