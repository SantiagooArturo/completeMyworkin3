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
import PageWarningModal from './PageWarningModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Save, Download, Eye, EyeOff, FileText, CheckCircle, AlertCircle, Info, Monitor, Layout, PanelLeft, PanelRight } from 'lucide-react';
import CVBuilderTabs from './CVBuilderTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditService } from '@/services/creditService';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from "@/hooks/use-toast";

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
  onSave?: (cvData: any, cvId: string) => Promise<void>; // Callback personalizado al guardar
  showBackButton?: boolean; // Mostrar botón de retroceso
  autoRedirect?: boolean; // Redirigir automáticamente después de guardar
}

export default function CVBuilder({ cvId, onSave, showBackButton = true, autoRedirect = true }: CVBuilderProps) {
  const { user } = useAuth();
  const { credits, hasEnoughCredits, refreshCredits } = useCredits(user);
  const { toast } = useToast();
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(true);
  const [viewMode, setViewMode] = useState<'both' | 'form-only' | 'preview-only'>('both'); // Nuevo estado para tipo de vista
  const [showGuide, setShowGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvTitle, setCVTitle] = useState('Mi CV');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isStudentMode, setIsStudentMode] = useState(true); // Modo estudiante por defecto
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, currentPageHeight: 0 });
  const [showPageWarning, setShowPageWarning] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(1);
  const [pdfFileName, setPdfFileName] = useState<string>('CV.pdf');

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

    // Atajo de teclado para cambiar vistas (Ctrl+Shift+V o Cmd+Shift+V)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        if (viewMode === 'both') {
          handleViewModeChange('form-only');
        } else if (viewMode === 'form-only') {
          handleViewModeChange('preview-only');
        } else {
          handleViewModeChange('both');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasUnsavedChanges, viewMode]);

  const loadExistingCV = async () => {
    try {
      setIsLoading(true);
      const savedCV = await cvBuilderService.getCV(cvId!);
      if (savedCV) {
        setCVData(savedCV.data as CVData);
        setCVTitle(savedCV.title);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error cargando CV:', error);
      toast({
        title: "Error al cargar CV",
        description: "No se pudo cargar el CV. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para manejar cambios de vista
  const handleViewModeChange = (mode: 'both' | 'form-only' | 'preview-only') => {
    setViewMode(mode);
    // Actualizar showPreview para compatibilidad con código existente
    setShowPreview(mode === 'both' || mode === 'preview-only');
  };

  // Función legacy para compatibilidad
  const togglePreview = () => {
    if (viewMode === 'both') {
      handleViewModeChange('form-only');
    } else if (viewMode === 'form-only') {
      handleViewModeChange('preview-only');
    } else {
      handleViewModeChange('both');
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
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para guardar tu CV",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const validation = isStudentMode 
        ? validateStudentCV(cvData)
        : cvBuilderService.validateCVData(cvData);
        
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast({
          title: "Campos incompletos",
          description: "Por favor, completa todos los campos obligatorios marcados en rojo.",
          variant: "destructive"
        });
        return;
      }

      if (!cvId) {
        if (!hasEnoughCredits('cv-creation')) {
          toast({
            title: "Créditos insuficientes",
            description: "No tienes suficientes créditos para crear un CV. Necesitas 1 crédito.",
            variant: "destructive"
          });
          return;
        }

        const consumeResult = await CreditService.consumeCredits(user, 'cv-creation', 'Creación de CV');
        
        if (!consumeResult.success) {
          toast({
            title: "Error al procesar créditos",
            description: consumeResult.message || 'Error al procesar los créditos',
            variant: "destructive"
          });
          return;
        }
        
        await refreshCredits();
      }

      let savedCvId = cvId;
      
      if (cvId) {
        await cvBuilderService.updateCV(cvId, cvData, cvTitle);
      } else {
        savedCvId = await cvBuilderService.saveCV(user, cvData, cvTitle, 'harvard');
      }

      setHasUnsavedChanges(false);
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>CV guardado exitosamente</span>
          </div>
        ),
        description: cvId ? "Tu CV ha sido actualizado correctamente" : "Tu CV se ha creado y guardado correctamente",
        className: "border-green-200 bg-green-50"
      });
      
      if (onSave && savedCvId) {
        await onSave(cvData, savedCvId);
      }
    } catch (error) {
      console.error('Error al guardar CV:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el CV. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleDownloadPDF = async () => {
    try {
      const validation = isStudentMode 
        ? validateStudentCV(cvData)
        : cvBuilderService.validateCVData(cvData);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast({
          title: "No se puede descargar el PDF",
          description: "Por favor, completa todos los campos obligatorios antes de descargar.",
          variant: "destructive"
        });
        return;
      }

      const { blob, totalPages, fileName } = await CVPDFGeneratorSimple.generatePDF(cvData);
      setPdfBlob(blob);
      setPdfPageCount(totalPages);
      setPdfFileName(fileName || 'CV.pdf');

      if (totalPages > 1) {
        setShowPageWarning(true);
        return;
      }

      await CVPDFGeneratorSimple.downloadPDFBlob(blob, fileName);
      
      toast({
        title: "PDF descargado exitosamente",
        description: "Tu CV se ha descargado correctamente.",
        className: "border-green-200 bg-green-50"
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmDownload = async () => {
    if (pdfBlob) {
      setShowPageWarning(false);
      await CVPDFGeneratorSimple.downloadPDFBlob(pdfBlob, pdfFileName);
      
      toast({
        title: "PDF descargado exitosamente",
        description: "Tu CV se ha descargado correctamente.",
        className: "border-green-200 bg-green-50"
      });
    }
  };

  const handlePageCalculated = (calculatedPageInfo: { totalPages: number; currentPageHeight: number }) => {
    setPageInfo(calculatedPageInfo);
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
              className="text-lg font-medium bg-white border border-gray-300 mb-2 rounded-md px-3 py-2 text-gray-900 focus:border-[#028bbf] focus:ring-1 focus:ring-[#028bbf] outline-none shadow-sm min-w-[250px]"
              placeholder="Nombre de tu CV"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Dropdown para seleccionar vista */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
              >
                {viewMode === 'both' ? <Layout className="h-4 w-4" /> : 
                 viewMode === 'form-only' ? <PanelLeft className="h-4 w-4" /> : 
                 <PanelRight className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {viewMode === 'both' ? 'Vista Dividida' : 
                   viewMode === 'form-only' ? 'Solo Formulario' : 
                   'Solo Vista Previa'}
                </span>
                <span className="sm:hidden">Vista</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1 text-xs text-gray-500 border-b mb-1">
                💡 Atajo: Ctrl+Shift+V (Cmd+Shift+V en Mac)
              </div>
              <DropdownMenuItem 
                onClick={() => handleViewModeChange('both')}
                className={`${viewMode === 'both' ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <Layout className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Vista Dividida</span>
                  <span className="text-xs text-gray-500">Formulario y vista previa</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleViewModeChange('form-only')}
                className={`${viewMode === 'form-only' ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <PanelLeft className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Solo Formulario</span>
                  <span className="text-xs text-gray-500">Ocultar vista previa</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleViewModeChange('preview-only')}
                className={`${viewMode === 'preview-only' ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <PanelRight className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Solo Vista Previa</span>
                  <span className="text-xs text-gray-500">Ocultar formulario</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

      {/* Alertas - Remover el Alert de saveSuccess y mantener solo validationErrors */}
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

      <div className={`grid gap-6 ${
        viewMode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 
        viewMode === 'form-only' ? 'grid-cols-1 max-w-5xl mx-auto' :
        viewMode === 'preview-only' ? 'grid-cols-1 max-w-5xl mx-auto' :
        'grid-cols-1'
      }`}>
        {/* Formularios - Ocupa todo el ancho cuando preview-only está oculto */}
        {(viewMode === 'both' || viewMode === 'form-only') && (
          <div className={`space-y-6 ${
            viewMode === 'form-only' ? 'w-full max-w-none' : ''
          }`}>
          <Card className={`${
            viewMode === 'form-only' 
              ? 'w-full shadow-lg border-gray-200' 
              : 'lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {viewMode === 'form-only' && <PanelLeft className="h-5 w-5 text-blue-600" />}
                Información del CV
                {viewMode === 'form-only' && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    (Vista Ampliada)
                  </span>
                )}
              </CardTitle>
              {viewMode === 'form-only' && (
                <p className="text-sm text-gray-600 mt-1">
                  📝 Completa tu información profesional en esta vista ampliada
                </p>
              )}
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
        )}

        {/* Vista Previa - Ocupa todo el ancho cuando form-only está oculto */}
        {(viewMode === 'both' || viewMode === 'preview-only') && (
          <div className={`${
            viewMode === 'preview-only' ? 'w-full flex justify-center' : 'lg:sticky lg:top-6'
          }`}>
            <div className={`${
              viewMode === 'preview-only' ? 'w-full' : 'w-full'
            }`}>
              <Card className={`${
                viewMode === 'preview-only' ? 'shadow-lg border-gray-200' : ''
              }`}>
                {viewMode === 'preview-only' && (
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <PanelRight className="h-5 w-5 text-blue-600" />
                      Vista Previa del CV
                      <span className="text-sm font-normal text-blue-600 ml-2">
                        (Vista Ampliada)
                      </span>
                    </CardTitle>
                    <p className="text-sm text-blue-700 mt-1">
                      👁️ Revisa cómo se verá tu CV final antes de descargarlo
                    </p>
                  </CardHeader>
                )}
                <CardContent className={`${
                  viewMode === 'preview-only' ? 'p-6' : 'p-0'
                }`}>
                  <CVPreview 
                    cvData={cvData}
                    onPageCalculated={handlePageCalculated}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Modal de advertencia de páginas múltiples */}
      <PageWarningModal
        isOpen={showPageWarning}
        onClose={() => setShowPageWarning(false)}
        onConfirm={handleConfirmDownload}
        totalPages={pdfPageCount}
        cvData={cvData}
      />
    </>
  );
}
