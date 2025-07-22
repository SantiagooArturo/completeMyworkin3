'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cvBuilderService, SavedCV } from '@/services/cvBuilderService';
import { unifiedCVService, UnifiedCV } from '@/services/unifiedCVService';
import { OnboardingService } from '@/services/onboardingService';
import Navbar from '@/components/navbar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CVBuilder from '@/components/cv-builder/CVBuilder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Edit, Trash2, Calendar, Download, Lock, UserPlus, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Componente interno que usa useSearchParams
function CrearCVContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOnboarding = searchParams.get('from') === 'onboarding';
  const fromSource = searchParams.get('from');
  const isFromAdaptation = searchParams.get('target') === 'adapt-cv';
  const isFromPractica = fromSource === 'practica-detail' || fromSource === 'postulacion-detail';
  const adaptedCVId = searchParams.get('adaptedCVId');
  const adaptationId = searchParams.get('adaptationId');
  const totalChanges = searchParams.get('totalChanges');
  const company = searchParams.get('company');
  const position = searchParams.get('position');
  
  // TODOS LOS HOOKS AL INICIO - ANTES DE CUALQUIER RETURN CONDICIONAL
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingCVId, setEditingCVId] = useState<string | undefined>();
  const [userCVs, setUserCVs] = useState<UnifiedCV[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adaptationInfo, setAdaptationInfo] = useState<{
    company: string;
    position: string;
    totalChanges: number;
    adaptationId: string;
  } | null>(null);

  // useEffect también debe ir al inicio
  useEffect(() => {
    if (user) {
      loadUserCVs();
    }
    
    // Si viene del onboarding, mostrar el builder directamente
    if (isFromOnboarding) {
      setShowBuilder(true);
    }
    
    // Si viene de una adaptación de CV, configurar la información y mostrar el builder
    if (isFromAdaptation && company && position) {
      setShowBuilder(true);
      
      // Si tiene adaptedCVId, usar ese CV
      if (adaptedCVId) {
        setEditingCVId(adaptedCVId);
        setAdaptationInfo({
          company,
          position,
          totalChanges: parseInt(totalChanges || '0'),
          adaptationId: adaptationId || ''
        });
      }
    }
  }, [user, isFromOnboarding, isFromAdaptation, adaptedCVId, company, position, totalChanges, adaptationId]);

  // Funciones auxiliares
  const loadUserCVs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const cvs = await unifiedCVService.getAllUserCVs(user);
      setUserCVs(cvs);
    } catch (error) {
      console.error('Error cargando CVs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingCVId(undefined);
    setShowBuilder(true);
  };

  const handleEditCV = (cvId: string) => {
    // Solo permitir edición de CVs creados
    const cv = userCVs.find(c => c.id === cvId);
    if (cv?.source === 'created' && cv.originalCV) {
      setEditingCVId(cv.originalCV.id);
      setShowBuilder(true);
    } else {
      alert('Solo se pueden editar CVs creados con la herramienta');
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este CV?')) return;
    
    try {
      await unifiedCVService.deleteCV(cvId);
      await loadUserCVs();
    } catch (error) {
      console.error('Error eliminando CV:', error);
      alert('Error al eliminar el CV');
    }
  };

  const handleBackToList = async () => {
    if (isFromOnboarding) {
      // Si viene del onboarding, regresar al onboarding
      router.push('/onboarding?step=4');
    } else if (isFromAdaptation || isFromPractica) {
      // Si viene de una adaptación o de una práctica, regresar a la página anterior
      router.back();
    } else {
      // Flujo normal
      setShowBuilder(false);
      setEditingCVId(undefined);
      loadUserCVs();
    }
  };

  // Manejar cuando se guarda un CV desde el onboarding
  const handleCVSavedFromOnboarding = async (cvData: any, cvId: string) => {
    if (!user || !isFromOnboarding) return;
    
    try {
      setIsProcessing(true);
      
      // Integrar datos del CV al onboarding
      await OnboardingService.integrateCVData(user, cvId, cvData, 'created');
      
      // ✅ CORREGIDO: Regresar al paso 3 con el CV creado
      router.push('/onboarding?step=3&cvCreated=true&cvId=' + cvId);
      
    } catch (error) {
      console.error('Error integrando CV al onboarding:', error);
      alert('Error al procesar el CV. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // PROTECCIÓN: Si no hay usuario, mostrar pantalla de login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="h-16"></div>
        
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="text-center bg-white shadow-xl">
            <CardContent className="p-12">
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <Lock className="h-12 w-12 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Creador de CV Profesional
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Crea CVs profesionales con plantillas optimizadas y consejos de IA.
                  Disponible exclusivamente para usuarios registrados.
                </p>
              </div>

              {/* Características del creador de CV */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Plantillas Profesionales</h3>
                  <p className="text-sm text-gray-600">
                    Diseños modernos optimizados para ATS y reclutadores
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Edit className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Editor Intuitivo</h3>
                  <p className="text-sm text-gray-600">
                    Interfaz fácil de usar con vista previa en tiempo real
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Download className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Descarga Instantánea</h3>
                  <p className="text-sm text-gray-600">
                    Exporta en PDF de alta calidad listo para enviar
                  </p>
                </div>
              </div>

              {/* Información de costos */}
              <div className="bg-indigo-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold text-indigo-900">Solo 1 crédito por CV nuevo</span>
                </div>
                <p className="text-sm text-indigo-700">
                  Editar CVs existentes es completamente gratis
                </p>
              </div>

              {/* Call to action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3">
                    Crear Cuenta Gratis
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                ¿Ya tienes cuenta? <Link href="/login" className="text-indigo-600 hover:underline">Inicia sesión aquí</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showBuilder) {
    const builderContent = (
      <>        
        <div className="container mx-auto py-8">
          <div className="mb-6">
            {/* Botón Volver */}
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isFromOnboarding 
                  ? 'Volver al onboarding' 
                  : (isFromAdaptation || isFromPractica)
                    ? 'Volver a postulación' 
                    : 'Volver a mis CVs'}
              </span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </div>
          
          {/* Banner de información de adaptación */}
          {(adaptationInfo || (isFromAdaptation && company && position)) && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 rounded-full p-2">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    {adaptationInfo ? '¡CV Adaptado Exitosamente! 🎯' : '¡Adaptando tu CV! 🎯'}
                  </h3>
                  <p className="text-green-800 mb-3">
                    Tu CV {adaptationInfo ? 'ha sido personalizado' : 'se está personalizando'} específicamente para el puesto de{' '}
                    <span className="font-semibold">{adaptationInfo?.position || position}</span> en{' '}
                    <span className="font-semibold">{adaptationInfo?.company || company}</span>.
                  </p>
                  {adaptationInfo && (
                    <div className="flex flex-wrap gap-4 text-sm text-green-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>{adaptationInfo.totalChanges} adaptaciones realizadas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Habilidades reorganizadas por relevancia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Resumen personalizado</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-green-600">
                    💡 <strong>Tip:</strong> Revisa los cambios, edita si es necesario y descarga tu CV optimizado para esta postulación.
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <CVBuilder 
            cvId={editingCVId}
            onSave={isFromOnboarding ? handleCVSavedFromOnboarding : undefined}
          />
        </div>
        
        {/* Modal de procesamiento */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Procesando tu CV</h3>
                <p className="text-gray-600">Integrando la información a tu perfil...</p>
              </div>
            </div>
          </div>
        )}
      </>
    );

    // Si viene del onboarding, usar el layout completo
    if (isFromOnboarding) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100">
          {/* <Navbar /> */}
          <div className="h-[52px]"></div>
          {builderContent}
        </div>
      );
    }

    // Si es usuario normal, usar DashboardLayout
    return (
      <DashboardLayout>
        {builderContent}
      </DashboardLayout>
    );
  }

  // Para usuarios logueados (no del onboarding), usar el DashboardLayout
  if (user && !isFromOnboarding) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis CVs Profesionales</h1>
              <p className="text-gray-600 mt-1">Crea y gestiona tus CVs con formato Harvard profesional</p>
            </div>
            <Button 
              onClick={handleCreateNew}
              className="bg-[#028bbf] hover:bg-[#027ba8]"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Nuevo CV
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf]"></div>
            </div>
          ) : userCVs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes CVs creados
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primer CV profesional con formato Harvard
                </p>
                <Button 
                  onClick={handleCreateNew}
                  className="bg-[#028bbf] hover:bg-[#027ba8]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear mi primer CV
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCVs.map((cv) => (
                <Card key={cv.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-[#028bbf]" />
                      {cv.title}
                      <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                        cv.source === 'created' ? 'bg-blue-100 text-blue-700' :
                        cv.source === 'uploaded' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {cv.source === 'created' ? 'Creado' :
                         cv.source === 'uploaded' ? 'Subido' : 'Analizado'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Actualizado: {formatDate(cv.updatedAt || cv.createdAt)}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {cv.source === 'created' && cv.originalCV && (
                          <>
                            <p><strong>Plantilla:</strong> {cv.originalCV.template || 'Harvard'}</p>
                            <p><strong>Nombre:</strong> {cv.originalCV.data?.personalInfo?.fullName || 'Sin nombre'}</p>
                          </>
                        )}
                        {cv.source === 'uploaded' && (
                          <>
                            <p><strong>Archivo:</strong> {cv.fileName}</p>
                            <p><strong>Tipo:</strong> CV subido</p>
                          </>
                        )}
                        {cv.source === 'analyzed' && (
                          <>
                            <p><strong>Archivo:</strong> {cv.fileName}</p>
                            <p><strong>Tamaño:</strong> {cv.fileSize ? `${(cv.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-3">
                        {cv.source === 'created' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCV(cv.id)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(cv.fileUrl, '_blank')}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver CV
                          </Button>
                        )}
                        
                        {cv.source === 'created' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCV(cv.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Para usuarios no logueados - mostrar mensaje de login
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="h-16"></div>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="text-center bg-white shadow-xl">
          <CardContent className="p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Mis CVs Profesionales
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Inicia sesión para ver y gestionar todos tus CVs
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente exportado con Suspense
export default function CrearCV() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CrearCVContent />
    </Suspense>
  );
}