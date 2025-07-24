"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Search,
  Mic,
  TrendingUp,
  ArrowRight,
  Zap,
  Target,
  Brain,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { PracticaToolsProps } from "@/types/practica";
import { useToolsUsed } from "@/hooks/useToolsUsed";
import ReactDOM from "react-dom";
import { auth, db } from "@/firebase/config"; // Ajusta la ruta si es necesario
import { onAuthStateChanged } from "firebase/auth";
import { User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import AdaptationLoadingScreen from './AdaptationLoadingScreen';
import LoadingScreen from './LoadingScreens';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  action: () => void;
  popular?: boolean;
}
interface ElementoEvaluacion {
  elemento: string;
  existe: boolean;
  bien_posicionado: boolean;
  facil_de_distinguir: boolean;
}

export default function PracticaTools({ practica }: PracticaToolsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
    // Estados para la adaptación de CV
  const [isAdaptingCV, setIsAdaptingCV] = useState(false);
  const [adaptationStep, setAdaptationStep] = useState<'extracting' | 'analyzing' | 'adapting' | 'saving' | 'complete' | 'error'>('extracting');
  const [adaptationError, setAdaptationError] = useState<string | null>(null);
  const { addToolUsed } = useToolsUsed(practica.title); // Hook para registrar herramientas utilizadas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any | null>(null); // Asegúrate de que 'userInfo' esté correctamente definido
  const [loading, setLoading] = useState(false); // Estado de carga para el loader
  const [apiResult, setApiResult] = useState<any | null>(null);

  const [usuario, setUser] = useState<User | null>(null); // Actualiza el tipo para aceptar User o null
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        setUser(usuario); // Almacena el usuario en el estado
        if (usuario.email) {
          fetchUserInfo(usuario.email); // Llama a la función solo si user.email es un string
        }
      } else {
        setUser(null); // Si no hay usuario autenticado
      }
    });

    return () => unsubscribe(); // Limpia el listener cuando el componente se desmonte
  }, []);

  const handleCloseModal = () => {
  setIsModalOpen(false); // Cierra solo el modal, no redirige
};

  const fetchUserInfo = async (email: string) => {
    try {
      const usersRef = collection(db, "users"); // Referencia a la colección 'users'
      const q = query(usersRef, where("email", "==", email)); // Consulta para encontrar el documento por el email

      const querySnapshot = await getDocs(q); // Ejecutar la consulta

      // Si se encuentra un documento, se obtiene la información
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setUserInfo(doc.data()); // Almacena los datos del usuario en el estado
          console.log("Información del usuario:", doc.data()); // Muestra la información del usuario
        });
      } else {
        console.log("No se encontró el usuario en la colección");
      }
    } catch (error) {
      console.error("Error al obtener la información del usuario:", error);
    }
  };


  const Modal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-[85%] max-w-6xl transform transition-all duration-500 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Análisis de CV</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
        
        {/* Mostrar loader mientras estamos cargando */}
        {loading ? (
          <div className="py-12">
            <LoadingScreen 
              variant="analysis"
              message="Analizando tu CV con IA avanzada..."
              subtitle={`Estamos evaluando tu perfil para maximizar tus posibilidades de éxito en: ${practica.title}`}
              fullScreen={false}
              className="bg-transparent"
            />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                💡 <span className="font-medium">¿Sabías que?</span> Un CV optimizado puede aumentar hasta un <span className="font-bold text-blue-600">40%</span> tus posibilidades de ser seleccionado para una entrevista.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mostrar el resultado de la API */}
            {apiResult && (
              <div className="space-y-6">
                {/* Header del análisis mejorado */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold">
                        {apiResult.nombre.nombre || "Análisis de CV"}
                      </h4>
                      <p className="text-emerald-100 text-sm">
                        Puesto: {apiResult.puesto_postular || "No especificado"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">
                        {Math.round((apiResult.mainly_analysis.porcentaje / 10) || 0)}%
                      </div>
                      <div className="text-sm text-emerald-100">Puntaje General</div>
                    </div>
                  </div>

                  {/* Barra de progreso visual */}
                  <div className="w-full bg-emerald-400 rounded-full h-3 mb-4">
                    <div 
                      className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.round((apiResult.mainly_analysis.porcentaje / 10) || 0)}%` }}
                    ></div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-center mb-2">
                      <span className="text-lg font-semibold">
                        Estado: {apiResult.mainly_analysis.estado || "No evaluado"}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-50 leading-relaxed">
                      {apiResult.mainly_analysis.analisis || "Se recomienda mejorar ciertos aspectos de tu CV."}
                    </p>
                  </div>
                </div>

                {/* Indispensables - Detalles del análisis */}
                <div className="bg-white p-6 border rounded-xl shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">Elementos Indispensables</div>
                  </div>
                  <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Elemento</th>
                        <th className="px-4 py-2 text-center">¿Existe?</th>
                        <th className="px-4 py-2 text-center">¿Bien Posicionado?</th>
                        <th className="px-4 py-2 text-center">¿Fácil de distinguir?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiResult.indispensable &&
                        apiResult.indispensable.indispensable.evaluacion.map((element: ElementoEvaluacion) => (
                          <tr className="border-t" key={element.elemento}>
                            <td className="px-4 py-2">{element.elemento}</td>
                            <td className="px-4 py-2 text-center">
                              {element.existe ? "✔️" : "❌"}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {element.bien_posicionado ? "✔️" : "❌"}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {element.facil_de_distinguir ? "✔️" : "❌"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Ajuste de Puesto */}
                <div className="bg-white p-6 border rounded-xl shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">Ajuste para el Puesto</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tarjeta de "Herramientas de análisis" */}
                    <div className="bg-gradient-to-b from-emerald-400 to-emerald-600 p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out transform">
                      <div className="text-xl font-semibold text-white">Herramientas de análisis</div>
                      <div className="mt-2 text-gray-100">
                        <strong>Estado:</strong>{" "}
                        <span className="text-green-100">{apiResult.ajuste_puesto.habilidades_de_analisis.nivel}</span>
                      </div>
                      <div className="mt-2 text-gray-100">
                        <strong>Acción recomendada:</strong> {apiResult.ajuste_puesto.habilidades_de_analisis.accion}
                      </div>
                    </div>

                    {/* Tarjeta de "Resultados cuantificables" */}
                    <div className="bg-gradient-to-b from-teal-400 to-teal-600 p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out transform">
                      <div className="text-xl font-semibold text-white">Resultados cuantificables</div>
                      <div className="mt-2 text-gray-100">
                        <strong>Estado:</strong>{" "}
                        <span className="text-green-100">{apiResult.ajuste_puesto.resultados_cuantificables.nivel}</span>
                      </div>
                      <div className="mt-2 text-gray-100">
                        <strong>Acción recomendada:</strong> {apiResult.ajuste_puesto.resultados_cuantificables.accion}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Tarjeta de "Habilidades blandas" */}
                    <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out transform">
                      <div className="text-xl font-semibold text-white">Habilidades blandas</div>
                      <div className="mt-2 text-gray-100">
                        <strong>Estado:</strong>{" "}
                        <span className="text-yellow-100">{apiResult.ajuste_puesto.habilidades_blandas.nivel}</span>
                      </div>
                      <div className="mt-2 text-gray-100">
                        <strong>Acción recomendada:</strong> {apiResult.ajuste_puesto.habilidades_blandas.accion}
                      </div>
                    </div>

                    {/* Tarjeta de "Lenguaje técnico" */}
                    <div className="bg-gradient-to-b from-indigo-400 to-indigo-600 p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out transform">
                      <div className="text-xl font-semibold text-white">Lenguaje técnico</div>
                      <div className="mt-2 text-gray-100">
                        <strong>Estado:</strong>{" "}
                        <span className="text-indigo-100">{apiResult.ajuste_puesto.lenguaje_tecnico.nivel}</span>
                      </div>
                      <div className="mt-2 text-gray-100">
                        <strong>Acción recomendada:</strong> {apiResult.ajuste_puesto.lenguaje_tecnico.accion}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATS & Optimización */}
                {apiResult.extractedData?.analysisResults?.atsCompliance && (
                  <div className="bg-white p-6 border rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">Compatibilidad ATS</h4>
                        <p className="text-sm text-gray-600">Análisis de compatibilidad con sistemas de seguimiento</p>
                      </div>
                      <div className="ml-auto">
                        <div className="text-2xl font-bold text-blue-600">
                          {apiResult.extractedData.analysisResults.atsCompliance.score}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-red-800 mb-2">🚨 Problemas detectados</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          {apiResult.extractedData.analysisResults.atsCompliance.issues?.map((issue: string, index: number) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-800 mb-2">✅ Recomendaciones</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          {apiResult.extractedData.analysisResults.atsCompliance.recommendations?.map((rec: string, index: number) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Errores Ortográficos y Mejoras */}
                {apiResult.spelling && (
                  <div className="bg-white p-6 border rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">📝</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">Correcciones y Mejoras</h4>
                        <p className="text-sm text-gray-600">{apiResult.spelling.comentario}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Errores ortográficos */}
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-orange-800 mb-3">
                          🔍 Errores ortográficos ({apiResult.spelling.errores})
                        </h5>
                        <div className="space-y-2">
                          {apiResult.spelling.detalle_errores?.map((error: any, index: number) => (
                            <div key={index} className="bg-white p-2 rounded border">
                              <span className="text-red-600 line-through">{error.original}</span>
                              {" → "}
                              <span className="text-green-600 font-semibold">{error.sugerencia}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Verbos de impacto */}
                      {apiResult.verbos_impact && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-purple-800 mb-3">
                            💪 Verbos de Impacto (Nivel {apiResult.verbos_impact.nivel}/10)
                          </h5>
                          <p className="text-sm text-purple-700 mb-3">{apiResult.verbos_impact.comentario}</p>
                          <div className="space-y-2">
                            {apiResult.verbos_impact.sugerencias?.map((sugerencia: string, index: number) => (
                              <div key={index} className="bg-white p-2 rounded border text-sm">
                                • {sugerencia}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Palabras Clave y Repetidas */}
                {(apiResult.extractedData?.analysisResults?.keywordAnalysis || apiResult.repeat_words) && (
                  <div className="bg-white p-6 border rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">🔑</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">Análisis de Palabras Clave</h4>
                        <p className="text-sm text-gray-600">Optimización para el puesto específico</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Palabras clave encontradas */}
                      {apiResult.extractedData?.analysisResults?.keywordAnalysis && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-green-800 mb-3">✅ Palabras clave presentes</h5>
                          <div className="flex flex-wrap gap-1">
                            {apiResult.extractedData.analysisResults.keywordAnalysis.jobKeywordsFound?.map((keyword: string, index: number) => (
                              <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Palabras clave faltantes */}
                      {apiResult.extractedData?.analysisResults?.keywordAnalysis && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-red-800 mb-3">❌ Palabras clave faltantes</h5>
                          <div className="flex flex-wrap gap-1">
                            {apiResult.extractedData.analysisResults.keywordAnalysis.jobKeywordsMissing?.map((keyword: string, index: number) => (
                              <span key={index} className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Palabras repetidas */}
                      {apiResult.repeat_words && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-yellow-800 mb-3">⚠️ Palabras repetidas</h5>
                          <div className="space-y-1">
                            {apiResult.repeat_words.palabras_repetidas?.slice(0, 5).map((palabra: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-yellow-700">{palabra.palabra}</span>
                                <span className="font-semibold text-yellow-800">{palabra.veces}x</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Perfil Profesional Optimizado */}
                {apiResult.perfil_profesional && (
                  <div className="bg-white p-6 border rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-cyan-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">Perfil Profesional Optimizado</h4>
                        <p className="text-sm text-gray-600">Comparación y sugerencias de mejora</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2">📄 Perfil Actual</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {apiResult.perfil_profesional.actual}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">⭐ Perfil Recomendado</h5>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {apiResult.perfil_profesional.recomendado}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumen Ejecutivo */}
                {(apiResult.relevance || apiResult.extractedData?.analysisResults?.feedbackSummary) && (
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 border rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-slate-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">Resumen Ejecutivo</h4>
                        <p className="text-sm text-gray-600">Análisis integral de tu candidatura</p>
                      </div>
                    </div>

                    {apiResult.relevance && (
                      <div className="bg-white p-4 rounded-lg mb-4">
                        <h5 className="font-semibold text-gray-800 mb-2">🎯 Relevancia para el puesto</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">{apiResult.relevance}</p>
                      </div>
                    )}

                    {apiResult.extractedData?.analysisResults?.feedbackSummary && (
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2">📝 Resumen de Evaluación</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {apiResult.extractedData.analysisResults.feedbackSummary}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Información adicional del archivo */}
                {(apiResult.pagination || apiResult.filename) && (
                  <div className="bg-white p-6 border rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">Información del Documento</h4>
                        <p className="text-sm text-gray-600">Análisis técnico del CV</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {apiResult.pagination && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-green-800 mb-2">
                            📏 Extensión ({apiResult.pagination.paginas} página{apiResult.pagination.paginas > 1 ? 's' : ''})
                          </h5>
                          <p className="text-sm text-green-700">{apiResult.pagination.comentario}</p>
                        </div>
                      )}

                      {apiResult.filename && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-800 mb-2">
                            📁 Nombre del archivo
                          </h5>
                          <p className="text-sm text-blue-700">{apiResult.filename.comentario}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Funciones de navegación
  const handleAdaptarCV = async () => {
    if (isAdaptingCV) return; // Prevenir múltiples clics
    
    // Registrar uso de la herramienta
    addToolUsed("crear-cv");

    try {
      setIsAdaptingCV(true);
      setAdaptationStep('extracting');
      setAdaptationError(null);
      
      // Importar dinámicamente el servicio de adaptación
      const { CVAdaptationService } = await import('@/services/cvAdaptationService');
      
      if (!user) {
        setAdaptationError("Debes iniciar sesión para adaptar tu CV");
        setAdaptationStep('error');
        return;
      }

      // 1. Obtener CV actual del usuario
      setAdaptationStep('extracting');
      const currentCV = await CVAdaptationService.getUserCurrentCV(user);
      
      if (!currentCV) {
        // Si no tiene CV, redirigir a crear uno nuevo
        setAdaptationStep('error');
        setAdaptationError("Primero necesitas tener un CV creado. Te llevaremos a crear uno.");
        
        // Esperar un poco para mostrar el error y luego redirigir
        setTimeout(() => {
          const params = new URLSearchParams({
            from: "practica-detail",
            company: practica.company,
            position: practica.title,
            target: "create-new",
          });
          router.push(`/crear-cv?${params.toString()}`);
        }, 3000);
        return;
      }

      // 2. Preparar contexto del trabajo para adaptación
      setAdaptationStep('analyzing');
      const jobContext = {
        jobTitle: practica.title,
        company: practica.company,
        location: practica.location,
        requirements: practica.descripcion || '',
        description: practica.descripcion || '',
        industry: '',
        skills: []
      };

      // 3. Adaptar el CV
      setAdaptationStep('adapting');
      const adaptationResult = await CVAdaptationService.adaptCVForJob(
        currentCV,
        jobContext,
        user
      );

      // 4. Guardar CV adaptado temporalmente
      setAdaptationStep('saving');
      const tempCVId = await CVAdaptationService.saveTemporaryAdaptedCV(
        user,
        adaptationResult.adaptedCV,
        jobContext
      );

      // 5. Completar proceso
      setAdaptationStep('complete');
      
      // Esperar un poco para mostrar el éxito y luego redirigir
      setTimeout(() => {
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
      }, 2000);

    } catch (error) {
      console.error('Error adaptando CV:', error);
      setAdaptationStep('error');
      
      let errorMessage = "Hubo un problema adaptando tu CV. Inténtalo de nuevo.";
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('aborted')) {
          errorMessage = "El proceso está tardando más de lo esperado. Esto puede deberse a un CV complejo o alta demanda del servicio. Por favor, inténtalo de nuevo.";
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setAdaptationError(errorMessage);
    }
  };

  const handleRetryAdaptation = () => {
    setIsAdaptingCV(false);
    setAdaptationError(null);
    setAdaptationStep('extracting');
    // Reiniciar el proceso
    setTimeout(() => {
      handleAdaptarCV();
    }, 500);
  };

  // Si está adaptando CV, mostrar solo la pantalla de carga
  if (isAdaptingCV) {
    return (
      <AdaptationLoadingScreen
        currentStep={adaptationStep}
        errorMessage={adaptationError || undefined}
        onRetry={adaptationStep === 'error' ? handleRetryAdaptation : undefined}
      />
    );
  }

  /*
  const handleAnalizarCV = () => {
    addToolUsed('analizar-cv');
    
    const params = new URLSearchParams({
      puesto: `${practica.title} en ${practica.company}`,
      from: 'practica-detail'
    });
    router.push(`/analizar-cv?${params.toString()}`);
  };*/

  /*
  const handleAnalizarCV = async () => {
    addToolUsed("analizar-cv");

    setIsModalOpen(true);
    setLoading(true);

    if (userInfo) {
      const payload = {
        pdf_url: userInfo.cvFileUrl,
        puesto_postular: practica.title,
        original_name: userInfo.cvFileName,
        descripcion_puesto: practica.descripcion,
      };

      try {
        const response = await fetch(
          "https://api-cv-puesto.onrender.com/analizar-cv/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();
        console.log("Resultado de la API:", result); // Mostrar el resultado en el console
        setApiResult(result);
      } catch (error) {
        console.error("Error al hacer la solicitud a la API:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No se pudo obtener la información del usuario");
      setLoading(false);
    }
  };
*/

const handleAnalizarCV = async () => {
  addToolUsed("analizar-cv");

  setLoading(true);  // Muestra el loader

  if (userInfo) {
    const payload = {
      pdf_url: userInfo.cvFileUrl,
      puesto_postular: practica.title,
      original_name: userInfo.cvFileName,
      descripcion_puesto: practica.descripcion,
    };

    // Abrir una nueva pestaña y pasar los datos como URL o a través de localStorage
    const newTab = window.open(`/analizar-cv-puesto?userInfo=${encodeURIComponent(JSON.stringify(payload))}`, '_blank');
    newTab?.focus();
  } else {
    console.log("No se pudo obtener la información del usuario");
    setLoading(false);
  }
};


  const handleSimularEntrevista = () => {
    // Registrar uso de la herramienta
    addToolUsed("interview-simulation");

    // Navegar a simulación de entrevista con contexto
    const params = new URLSearchParams({
      jobTitle: practica.title,
      company: practica.company,
      from: "practica-detail",
    });
    router.push(`/interview-simulation?${params.toString()}`);
  };

  const handleMejorarMatch = () => {
    // Registrar uso de la herramienta
    addToolUsed("match-cv");

    // Navegar a sugerencias personalizadas
    router.push("/dashboard");
  };

  // Configuración de herramientas
  const tools: ToolCard[] = [
    {
      id: "adapt-cv",
      title: "Adaptar mi CV",
      description: `Personaliza tu CV específicamente para ${practica.title} en ${practica.company} con IA`,
      icon: <FileText className="h-6 w-6" />,
      color: "text-blue-600",
      gradient: "from-blue-500 to-blue-600",
      action: handleAdaptarCV,
      popular: true,
    },
    {
      id: "analyze-cv",
      title: "Analizar mi CV",
      description: `Descubre qué tan compatible es tu CV con los requisitos de ${practica.title}`,
      icon: <Search className="h-6 w-6" />,
      color: "text-purple-600",
      gradient: "from-purple-500 to-purple-600",
      action: handleAnalizarCV,
    },
    {
      id: "interview-sim",
      title: "Simular entrevista",
      description: `Practica entrevistas específicas para ${practica.title} con IA`,
      icon: <Mic className="h-6 w-6" />,
      color: "text-green-600",
      gradient: "from-green-500 to-green-600",
      action: handleSimularEntrevista,
    },
    {
      id: "improve-match",
      title: "Mejorar mi match",
      description:
        "Recibe sugerencias personalizadas para aumentar tu compatibilidad",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-orange-600",
      gradient: "from-orange-500 to-orange-600",
      action: handleMejorarMatch,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header compacto */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-[#028bbf]" />
          Herramientas de IA
        </h3>
        <p className="text-gray-600 text-xs">
          Maximiza tus posibilidades de conseguir esta práctica
        </p>
      </div>

      {/* Llamada de acción compacta */}
      <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] rounded-lg p-3 mb-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 rounded-full p-1.5">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-sm">
                ¡Aumenta tu match score!
              </div>
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

      {/* Grid de herramientas compacto */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`relative bg-gradient-to-br ${tool.gradient} rounded-lg p-4 text-white cursor-pointer transform transition-all duration-300 hover:scale-102 hover:shadow-lg group`}
            onMouseEnter={() => setHoveredTool(tool.id)}
            onMouseLeave={() => setHoveredTool(null)}
            onClick={tool.action}
          >
            {/* Badge popular */}
            {tool.popular && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center">
                <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                Popular
              </div>
            )}

            {/* Contenido compacto */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-lg p-2">{tool.icon}</div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">{tool.title}</h4>
                  <p className="text-xs text-white/90 leading-tight">
                    {tool.description}
                  </p>
                </div>
              </div>
              <ArrowRight
                className={`h-4 w-4 transition-transform duration-300 ${
                  hoveredTool === tool.id ? "translate-x-1" : ""
                }`}
              />
            </div>
            {isModalOpen &&
        ReactDOM.createPortal(
          <Modal onClose={handleCloseModal} />,
          document.body
        )}

            {/* Efecto hover */}
            <div
              className={`absolute inset-0 bg-white/10 rounded-lg opacity-0 transition-opacity duration-300 ${
                hoveredTool === tool.id ? "opacity-100" : ""
              }`}
            ></div>
          </div>
        ))}
      </div>

      {/* Información adicional compacta */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-start space-x-2">
          <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <div className="font-medium text-gray-900 mb-1">
              💡 Ruta recomendada:
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-gray-600">CV</span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <div className="w-4 h-4 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-gray-600">Análisis</span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <div className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-gray-600">Entrevista</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function setUserInfo(userDoc: any) {
  throw new Error("Function not implemented.");
}
