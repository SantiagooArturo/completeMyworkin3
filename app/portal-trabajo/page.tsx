'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import JobCard from '@/components/dashboard/JobCard';
import SimpleUploadCVModal from '@/components/SimpleUploadCVModal';
import { OnboardingMatchService } from '@/services/onboardingMatchService';
import { Practica } from '@/services/matchPracticesService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  Filter,
  Search,
  ExternalLink,
  RefreshCw,
  Upload,
  Plus,
  X
} from 'lucide-react';

const puestosDisponibles = [
  'Diseñador UI',
  'Diseñador UX/UI', 
  'Diseñador UX',
  'Frontend Developer',
  'Product Designer',
  'Diseñador Gráfico',
  'Web Designer',
  'Marketing Digital'
];

interface UserProfile {
  hasCV: boolean;
  cvFileName?: string;
  cvFileUrl?: string;
  ultimoPuesto?: string;
}

export default function PortalTrabajoPage() {
  const { user } = useAuth();
  const [selectedPuestos, setSelectedPuestos] = useState<string[]>(['Diseñador UX/UI']);
  const [customPuesto, setCustomPuesto] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ hasCV: false });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Cargar perfil de usuario desde Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const puestoPrincipal = userData.position || 'Diseñador UX/UI';

          setUserProfile({
            hasCV: !!(userData.cvFileUrl || userData.cvFileName),
            cvFileName: userData.cvFileName || undefined,
            cvFileUrl: userData.cvFileUrl || undefined,
            ultimoPuesto: puestoPrincipal
          });

          // Inicializa los puestos seleccionados con el puesto principal del perfil
          setSelectedPuestos([puestoPrincipal]);

          // Si tiene CV, cargar prácticas automáticamente con el puesto correcto
          if (userData.cvFileUrl) {
            await loadPracticas(userData.cvFileUrl, [puestoPrincipal]);
          }
        } else {
          setUserProfile({ hasCV: false });
        }
      } catch (error) {
        setError('Error al cargar tu perfil. Por favor, recarga la página.');
        setUserProfile({ hasCV: false });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Función para cargar prácticas usando el servicio real
  const loadPracticas = async (cvUrl: string, puestos: string[]) => {
    try {
      const puestoPrincipal = puestos[0] || 'Diseñador UX/UI';
      
      console.log('🔍 Cargando prácticas para:', {
        puesto: puestoPrincipal,
        cvUrl: cvUrl,
        userId: user?.uid
      });

      // Mostrar indicador de carga más específico
      setLoading(true);
      
      const matchResult = await OnboardingMatchService.executeMatchWithRetry({
        puesto: puestoPrincipal,
        cv_url: cvUrl
      }, user!.uid);

      setPracticas(matchResult.practices);
      
      // Mensaje más específico según la fuente
      const sourceMessage = matchResult.source === 'api' ? 'nuevas' : 'guardadas';
      console.log(`✅ Prácticas ${sourceMessage} cargadas: ${matchResult.practices.length} (${matchResult.source})`);
      
    } catch (error) {
      console.error('❌ Error cargando prácticas:', error);
      setError('Error al cargar prácticas. Mostrando resultados de ejemplo.');
      setPracticas([]);
    }
  };

  // Función para refrescar prácticas
  const handleRefresh = async () => {
    if (selectedPuestos.length === 0) {
      setError('Selecciona al menos un puesto de interés');
      return;
    }

    if (!userProfile.hasCV || !userProfile.cvFileUrl) {
      setError('Necesitas tener un CV subido para buscar prácticas');
      return;
    }

    setLoading(true);
    setError(null);
    
    await loadPracticas(userProfile.cvFileUrl, selectedPuestos);
    setLastRefresh(new Date());
    setLoading(false);
  };

  // Función para agregar puesto personalizado
  const handleAddCustomPuesto = () => {
    if (customPuesto.trim() && !selectedPuestos.includes(customPuesto.trim())) {
      setSelectedPuestos([...selectedPuestos, customPuesto.trim()]);
      setCustomPuesto('');
      setShowCustomInput(false);
    }
  };

  // Función para remover puesto
  const removePuesto = (puesto: string) => {
    setSelectedPuestos(selectedPuestos.filter(p => p !== puesto));
  };

  // Función para toggle puesto predefinido
  const togglePuesto = (puesto: string) => {
    if (selectedPuestos.includes(puesto)) {
      removePuesto(puesto);
    } else {
      setSelectedPuestos([...selectedPuestos, puesto]);
    }
  };

  // Función para abrir modal de subida de CV
  const handleUploadCV = () => {
    setShowUploadModal(true);
  };

  // Función para manejar el éxito de la subida de CV
  const handleUploadSuccess = async (cvData: { fileName: string; fileUrl: string }) => {
    // Actualizar el perfil del usuario
    setUserProfile({
      hasCV: true,
      cvFileName: cvData.fileName,
      cvFileUrl: cvData.fileUrl
    });

    // Si hay puestos seleccionados, cargar prácticas automáticamente
    if (selectedPuestos.length > 0) {
      setLoading(true);
      await loadPracticas(cvData.fileUrl, selectedPuestos);
      setLastRefresh(new Date());
      setLoading(false);
    }
  };

  // Función para cambiar puesto principal
  const handleChangePuestoPrincipal = async (nuevoPuesto: string) => {
    if (!user) return;
    setSelectedPuestos([nuevoPuesto]);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        position: nuevoPuesto,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando puesto principal:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Portal de Trabajo
            </h1>
          </div>
          <p className="text-gray-600">
            {userProfile.hasCV 
              ? `Hemos encontrado ${practicas.length} prácticas compatibles con tu perfil`
              : 'Sube tu CV para ver prácticas personalizadas para ti'
            }
          </p>
        </div>



        {/* Contenido Principal */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
              <p className="text-gray-600">
                {userProfile.hasCV ? 'Cargando tus prácticas personalizadas...' : 'Verificando tu perfil...'}
              </p>
            </div>
          </div>
        ) : !userProfile.hasCV ? (
          /* Sin CV - Mostrar mensaje para subir CV */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sube tu CV para ver prácticas personalizadas
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Para mostrarte las mejores oportunidades que coincidan con tu perfil, necesitamos que subas tu CV.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleUploadCV}
                className="px-6 py-3 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors"
              >
                Subir CV
              </button>
              <a
                href="/bolsa-trabajo"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ver Todas las Prácticas
              </a>
            </div>
          </div>
        ) : error ? (
          /* Error al cargar prácticas */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <ExternalLink className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar prácticas
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-6 py-3 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Intentando...' : 'Reintentar'}
              </button>
              <a
                href="/bolsa-trabajo"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ver Todas las Prácticas
              </a>
            </div>
          </div>
        ) : practicas.length > 0 ? (
          /* Con CV y prácticas - Mostrar listado */
          <>
            {/* 1. Buscador de Prácticas */}
            <div className="mb-6  rounded-xl border-gray-200 ">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar prácticas por empresa, puesto, ubicación..."
                  className="block w-full pl-10 pr-3 py-3 border-none rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <span>
                  {searchQuery 
                    ? `Resultados para "${searchQuery}"`
                    : 'Busca entre todas las prácticas disponibles'
                  }
                </span>
                <span>
                  {searchQuery 
                    ? `${practicas.filter(practice => {
                        const query = searchQuery.toLowerCase();
                        return (
                          practice.title.toLowerCase().includes(query) ||
                          practice.company.toLowerCase().includes(query) ||
                          practice.location.toLowerCase().includes(query) ||
                          practice.descripcion.toLowerCase().includes(query)
                        );
                      }).length} de ${practicas.length} prácticas`
                    : `${practicas.length} prácticas`
                  }
                </span>
              </div>
            </div>

            {/* 2. Selector de Puestos de Interés */}
            <div className="mb-6  rounded-xl border-gray-200 ">
              <div className="flex items-center justify-between mb-4">
                {/* <h3 className="text-lg font-semibold text-gray-900">Puestos de Interés</h3> */}
                              {/* Puestos Seleccionados */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedPuestos.map((puesto) => (
                  <span
                    key={puesto}
                    className="flex items-center gap-2 px-3 py-1 bg-[#028bbf] text-white rounded-full text-sm"
                  >
                    {puesto}
                    <button
                      onClick={() => removePuesto(puesto)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                
                {/* Input para puesto personalizado */}
                {showCustomInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customPuesto}
                      onChange={(e) => setCustomPuesto(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPuesto()}
                      placeholder="Escribe el puesto..."
                      className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#028bbf]"
                      autoFocus
                    />
                    <button
                      onClick={handleAddCustomPuesto}
                      className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setShowCustomInput(false)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="flex items-center gap-1 px-3 py-1 border-2 border-dashed border-gray-300 text-gray-600 rounded-full text-sm hover:border-[#028bbf] hover:text-[#028bbf]"
                  >
                    <Plus className="h-3 w-3" />
                    Puesto personalizado
                  </button>
                )}
              </div>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Actualizando...' : 'Refrescar'}
                </button>
              </div>
              


              {/* Puestos Predefinidos */}
              <div className="flex flex-wrap gap-2">
                {puestosDisponibles.map((puesto) => (
                  <button
                    key={puesto}
                    onClick={() => togglePuesto(puesto)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedPuestos.includes(puesto)
                        ? 'bg-gray-200 text-gray-600 cursor-default'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={selectedPuestos.includes(puesto)}
                  >
                    {puesto}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Filtros y Ordenamiento */}
            <div className="mb-6 rounded-xl">
              {/* Controles de Filtro */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Ordenar por */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordenar por
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                    <option value="relevancia">Relevancia</option>
                    <option value="fecha">Fecha</option>
                    <option value="salario">Salario</option>
                    <option value="empresa">Empresa</option>
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                    <option value="todas">Todas</option>
                    <option value="hoy">Hoy</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mes</option>
                  </select>
                </div>

                {/* Tipo de Trabajo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                    <option value="todos">Todos</option>
                    <option value="practica">Práctica</option>
                    <option value="trainee">Trainee</option>
                    <option value="junior">Junior</option>
                  </select>
                </div>

                {/* Experiencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experiencia
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                    <option value="todas">Todas</option>
                    <option value="sin-experiencia">Sin experiencia</option>
                    <option value="0-1">0-1 años</option>
                    <option value="1-2">1-2 años</option>
                  </select>
                </div>

                {/* Salario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salario
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                    <option value="todos">Todos</option>
                    <option value="500-1000">S/ 500 - 1,000</option>
                    <option value="1000-1500">S/ 1,000 - 1,500</option>
                    <option value="1500+">S/ 1,500+</option>
                  </select>
                </div>

                {/* Jornada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jornada
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                    <option value="todas">Todas</option>
                    <option value="completa">Tiempo completo</option>
                    <option value="parcial">Tiempo parcial</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm border border-myworkin-blue rounded-lg px-4 py-2 text-myworkin-blue hover:bg-myworkin-blue/10 transition-colors">
                  Limpiar filtros
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Última actualización: {lastRefresh.toLocaleTimeString('es-PE')}
                  </span>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors text-sm">
                    <Filter className="h-4 w-4" />
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Lista de Prácticas */}
            <div className="space-y-4">
              {practicas
                .filter(practice => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    practice.title.toLowerCase().includes(query) ||
                    practice.company.toLowerCase().includes(query) ||
                    practice.location.toLowerCase().includes(query) ||
                    practice.descripcion.toLowerCase().includes(query)
                  );
                })
                .map((practice: Practica, index: number) => {
                // Transformar Practica a formato JobCard
                const jobData = {
                  id: index + 1,
                  title: practice.title,
                  company: practice.company,
                  location: practice.location,
                  type: "Práctica",
                  schedule: "Tiempo completo",
                  salary: practice.salary,
                  publishedDate: practice.fecha_agregado,
                  applicationUrl: practice.url,
                  skills: {
                    technical: Math.round(practice.similitud_requisitos),
                    soft: Math.round(practice.similitud_titulo),
                    experience: Math.round(practice.similitud_experiencia)
                  }
                };

                return (
                  <JobCard key={`${practice.company}-${index}`} job={jobData} />
                );
              })}
              
              {/* Mensaje si no hay resultados de búsqueda */}
              {searchQuery && practicas.filter(practice => {
                const query = searchQuery.toLowerCase();
                return (
                  practice.title.toLowerCase().includes(query) ||
                  practice.company.toLowerCase().includes(query) ||
                  practice.location.toLowerCase().includes(query) ||
                  practice.descripcion.toLowerCase().includes(query)
                );
              }).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    No hay prácticas que coincidan con "{searchQuery}". Intenta con otros términos.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Con CV pero sin prácticas */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron prácticas
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No hay prácticas disponibles para los puestos seleccionados. Intenta con otros puestos o revisa más tarde.
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>

      {/* Modal de subida de CV */}
      <SimpleUploadCVModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </DashboardLayout>
  );
}
