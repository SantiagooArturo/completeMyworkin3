"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  ArrowLeft, 
  Clock,
  Share2,
  Bookmark,
  AlertCircle,
  Target,
  FileText,
  Play,
  Mic
} from 'lucide-react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { db2 } from "@/firebase/config-jobs";
import PracticaTools from "@/components/PracticaTools";
import { JobApplication } from "../page";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Componente wrapper que intercepta el uso de herramientas
function PracticaToolsWithTracking({ 
  practica, 
  onToolUsed 
}: { 
  practica: any; 
  onToolUsed: (tool: string) => void; 
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Funciones de navegación con tracking
  const handleAdaptarCV = async () => {
    onToolUsed('crear-cv');
    
    try {
      // Mostrar loading
      toast({
        title: "Adaptando tu CV...",
        description: "Estamos personalizando tu CV para este puesto específico",
      });

      // Importar dinámicamente el servicio de adaptación
      const { CVAdaptationService } = await import('@/services/cvAdaptationService');
      
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para adaptar tu CV",
          variant: "destructive"
        });
        return;
      }

      // 1. Obtener CV actual del usuario
      const currentCV = await CVAdaptationService.getUserCurrentCV(user);
      
      if (!currentCV) {
        // Si no tiene CV, redirigir a crear uno nuevo
        toast({
          title: "CV no encontrado",
          description: "Primero necesitas tener un CV creado. Te llevamos a crear uno.",
          variant: "destructive"
        });
        
        const params = new URLSearchParams({
          from: 'practica-detail',
          company: practica.company,
          position: practica.title,
          target: 'create-new'
        });
        router.push(`/crear-cv?${params.toString()}`);
        return;
      }

      // 2. Preparar contexto del trabajo para adaptación
      const jobContext = {
        jobTitle: practica.title,
        company: practica.company,
        location: practica.location,
        requirements: practica.requirements || practica.description || '',
        description: practica.description || '',
        industry: practica.category || '',
        skills: []
      };

      // 3. Adaptar el CV
      const adaptationResult = await CVAdaptationService.adaptCVForJob(
        currentCV,
        jobContext,
        user
      );

      // 4. Guardar CV adaptado temporalmente
      const tempCVId = await CVAdaptationService.saveTemporaryAdaptedCV(
        user,
        adaptationResult.adaptedCV,
        jobContext
      );

      // 5. Mostrar resumen de cambios
      toast({
        title: "¡CV adaptado exitosamente!",
        description: `Se realizaron ${adaptationResult.adaptationSummary.totalChanges} adaptaciones para ${practica.title}`,
        className: "border-green-200 bg-green-50"
      });

      // 6. Redirigir al editor con el CV adaptado
      const params = new URLSearchParams({
        from: 'practica-detail',
        company: practica.company,
        position: practica.title,
        target: 'adapt-cv',
        adaptedCVId: tempCVId,
        adaptationId: adaptationResult.adaptationId,
        totalChanges: adaptationResult.adaptationSummary.totalChanges.toString()
      });
      
      router.push(`/crear-cv?${params.toString()}`);

    } catch (error) {
      console.error('Error adaptando CV:', error);
      toast({
        title: "Error al adaptar CV",
        description: "Hubo un problema adaptando tu CV. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleAnalizarCV = () => {
    onToolUsed('analizar-cv');
    const params = new URLSearchParams({
      puesto: `${practica.title} en ${practica.company}`,
      from: 'postulacion-detail'
    });
    router.push(`/analizar-cv?${params.toString()}`);
  };

  const handleSimularEntrevista = () => {
    onToolUsed('interview-simulation');
    const params = new URLSearchParams({
      jobTitle: practica.title,
      company: practica.company,
      from: 'postulacion-detail'
    });
    router.push(`/interview-simulation?${params.toString()}`);
  };

  const handleMejorarMatch = () => {
    // onToolUsed('match-cv');
    router.push('/portal-trabajo');
  };

  // Configuración de herramientas
  const tools = [
    {
      id: 'adapt-cv',
      title: 'Adaptar mi CV',
      description: `Personaliza tu CV específicamente para ${practica.title} en ${practica.company} con IA`,
      icon: <FileText className="h-6 w-6" />,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      action: handleAdaptarCV,
      popular: true
    },
    {
      id: 'analyze-cv',
      title: 'Analizar mi CV',
      description: `Descubre qué tan compatible es tu CV con los requisitos de ${practica.title}`,
      icon: <Target className="h-6 w-6" />,
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      action: handleAnalizarCV
    },
    {
      id: 'interview-sim',
      title: 'Simular entrevista',
      description: `Practica entrevistas específicas para ${practica.title} con IA`,
      icon: <Mic className="h-6 w-6" />,
      color: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
      action: handleSimularEntrevista
    },
    {
      id: 'improve-match',
      title: 'Mejorar mi match',
      description: 'Recibe sugerencias personalizadas para aumentar tu compatibilidad',
      icon: <Target className="h-6 w-6" />,
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
      action: handleMejorarMatch
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
          <Target className="h-5 w-5 mr-2 text-[#028bbf]" />
          Herramientas de IA
        </h3>
        <p className="text-gray-600 text-xs">
          Maximiza tus posibilidades de conseguir esta práctica
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] rounded-lg p-3 mb-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 rounded-full p-1.5">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-sm">¡Aumenta tu match score!</div>
              <div className="text-xs text-blue-100">
                Mejora significativamente tu compatibilidad
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">+25%</div>
            <div className="text-xs text-blue-100">promedio</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`relative bg-gradient-to-br ${tool.gradient} rounded-lg p-4 text-white cursor-pointer transform transition-all duration-300 hover:scale-102 hover:shadow-lg group`}
            onMouseEnter={() => setHoveredTool(tool.id)}
            onMouseLeave={() => setHoveredTool(null)}
            onClick={tool.action}
          >
            {tool.popular && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center">
                <Target className="h-2.5 w-2.5 mr-0.5" />
                Popular
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  {tool.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">{tool.title}</h4>
                  <p className="text-xs text-white/90 leading-tight">
                    {tool.description}
                  </p>
                </div>
              </div>
              <ArrowLeft 
                className={`h-4 w-4 transition-transform duration-300 ${
                  hoveredTool === tool.id ? 'translate-x-1' : ''
                }`} 
              />
            </div>

            <div className={`absolute inset-0 bg-white/10 rounded-lg opacity-0 transition-opacity duration-300 ${
              hoveredTool === tool.id ? 'opacity-100' : ''
            }`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PostulacionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  // id puede ser string o string[]
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [job, setJob] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para actualizar las herramientas usadas en Firestore
  const updateToolsUsedInFirestore = async (newTool: string) => {
    if (!id || !job) return;
    
    try {
      const currentTools = job.toolsUsed || [];
      if (!currentTools.includes(newTool)) {
        const updatedTools = [...currentTools, newTool];
        
        // Actualizar en Firestore
        const docRef = doc(db, "mispostulaciones", id);
        await updateDoc(docRef, {
          toolsUsed: updatedTools
        });
        
        // Actualizar el estado local
        setJob(prevJob => prevJob ? {
          ...prevJob,
          toolsUsed: updatedTools
        } : null);
        
        console.log(`✅ Herramienta "${newTool}" agregada a Firestore para postulación ${id}`);
      }
    } catch (error) {
      console.error('Error actualizando herramientas en Firestore:', error);
    }
  };

  useEffect(() => {
    async function fetchJob() {
      if (!id) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, "mispostulaciones", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Datos recuperados de Firestore:', data); // Debug
          const jobData = { ...(data as JobApplication), firestoreId: id };
          
          // Si no hay descripción, intentar buscar en la colección de prácticas
          if (!jobData.description || jobData.description.trim() === '') {
            console.log('Buscando descripción en prácticas...');
            try {
              const practicasRef = collection(db2, "practicas");
              const practicasQuery = query(practicasRef, where("title", "==", jobData.title));
              const practicasSnapshot = await getDocs(practicasQuery);
              
              if (!practicasSnapshot.empty) {
                const practicaData = practicasSnapshot.docs[0].data();
                console.log('Práctica encontrada:', practicaData);
                jobData.description = practicaData.descripcion || jobData.description;
                jobData.requirements = practicaData.requirements || jobData.requirements;
              }
            } catch (practicaError) {
              console.log('Error buscando práctica:', practicaError);
            }
          }
          
          setJob(jobData);
        } else {
          setError('Postulación no encontrada');
        }
      } catch (err) {
        console.error('Error cargando postulación:', err);
        setError('Error al cargar la postulación');
      }
      setIsLoading(false);
    }
    fetchJob();
  }, [id]);

  // Formatear fecha
  const formatFecha = (fechaString: string) => {
    try {
      // Si es una fecha en formato de timestamp o string ISO
      let fecha = new Date(fechaString);
      
      // Si no es válida, intentar parseando formato DD/MM/YYYY
      if (isNaN(fecha.getTime())) {
        const parts = fechaString.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
      
      // Si aún no es válida, retornar valor por defecto
      if (isNaN(fecha.getTime())) {
        return 'Fecha no disponible';
      }
      
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Postulación no encontrada'}
            </h2>
            <p className="text-gray-600 mb-6">
              No pudimos cargar los detalles de esta postulación.
            </p>
            <button
              onClick={() => router.push('/postulaciones')}
              className="bg-[#028bbf] hover:bg-[#027ba8] text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Volver a mis postulaciones
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Información principal de la postulación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header de la postulación */}
          <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-lg p-1.5">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{job.title}</h1>
                    <p className="text-sm text-blue-100">{job.company}</p>
                  </div>
                </div>
                
                {/* Metadatos */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100 mt-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{job.salary || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Postulado {formatFecha(job.appliedDate)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{job.type} • {job.schedule}</span>
                  </div>
                </div>
              </div>
              
              {/* Estado y Botón de ver oferta */}
              <div className="ml-4 flex items-center space-x-3">
                {/* Estado de la postulación */}
                <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-white">
                    {job.status.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-blue-100 font-medium">
                    ESTADO
                  </div>
                </div>
                
                {/* Botón de ver oferta original */}
                {job.url && (
                  <button
                    onClick={() => window.open(job.url, "_blank")}
                    className="bg-white text-[#028bbf] hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1"
                  >
                    <span>Ver oferta original</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de herramientas utilizadas */}
        {job.toolsUsed && job.toolsUsed.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-[#028bbf]" />
              Herramientas IA utilizadas
            </h3>
            <div className="flex flex-wrap gap-3">
              {job.toolsUsed.map((tool, idx) => {
                const getToolIcon = (tool: string) => {
                  switch (tool) {
                    case 'analizar-cv':
                      return { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Análisis CV' };
                    case 'interview-simulation':
                      return { icon: Play, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Simulación Entrevista' };
                    case 'crear-cv':
                      return { icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Crear CV' };
                    case 'match-cv':
                      return { icon: Target, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Match CV' };
                    case 'practica-entrevistas':
                      return { icon: Mic, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Práctica Entrevistas' };
                    default:
                      return { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100', label: tool };
                  }
                };
                
                const { icon: Icon, color, bgColor, label } = getToolIcon(tool);
                return (
                  <div
                    key={tool + idx}
                    className={`flex items-center gap-2 ${bgColor} ${color} px-3 py-2 rounded-lg border`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layout de tres columnas: Descripción | Herramientas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          
          {/* Columna principal: Descripción del puesto */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Descripción del puesto
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                {job.description && job.description.trim() !== '' ? (
                  job.description
                ) : job.requirements && job.requirements.trim() !== '' ? (
                  <>
                    <h4 className="font-semibold mb-2">Requisitos:</h4>
                    {job.requirements}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay descripción disponible para esta postulación.</p>
                    <p className="text-sm mt-2">
                      Los datos se cargan desde la información original de la práctica o desde lo que se guardó al postular.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha: Solo Herramientas */}
          <div className="lg:col-span-5">
            <PracticaToolsWithTracking 
              practica={{
                title: job.title,
                company: job.company,
                location: job.location,
                salary: job.salary || 'No especificado',
                descripcion: job.description || '',
                url: job.url,
                fecha_agregado: job.appliedDate
              }}
              onToolUsed={updateToolsUsedInFirestore}
            />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
