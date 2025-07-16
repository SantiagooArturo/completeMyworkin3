'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, FileText, Download, Upload, Eye, ExternalLink, CheckCircle2, AlertCircle, Sparkles, Zap } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import SimpleUploadCVModal from '@/components/SimpleUploadCVModal';
import CVProfilePreviewModal from '@/components/CVProfilePreviewModal';
import CVTimelineComponent from '@/components/CVTimelineComponent';
import { CVProfileMappingService, MappingResult, ExtractedProfileData } from '@/services/cvProfileMappingService';

interface UserProfile {
  hasCV: boolean;
  cvFileName?: string;
  cvFileUrl?: string;
  phone?: string;
  location?: string;
  university?: string;
  bio?: string;
  position?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    location: '',
    university: '',
    bio: '',
    position: ''
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>({ hasCV: false });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Estados para la funcionalidad de autocompletado de CV
  const [isExtractingData, setIsExtractingData] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [cvTimelineData, setCvTimelineData] = useState<{
    experience: any[];
    education: any[];
    projects: any[];
  }>({ experience: [], education: [], projects: [] });

  // Cargar datos del perfil desde Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      setIsLoadingProfile(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          setUserProfile({
            hasCV: !!(userData.cvFileUrl || userData.cvFileName),
            cvFileName: userData.cvFileName || undefined,
            cvFileUrl: userData.cvFileUrl || undefined,
            phone: userData.phone,
            location: userData.location,
            university: userData.university,
            bio: userData.bio,
            position: userData.position
          });

          // Actualizar datos del formulario con datos de Firestore
          setProfileData({
            displayName: user?.displayName || userData.displayName || '',
            email: user?.email || '',
            phone: userData.phone || '',
            location: userData.location || '',
            university: userData.university || '',
            bio: userData.bio || '',
            position: userData.position || ''
          });

          // ✅ FIX: Cargar datos del timeline desde Firebase
          setCvTimelineData({
            experience: userData.cvExperience || [],
            education: userData.cvEducation || [],
            projects: userData.cvProjects || []
          });
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        phone: profileData.phone,
        location: profileData.location,
        university: profileData.university,
        bio: profileData.bio,
        position: profileData.position,
        updatedAt: new Date()
      });

      // Actualizar estado local
      setUserProfile(prev => ({
        ...prev,
        phone: profileData.phone,
        location: profileData.location,
        university: profileData.university,
        bio: profileData.bio,
        position: profileData.position
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Error guardando perfil:', error);
    }
  };

  const handleCancel = () => {
    setProfileData({
      displayName: user?.displayName || '',
      email: user?.email || '',
      phone: userProfile.phone || '',
      location: userProfile.location || '',
      university: userProfile.university || '',
      bio: userProfile.bio || '',
      position: userProfile.position || ''
    });
    setIsEditing(false);
  };

  const handleUploadSuccess = async (cvData: { fileName: string; fileUrl: string }) => {
    // Actualizar estado local inmediatamente
    setUserProfile({
      ...userProfile,
      hasCV: true,
      cvFileName: cvData.fileName,
      cvFileUrl: cvData.fileUrl
    });

    // Cerrar modal de upload
    setShowUploadModal(false);

    // ✨ NUEVA FUNCIONALIDAD: Extraer datos del CV automáticamente
    await extractAndPreviewCVData(cvData.fileName, cvData.fileUrl);
  };

  // Nueva función para extraer datos del CV y mostrar preview
  const extractAndPreviewCVData = async (fileName: string, fileUrl: string) => {
    setIsExtractingData(true);
    
    try {
      console.log('🔍 Iniciando extracción de datos del CV...');
      
      // Paso 1: Extraer datos del CV usando nuestro API
      const extractResponse = await fetch('/api/cv/extract-profile-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvFileUrl: fileUrl,
          fileName: fileName
        }),
      });

      if (!extractResponse.ok) {
        throw new Error('Error al extraer datos del CV');
      }

      const extractResult = await extractResponse.json();
      console.log('✅ Datos extraídos exitosamente:', extractResult);

      if (!extractResult.success || !extractResult.data) {
        throw new Error('No se pudieron extraer datos válidos del CV');
      }

      // Paso 2: Mapear datos extraídos al perfil del usuario
      const currentProfile = await CVProfileMappingService.getCurrentProfile(user!);
      const mappingResult = await CVProfileMappingService.mapCVDataToProfile(
        extractResult.data as ExtractedProfileData,
        currentProfile
      );

      console.log('🎯 Mapeo completado:', mappingResult);

      // Paso 3: Configurar datos del timeline
      setCvTimelineData({
        experience: extractResult.data.experience || [],
        education: extractResult.data.education || [],
        projects: extractResult.data.projects || []
      });

      // Paso 4: Mostrar modal de preview si hay datos para aplicar
      if (mappingResult.newData.length > 0 || mappingResult.conflicts.length > 0) {
        setMappingResult(mappingResult);
        setShowPreviewModal(true);
      } else {
        // Si no hay cambios que aplicar, mostrar mensaje informativo
        console.log('ℹ️ No se encontraron datos nuevos para aplicar al perfil');
      }

    } catch (error) {
      console.error('❌ Error durante la extracción de datos del CV:', error);
      // En caso de error, no interrumpir el flujo normal
      // El usuario aún puede usar el CV normalmente
    } finally {
      setIsExtractingData(false);
    }
  };

  // Función para manejar cuando se aplican los cambios del CV
  const handleApplyChanges = async () => {
    // Recargar el perfil del usuario para mostrar los cambios aplicados
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        setUserProfile({
          hasCV: !!(userData.cvFileUrl || userData.cvFileName),
          cvFileName: userData.cvFileName || undefined,
          cvFileUrl: userData.cvFileUrl || undefined,
          phone: userData.phone,
          location: userData.location,
          university: userData.university,
          bio: userData.bio,
          position: userData.position
        });

        // Actualizar datos del formulario también
        setProfileData({
          displayName: user?.displayName || userData.displayName || '',
          email: user?.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          university: userData.university || '',
          bio: userData.bio || '',
          position: userData.position || ''
        });

        // ✅ FIX: También recargar timeline después de aplicar cambios
        setCvTimelineData({
          experience: userData.cvExperience || [],
          education: userData.cvEducation || [],
          projects: userData.cvProjects || []
        });
      }
    }
  };

  const handleDownloadCV = () => {
    if (userProfile.cvFileUrl) {
      window.open(userProfile.cvFileUrl, '_blank');
    }
  };

  if (isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y profesional</p>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda - Información principal y CV */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tarjeta principal del perfil */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header del perfil con gradiente */}
              <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar user={user} size="lg" />
                    <div className="text-white">
                      <h2 className="text-2xl font-semibold">
                        {user?.displayName || 'Usuario'}
                      </h2>
                      <p className="text-blue-100">{user?.email}</p>
                      {userProfile.position && (
                        <p className="text-blue-200 text-sm mt-1">{userProfile.position}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition backdrop-blur-sm"
                        >
                          <Save className="h-4 w-4" />
                          <span>Guardar</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition backdrop-blur-sm"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition backdrop-blur-sm"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del perfil */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.displayName || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profileData.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                        placeholder="Ingresa tu teléfono"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.phone || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                        placeholder="Ingresa tu ubicación"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.location || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posición actual
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.position}
                        onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                        placeholder="Ej: Desarrollador Frontend"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.position || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Universidad
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.university}
                        onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                        placeholder="Ingresa tu universidad"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.university || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografía
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent resize-none"
                        placeholder="Cuéntanos sobre ti..."
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                        <p className="text-gray-900">{profileData.bio || 'No especificado'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas del perfil */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Estadísticas del Perfil</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#028bbf] mb-1">5</div>
                    <div className="text-sm text-gray-600">CVs Creados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">12</div>
                    <div className="text-sm text-gray-600">Postulaciones Enviadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">3</div>
                    <div className="text-sm text-gray-600">Entrevistas Realizadas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - CV y acciones rápidas */}
          <div className="space-y-6">
            
            {/* Tarjeta de CV - Prominente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-[#028bbf]" />
                    Mi CV
                  </h3>
                  {userProfile.hasCV && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Vinculado</span>
                    </div>
                  )}
                </div>

                {userProfile.hasCV ? (
                  <div className="space-y-4">
                                         {/* Información del CV */}
                     <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                       <div className="w-full">
                         <div className="mb-3">
                           <h4 className="font-medium text-gray-900 mb-1 break-words leading-snug" title={userProfile.cvFileName}>
                             {userProfile.cvFileName}
                           </h4>
                           <p className="text-sm text-gray-600">
                             CV vinculado a tu perfil
                           </p>
                         </div>
                         
                                                   {/* Estado del CV */}
                          <div className="flex items-center text-green-700 mb-3">
                            <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium">CV activo y disponible</span>
                          </div>

                          {/* Nuevo: Indicador de funcionalidad inteligente */}
                          <div className="flex items-center text-purple-600 mb-3 bg-purple-50 p-2 rounded-lg">
                            <Zap className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-xs font-medium">Autocompletado inteligente activado</span>
                          </div>
                       </div>

                      {/* Acciones del CV */}
                      <div className="flex flex-col space-y-2">
                                                 <button
                           onClick={handleDownloadCV}
                           className="flex items-center justify-center space-x-2 bg-[#028bbf] hover:bg-[#027ba8] text-white px-4 py-2 rounded-lg font-medium transition w-full"
                         >
                           <Eye className="h-4 w-4" />
                           <span>Ver CV</span>
                           <ExternalLink className="h-3 w-3" />
                         </button>
                         
                         <button
                           onClick={() => setShowUploadModal(true)}
                           className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition w-full"
                         >
                           <Upload className="h-4 w-4" />
                           <span>Actualizar CV</span>
                         </button>

                         {/* Botón para extraer datos manualmente */}
                         <button
                           onClick={() => extractAndPreviewCVData(userProfile.cvFileName || '', userProfile.cvFileUrl || '')}
                           disabled={isExtractingData || !userProfile.cvFileUrl}
                           className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           {isExtractingData ? (
                             <>
                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                               <span>Extrayendo...</span>
                             </>
                           ) : (
                             <>
                               <Sparkles className="h-4 w-4" />
                               <span>Autocompletar perfil</span>
                             </>
                           )}
                         </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Estado sin CV */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 mb-2">
                          No tienes CV vinculado
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Sube tu CV para acceder a todas las funcionalidades de la plataforma
                        </p>
                        
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="flex items-center justify-center space-x-2 bg-[#028bbf] hover:bg-[#027ba8] text-white px-4 py-2 rounded-lg font-medium transition w-full"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Subir mi CV</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                    <span className="font-medium text-gray-700">Crear nuevo CV</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                    <span className="font-medium text-gray-700">Analizar CV</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                    <span className="font-medium text-gray-700">Ver ofertas de trabajo</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de experiencia extraída del CV */}
        {(cvTimelineData.experience.length > 0 || cvTimelineData.education.length > 0 || cvTimelineData.projects.length > 0) && (
          <div className="mt-8">
            <CVTimelineComponent
              experience={cvTimelineData.experience}
              education={cvTimelineData.education}
              projects={cvTimelineData.projects}
              title="Timeline Profesional"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            />
          </div>
        )}
      </div>

      {/* Indicador de extracción de datos */}
      {isExtractingData && (
        <div className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <div>
            <div className="font-medium">Analizando tu CV</div>
            <div className="text-sm text-purple-100">Extrayendo datos automáticamente...</div>
          </div>
        </div>
      )}

      {/* Modal de subida de CV */}
      <SimpleUploadCVModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Modal de preview de datos extraídos */}
      <CVProfilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        mappingResult={mappingResult}
        user={user}
        onApplyChanges={handleApplyChanges}
      />
    </DashboardLayout>
  );
}
 