'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
  const router = useRouter();
  const [selectedPuestos, setSelectedPuestos] = useState<string[]>([]);
  const [customPuesto, setCustomPuesto] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ hasCV: false });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 1. Estados para filtros
  const [tipoTrabajo, setTipoTrabajo] = useState('todos');
  const [experiencia, setExperiencia] = useState('todas');
  const [salario, setSalario] = useState('todos');
  const [jornada, setJornada] = useState('todas');
  const [fecha, setFecha] = useState('todas');
  const [ordenarPor, setOrdenarPor] = useState('relevancia');

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
          const puestoPrincipal = userData.position;

          setUserProfile({
            hasCV: !!(userData.cvFileUrl || userData.cvFileName),
            cvFileName: userData.cvFileName || undefined,
            cvFileUrl: userData.cvFileUrl || undefined,
            ultimoPuesto: puestoPrincipal
          });

          // Solo inicializar puestos y cargar prácticas si tiene puesto definido
          if (puestoPrincipal) {
            setSelectedPuestos([puestoPrincipal]);
            
            // Si tiene CV y puesto, cargar prácticas automáticamente
            if (userData.cvFileUrl) {
              await loadPracticas(userData.cvFileUrl, [puestoPrincipal]);
            }
          } else {
            // Si no tiene puesto, inicializar con array vacío
            setSelectedPuestos([]);
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

  // Refresco automático de prácticas cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      // Solo refrescar si el usuario está autenticado, tiene CV y puesto seleccionado
      if (user && userProfile.hasCV && userProfile.cvFileUrl && selectedPuestos.length > 0) {
        handleRefresh();
      }
    }, 15 * 60 * 1000); // 15 minutos
    return () => clearInterval(interval);
  }, [user, userProfile.hasCV, userProfile.cvFileUrl, selectedPuestos]);

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
      
      // Si tiene CV, cargar prácticas automáticamente con el nuevo puesto
      if (userProfile.hasCV && userProfile.cvFileUrl) {
        setLoading(true);
        await loadPracticas(userProfile.cvFileUrl, [nuevoPuesto]);
        setLastRefresh(new Date());
        setLoading(false);
      }
    } catch (error) {
      console.error('Error actualizando puesto principal:', error);
    }
  };

  // Función para manejar click en card de práctica
  const handleCardClick = (index: number) => {
    // Guardar las prácticas ordenadas en localStorage para acceso desde la página de detalle
    localStorage.setItem('matched_practices', JSON.stringify(sortedPracticas));
    
    // Navegar a la página de detalle usando el índice en el array ordenado
    router.push(`/practica/${index}`);
  };

  // Utilidad para filtrar por fecha
  function matchFecha(fecha_agregado: string, filtro: string) {
    if (filtro === 'todas') return true;
    if (!fecha_agregado) return false;
  
    const fecha = new Date(fecha_agregado);
    const ahora = new Date();
  
    // Obtener año, mes y día en UTC
    const fechaY = fecha.getUTCFullYear();
    const fechaM = fecha.getUTCMonth();
    const fechaD = fecha.getUTCDate();
  
    const ahoraY = ahora.getUTCFullYear();
    const ahoraM = ahora.getUTCMonth();
    const ahoraD = ahora.getUTCDate();
  
    if (filtro === 'hoy') {
      return fechaY === ahoraY && fechaM === ahoraM && fechaD === ahoraD;
    }
    if (filtro === 'semana') {
      // Diferencia en días (UTC)
      const diff = (Date.UTC(ahoraY, ahoraM, ahoraD) - Date.UTC(fechaY, fechaM, fechaD)) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }
    if (filtro === 'mes') {
      return fechaY === ahoraY && fechaM === ahoraM;
    }
    return true;
  }

  // Utilidad para filtrar por experiencia
  function matchExperiencia(descripcion: string, filtro: string) {
    if (filtro === 'todas') return true;
    if (!descripcion) return false;
    
    const desc = descripcion.toLowerCase();
    
    if (filtro === 'sin-experiencia') {
      return desc.includes('sin experiencia') || 
             desc.includes('sin exp') ||
             desc.includes('estudiante') ||
             desc.includes('practicante') ||
             desc.includes('recién graduado');
    }
    if (filtro === '0-1') {
      return desc.match(/0[-\s]*1\s*(año|años?|year|years?)/i) ||
             desc.includes('junior') ||
             desc.includes('hasta 1 año');
    }
    if (filtro === '1-2') {
      return desc.match(/1[-\s]*2\s*(año|años?|year|years?)/i) ||
             desc.includes('1-2 años') ||
             desc.includes('1 a 2 años');
    }
    return true;
  }

  // 3. Filtrado de prácticas mejorado
  const filteredPracticas = practicas.filter(practice => {
    // Filtro por tipo de trabajo
    if (tipoTrabajo !== 'todos') {
      const title = practice.title.toLowerCase();
      const descripcion = practice.descripcion.toLowerCase();
      
      if (tipoTrabajo === 'practica' && !(title.includes('practica') || descripcion.includes('practica'))) return false;
      if (tipoTrabajo === 'trainee' && !(title.includes('trainee') || descripcion.includes('trainee'))) return false;
      if (tipoTrabajo === 'junior' && !(title.includes('junior') || descripcion.includes('junior'))) return false;
    }
    // Filtro por experiencia
    if (!matchExperiencia(practice.descripcion, experiencia)) return false;
    // Filtro por salario
    if (salario !== 'todos') {
      if (!practice.salary) return false;
      const salaryText = practice.salary.toLowerCase();
      const numbers = practice.salary.match(/\d+/g)?.map(Number) || [];
      const maxSalary = numbers.length > 0 ? Math.max(...numbers) : 0;
      
      if (salario === '500-1000' && !(maxSalary >= 500 && maxSalary <= 1000)) return false;
      if (salario === '1000-1500' && !(maxSalary >= 1000 && maxSalary <= 1500)) return false;
      if (salario === '1500+' && maxSalary < 1500) return false;
    }
    // Filtro por jornada
    if (jornada !== 'todas') {
      const schedule = (practice.schedule || "Tiempo completo").toLowerCase();
      
      if (jornada === 'completa') {
        // Buscar variaciones de "tiempo completo"
        if (!(schedule.includes('completo') || schedule.includes('full time') || schedule.includes('tiempo completo'))) {
          return false;
        }
      }
      
      if (jornada === 'parcial') {
        // Buscar variaciones de "tiempo parcial"
        if (!(schedule.includes('parcial') || schedule.includes('part time') || schedule.includes('medio tiempo'))) {
          return false;
        }
      }
      
      if (jornada === 'flexible') {
        // Buscar variaciones de "flexible"
        if (!(schedule.includes('flexible') || schedule.includes('horario flexible') || schedule.includes('remoto'))) {
          return false;
        }
      }
    }
    // Filtro por fecha
    if (!matchFecha(practice.fecha_agregado, fecha)) return false;
    // Filtro de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !practice.title.toLowerCase().includes(query) &&
        !practice.company.toLowerCase().includes(query) &&
        !practice.location.toLowerCase().includes(query) &&
        !practice.descripcion.toLowerCase().includes(query)
      ) return false;
    }
    return true;
  });

  // Aplica el ordenamiento según el filtro seleccionado
  const sortedPracticas = [...filteredPracticas].sort((a, b) => {
    if (ordenarPor === 'fecha') {
      // Más reciente primero
      return new Date(b.fecha_agregado).getTime() - new Date(a.fecha_agregado).getTime();
    }
    if (ordenarPor === 'salario') {
      // De mayor a menor (extrae el número más alto del rango)
      const getMaxSalary = (s: string) => {
        if (!s) return 0;
        const nums = s.match(/\d+/g);
        return nums ? Math.max(...nums.map(Number)) : 0;
      };
      return getMaxSalary(b.salary) - getMaxSalary(a.salary);
    }
    if (ordenarPor === 'empresa') {
      // Alfabético por empresa
      return a.company.localeCompare(b.company, 'es', { sensitivity: 'base' });
    }
    // Relevancia: usa el mejor indicador de match (similitud_total si existe, sino como venga)
    if (ordenarPor === 'relevancia') {
      const getMatch = (p: any) => typeof p.similitud_total === 'number' ? p.similitud_total : 0;
      return getMatch(b) - getMatch(a);
    }
    return 0;
  });

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setTipoTrabajo('todos');
    setExperiencia('todas');
    setSalario('todos');
    setJornada('todas');
    setFecha('todas');
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
            {userProfile.hasCV && selectedPuestos.length > 0
              ? `Hemos encontrado ${practicas.length} prácticas compatibles con tu perfil`
              : userProfile.hasCV 
                ? 'Selecciona tu puesto de interés para ver prácticas personalizadas'
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
        ) : userProfile.hasCV && selectedPuestos.length === 0 ? (
          /* Con CV pero sin puesto seleccionado - Solicitar puesto */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Selecciona tu puesto de interés
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Para mostrarte las prácticas más relevantes, necesitamos saber qué tipo de puesto te interesa.
            </p>
            
            {/* Puestos predefinidos */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {puestosDisponibles.map((puesto) => (
                <button
                  key={puesto}
                  onClick={() => {
                    setSelectedPuestos([puesto]);
                    handleChangePuestoPrincipal(puesto);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[#028bbf] hover:text-[#028bbf] transition-colors"
                >
                  {puesto}
                </button>
              ))}
            </div>
            
            {/* Puesto personalizado */}
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-500 mb-3">¿O prefieres escribir tu puesto?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPuesto}
                  onChange={(e) => setCustomPuesto(e.target.value)}
                  placeholder="Ej: Desarrollador React, Diseñador..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && customPuesto.trim()) {
                      setSelectedPuestos([customPuesto.trim()]);
                      handleChangePuestoPrincipal(customPuesto.trim());
                      setCustomPuesto('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customPuesto.trim()) {
                      setSelectedPuestos([customPuesto.trim()]);
                      handleChangePuestoPrincipal(customPuesto.trim());
                      setCustomPuesto('');
                    }
                  }}
                  disabled={!customPuesto.trim()}
                  className="px-6 py-2 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Seleccionar
                </button>
              </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ordenarPor">
                    Ordenar por
                    <span className="ml-1 text-gray-400 cursor-help" title="Elige cómo se ordenan los resultados: relevancia, fecha, salario o empresa.">ⓘ</span>
                  </label>
                  <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevancia">Relevancia</SelectItem>
                      <SelectItem value="fecha">Fecha</SelectItem>
                      <SelectItem value="salario">Salario</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fecha">
                    Fecha
                    <span className="ml-1 text-gray-400 cursor-help" title="Filtra prácticas según la fecha en que fueron publicadas.">ⓘ</span>
                  </label>
                  <Select value={fecha} onValueChange={setFecha}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="semana">Esta semana</SelectItem>
                      <SelectItem value="mes">Este mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Tipo de Trabajo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tipoTrabajo">
                    Tipo Trabajo
                    <span className="ml-1 text-gray-400 cursor-help" title="Selecciona el tipo de puesto que buscas: práctica, trainee o junior.">ⓘ</span>
                  </label>
                  <Select value={tipoTrabajo} onValueChange={setTipoTrabajo}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tipo de trabajo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="practica">Práctica</SelectItem>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Experiencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="experiencia">
                    Experiencia
                    <span className="ml-1 text-gray-400 cursor-help" title="Filtra por nivel de experiencia requerida para la práctica.">ⓘ</span>
                  </label>
                  <Select value={experiencia} onValueChange={setExperiencia}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="sin-experiencia">Sin experiencia</SelectItem>
                      <SelectItem value="0-1">0-1 años</SelectItem>
                      <SelectItem value="1-2">1-2 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Salario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="salario">
                    Salario
                    <span className="ml-1 text-gray-400 cursor-help" title="Filtra prácticas según el rango salarial ofrecido.">ⓘ</span>
                  </label>
                  <Select value={salario} onValueChange={setSalario}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Salario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="500-1000">S/ 500 - 1,000</SelectItem>
                      <SelectItem value="1000-1500">S/ 1,000 - 1,500</SelectItem>
                      <SelectItem value="1500+">S/ 1,500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Jornada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="jornada">
                    Jornada
                    <span className="ml-1 text-gray-400 cursor-help" title="Filtra por tipo de jornada laboral: completa, parcial o flexible.">ⓘ</span>
                  </label>
                  <Select value={jornada} onValueChange={setJornada}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Jornada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="completa">Tiempo completo</SelectItem>
                      <SelectItem value="parcial">Tiempo parcial</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={handleClearFilters}
                  className="text-sm border border-myworkin-blue rounded-lg px-4 py-2 text-myworkin-blue hover:bg-myworkin-blue/10 transition-colors"
                >
                  Limpiar filtros
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Última actualización: {lastRefresh.toLocaleTimeString('es-PE')}
                  </span>
                  {/* <button className="flex items-center gap-2 px-4 py-2 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors text-sm">
                    <Filter className="h-4 w-4" />
                    Aplicar filtros
                  </button> */}
                </div>
              </div>
            </div>

            {/* Estadísticas de filtros */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    <strong className="text-gray-900">{sortedPracticas.length}</strong> de <strong className="text-gray-900">{practicas.length}</strong> prácticas
                  </span>
                  {(ordenarPor !== 'relevancia' || tipoTrabajo !== 'todos' || experiencia !== 'todas' || salario !== 'todos' || jornada !== 'todas' || fecha !== 'todas') && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Filtros aplicados
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Ordenado por: <span className="font-medium text-gray-700">
                    {ordenarPor === 'relevancia' && 'Relevancia'}
                    {ordenarPor === 'fecha' && 'Fecha'}
                    {ordenarPor === 'salario' && 'Salario'}
                    {ordenarPor === 'empresa' && 'Empresa'}
                  </span>
                </div>
              </div>
              
              {/* Mostrar filtros activos */}
              {(tipoTrabajo !== 'todos' || experiencia !== 'todas' || salario !== 'todos' || jornada !== 'todas' || fecha !== 'todas') && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {tipoTrabajo !== 'todos' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Tipo: {tipoTrabajo}
                        <button
                          onClick={() => setTipoTrabajo('todos')}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {experiencia !== 'todas' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Experiencia: {experiencia}
                        <button
                          onClick={() => setExperiencia('todas')}
                          className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {salario !== 'todos' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Salario: {salario}
                        <button
                          onClick={() => setSalario('todos')}
                          className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {jornada !== 'todas' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        Jornada: {jornada === 'completa' ? 'Tiempo completo' : jornada === 'parcial' ? 'Tiempo parcial' : 'Flexible'}
                        <button
                          onClick={() => setJornada('todas')}
                          className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {fecha !== 'todas' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        Fecha: {fecha}
                        <button
                          onClick={() => setFecha('todas')}
                          className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Lista de Prácticas */}
            <div className="space-y-4">
              {/* 8. Mensajes personalizados de error y estados vacíos */}
              {error && (
                <div className="text-center py-12" role="alert">
                  <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{error}</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Por favor, intenta nuevamente o revisa tu conexión.</p>
                </div>
              )}
              {sortedPracticas.length === 0 && !error && (
                <div className="text-center py-12" role="status">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron prácticas</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Prueba cambiando los filtros o busca en otra categoría.</p>
                </div>
              )}
              {/* 7. Mejor accesibilidad y mobile: aria-labels y clases responsive */}
              {sortedPracticas.map((practice: Practica, sortedIndex: number) => {
                const jobData = {
                  id: sortedIndex + 1,
                  title: practice.title,
                  company: practice.company,
                  location: practice.location,
                  type: "Práctica",
                  schedule: practice.schedule || "Tiempo completo",
                  salary: practice.salary,
                  publishedDate: new Date(practice.fecha_agregado).toLocaleString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                  applicationUrl: practice.url,
                  skills: {
                    technical: practice.similitud_requisitos,
                    soft: practice.similitud_titulo,
                    experience: practice.similitud_experiencia,
                    macro: practice.similitud_macro
                  }
                };
                return (
                  <JobCard 
                    key={`${practice.company}-${sortedIndex}`} 
                    job={jobData} 
                    index={sortedIndex}
                    onCardClick={handleCardClick}
                    aria-label={`Práctica en ${practice.company}, puesto ${practice.title}`} 
                  />
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
