'use client';

import { useState } from 'react';
import { CVData, francescoLucchesiCV } from '@/types/cv';
import { CVPDFGeneratorHarvard } from '@/services/cvPDFGeneratorHarvard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function TestPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // Convertir CVDataHarvard a CVData para el generador PDF actual
  const convertToStandardFormat = (): CVData => {
    const harvardData = francescoLucchesiCV;
    
    console.log('Convirtiendo datos de Francesco Lucchesi:', {
      skillCategories: harvardData.skillCategories?.length || 0,
      projects: harvardData.projects?.length || 0,
      certifications: harvardData.certifications?.length || 0
    });
      // Convertir skillCategories a skills individuales con mejor mapeo de categorías
    const skills = harvardData.skillCategories?.flatMap(category => 
      category.skills.map(skill => ({
        id: `${category.id}-${skill.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: skill.name,
        level: normalizeSkillLevel(skill.level?.replace(/[()]/g, '') || 'Intermedio'),
        category: mapCategoryToStandard(category.category)
      }))
    ) || [];

    return {
      personalInfo: harvardData.personalInfo,
      education: harvardData.education || [],
      workExperience: harvardData.workExperience || [],
      projects: harvardData.projects || [],
      skills: skills,
      certifications: harvardData.certifications || [],
      hobbies: harvardData.hobbies || []
    };
  };  // Función auxiliar para mapear categorías de habilidades
  const mapCategoryToStandard = (category: string): 'Technical' | 'Communication' | 'Leadership' | 'Analytical' | 'Research' => {
    const categoryMap: Record<string, 'Technical' | 'Communication' | 'Leadership' | 'Analytical' | 'Research'> = {
      'Software': 'Technical',
      'Gestión de proyectos': 'Leadership',
      'Idiomas': 'Communication',
      'Técnico': 'Technical',
      'Programación': 'Technical',
      'Base de datos': 'Technical',
      'Análisis': 'Analytical',
      'Investigación': 'Research'
    };
    
    return categoryMap[category] || 'Technical';
  };

  // Función auxiliar para normalizar niveles de habilidades
  const normalizeSkillLevel = (level: string): 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto' => {
    const levelMap: Record<string, 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto'> = {
      'Principiante': 'Básico',
      'Básico': 'Básico',
      'Intermedio': 'Intermedio',
      'Avanzado': 'Avanzado',
      'Experto': 'Experto',
      'Nativo': 'Experto'
    };
    
    return levelMap[level] || 'Intermedio';
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      setStatus('idle');
      setErrorMessage('');
      
      console.log('🚀 Iniciando generación de PDF para Francesco Lucchesi...');
      const cvData = convertToStandardFormat();
      
      console.log('📋 Datos convertidos:', {
        personalInfo: !!cvData.personalInfo.fullName,
        education: cvData.education.length,
        workExperience: cvData.workExperience.length,
        projects: cvData.projects.length,
        skills: cvData.skills.length,
        certifications: cvData.certifications.length,
        hobbies: (cvData.hobbies ?? []).length
      });
      
      await CVPDFGeneratorHarvard.generatePDF(cvData);
      
      setStatus('success');
      console.log('✅ PDF generado exitosamente');
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          📄 Francesco Lucchesi CV - PDF Generator Test
        </h1>
        <p className="text-lg text-gray-600">
          Prueba de generación de PDF con datos reales de Francesco Lucchesi
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de la Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Fuentes:</span>
              <span className="text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Times (Sistema)
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Datos de prueba:</span>
              <span className="text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completos
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Estado PDF:</span>
              {status === 'idle' && (
                <span className="text-gray-600">Esperando...</span>
              )}
              {status === 'success' && (
                <span className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Generado exitosamente
                </span>
              )}
              {status === 'error' && (
                <span className="text-red-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Error
                </span>
              )}
            </div>
          </div>

          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Error detallado:</h4>
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>      <Card>
        <CardHeader>
          <CardTitle>Test de Generación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Generar PDF de Prueba
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  try {
                    const converted = convertToStandardFormat();
                    console.log('✅ Conversión exitosa:', converted);
                    alert(`✅ Conversión exitosa!\n\nHabilidades: ${converted.skills.length}\nProyectos: ${converted.projects.length}\nEducación: ${converted.education.length}\n\nRevisa la consola para más detalles.`);
                  } catch (error) {
                    console.error('❌ Error en conversión:', error);
                    alert(`❌ Error en conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                  }
                }}
                variant="outline"
                className="flex items-center justify-center gap-2"
                size="lg"
              >
                <CheckCircle className="h-5 w-5" />
                Probar Conversión
              </Button>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>✅ Sin fuentes personalizadas (Garamond eliminado)</p>
              <p>✅ Usando fuente Times del sistema</p>
              <p>✅ Datos de prueba completos</p>
              <p>✅ Todas las secciones incluidas</p>
            </div>          </div>
        </CardContent>
      </Card>

      {/* Sección de Debug */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug - Datos Convertidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => {
                const converted = convertToStandardFormat();
                console.log('Datos convertidos completos:', converted);
                alert('Revisa la consola para ver los datos convertidos');
              }}
              variant="outline"
              className="w-full"
            >
              Ver Datos Convertidos en Consola
            </Button>
              <div className="text-xs bg-gray-50 p-3 rounded border">
              <strong>Información técnica:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Conversión de CVDataHarvard → CVData estándar</li>
                <li>Mapeo automático de categorías de habilidades</li>
                <li>Validación de arrays opcionales con fallback a arrays vacíos</li>
                <li>Logging detallado para debugging en consola del navegador</li>
                <li>Manejo de certificaciones con date/expiryDate</li>
                <li>Soporte completo para proyectos con tecnologías y highlights</li>
              </ul>
            </div>
            
            {/* Mostrar datos específicos de Francesco */}
            <div className="text-xs bg-blue-50 p-3 rounded border mt-4">
              <strong>Francesco Lucchesi - Datos disponibles:</strong>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <strong>Secciones principales:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    <li>✅ Información personal completa</li>
                    <li>✅ {francescoLucchesiCV.education?.length || 0} registros de educación</li>
                    <li>✅ {francescoLucchesiCV.workExperience?.length || 0} experiencias laborales</li>
                    <li>✅ {francescoLucchesiCV.projects?.length || 0} proyectos</li>
                  </ul>
                </div>
                <div>
                  <strong>Datos adicionales:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    <li>✅ {francescoLucchesiCV.skillCategories?.length || 0} categorías de habilidades</li>
                    <li>✅ {francescoLucchesiCV.certifications?.length || 0} certificaciones</li>
                    <li>✅ {francescoLucchesiCV.hobbies?.length || 0} hobbies</li>
                    <li>✅ Resume profesional</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de Prueba Incluidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Información Personal:</strong>
              <ul className="list-disc list-inside text-gray-600">
                <li>Nombre completo</li>
                <li>Contacto completo</li>
                <li>LinkedIn y website</li>
                <li>Resumen profesional</li>
              </ul>
            </div>
            
            <div>
              <strong>Secciones:</strong>
              <ul className="list-disc list-inside text-gray-600">
                <li>Educación (con GPA y honores)</li>
                <li>Experiencia laboral</li>
                <li>Proyectos destacados</li>
                <li>Habilidades</li>
                <li>Certificaciones</li>
                <li>Hobbies e intereses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
