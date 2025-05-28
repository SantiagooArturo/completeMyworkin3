'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cvBuilderService, SavedCV } from '@/services/cvBuilderService';
import Navbar from '@/components/navbar';
import CVBuilder from '@/components/cv-builder/CVBuilder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Edit, Trash2, Calendar, Download } from 'lucide-react';

export default function CrearCV() {
  const { user } = useAuth();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingCVId, setEditingCVId] = useState<string | undefined>();
  const [userCVs, setUserCVs] = useState<SavedCV[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserCVs();
    }
  }, [user]);

  const loadUserCVs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const cvs = await cvBuilderService.getUserCVs(user);
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
    setEditingCVId(cvId);
    setShowBuilder(true);
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este CV?')) return;
    
    try {
      await cvBuilderService.deleteCV(cvId);
      await loadUserCVs();
    } catch (error) {
      console.error('Error eliminando CV:', error);
      alert('Error al eliminar el CV');
    }
  };

  const handleBackToList = () => {
    setShowBuilder(false);
    setEditingCVId(undefined);
    loadUserCVs();
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

  if (showBuilder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="h-[52px]"></div>
        <div className="container mx-auto py-8">
          <div className="mb-6">
             {/* Botón Volver a mis CVs */}
          <Button
            variant="outline"
            onClick={handleBackToList}
            className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Volver a mis CVs</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          </div>
          <CVBuilder cvId={editingCVId} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins">
        <Navbar />
        <div className="h-[52px]"></div>
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-black">Crea tu </span>
              <span className="text-[#028bbf]">CV Profesional</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Inicia sesión para acceder al creador de CV con formato Harvard
            </p>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <FileText className="h-16 w-16 text-[#028bbf] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acceso Requerido
              </h2>
              <p className="text-gray-600 mb-6">
                Para crear y gestionar tus CVs, necesitas iniciar sesión en tu cuenta.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins">
      <Navbar />
      <div className="h-[52px]"></div>
      
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-black">Mis </span>
              <span className="text-[#028bbf]">CVs Profesionales</span>
            </h1>
            <p className="text-xl text-gray-600">
              Crea y gestiona tus CVs con formato Harvard profesional
            </p>
          </div>

          <div className="mb-8">
            <Button 
              onClick={handleCreateNew}
              className="bg-[#028bbf] hover:bg-[#027ba8] text-white flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
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
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Actualizado: {formatDate(cv.updatedAt)}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p><strong>Plantilla:</strong> {cv.template || 'Harvard'}</p>
                        <p><strong>Nombre:</strong> {cv.data.personalInfo.fullName || 'Sin nombre'}</p>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleEditCV(cv.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteCV(cv.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Información sobre el formato Harvard */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  ¿Por qué formato Harvard?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-[#028bbf]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Profesional</h4>
                    <p className="text-gray-600 text-sm">
                      Formato reconocido mundialmente por reclutadores y empresas
                    </p>
                  </div>
                  
                  <div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Edit className="w-6 h-6 text-[#028bbf]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Estructurado</h4>
                    <p className="text-gray-600 text-sm">
                      Organización clara que facilita la lectura y evaluación
                    </p>
                  </div>
                  
                  <div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Download className="w-6 h-6 text-[#028bbf]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Versátil</h4>
                    <p className="text-gray-600 text-sm">
                      Adaptable a cualquier industria y nivel profesional
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
} 