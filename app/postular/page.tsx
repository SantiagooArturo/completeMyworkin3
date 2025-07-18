'use client';

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { trackButtonClick } from "@/utils/analytics";
import { Bot, Zap, FileText, Play, Users, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useJobContext } from "@/contexts/JobContext";

import { auth, db } from '../../firebase/config'; // Asegúrate de que la ruta de importación sea correcta
import { onAuthStateChanged } from 'firebase/auth';
import { adminDb } from "@/firebase/admin-config";
import { addDoc, collection, DocumentData, FieldValue, getDocs } from "firebase/firestore";



function PostularContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedJob, clearSelectedJob } = useJobContext();

  const workyUrl = searchParams.get('worky') || 'https://mc.ht/s/SH1lIgc';
  const jobTitle = searchParams.get('title') || selectedJob?.title || 'Práctica profesional';
  const jobUrl = searchParams.get('url') || selectedJob?.url || '';

  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para manejar la visibilidad del modal
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false); // Estado para el segundo modal
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false); // Estado para el tercer modal
  console.log('JOBs', jobTitle);

  // Estado para rastrear las herramientas utilizadas
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);





  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Usuario autenticado:', user);
        setUser(user);
        // Cargar herramientas utilizadas desde localStorage
        const storedTools = localStorage.getItem(`tools_used_${jobTitle}`);
        if (storedTools) {
          setToolsUsed(JSON.parse(storedTools));
        }
      } else {
        console.log('No hay usuario autenticado');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [jobTitle]);




  const handleAnalyzeCVClick = () => {
    trackButtonClick('Analizar CV desde Entrenar');
    // Agregar herramienta a la lista
    addToolUsed('analizar-cv');
  };

  const handlePostularClick = () => {
    trackButtonClick('Postular ahora');
    window.open(jobUrl, "_blank"); 

    setIsModalOpen(true); // Luego muestra el modal

    // El guardado en Firestore y la redirección se harán si se confirma en el modal
  };

  // Función para agregar herramienta utilizada
  const addToolUsed = (tool: string) => {
    const currentTools = JSON.parse(localStorage.getItem(`tools_used_${jobTitle}`) || '[]');
    if (!currentTools.includes(tool)) {
      const newTools = [...currentTools, tool];
      localStorage.setItem(`tools_used_${jobTitle}`, JSON.stringify(newTools));
      setToolsUsed(newTools);
    }
  };

  // Función para obtener el icono y color de cada herramienta
  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'analizar-cv':
        return { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'interview-simulation':
        return { icon: Play, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'crear-cv':
        return { icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'match-cv':
        return { icon: Search, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      default:
        return { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const handleToolClick = (toolName: string) => {
    trackButtonClick(`Herramienta - ${toolName}`);
    // Agregar herramienta según el nombre
    if (toolName === 'Practicar Entrevistas') {
      addToolUsed('interview-simulation');
    } else if (toolName === 'Crear CV') {
      addToolUsed('crear-cv');
    } else if (toolName === 'Análisis CV') {
      addToolUsed('analizar-cv');
    } else if (toolName === 'Simulación Entrevistas') {
      addToolUsed('interview-simulation');
    } else if (toolName === 'Match CV') {
      addToolUsed('match-cv');
    }
  };

  const handleConfirmPostular = () => {
    // Guardamos la postulación en Firestore solo si el usuario está autenticado
    if (user && jobUrl) {
      const postulacionRef = collection(db, "mispostulaciones"); // Accedemos a la colección "mispostulaciones"

      addDoc(postulacionRef, {
        id: Date.now(), // ID único basado en timestamp
        status: "postulados",
        email: user.email,
        title: jobTitle,
        company: selectedJob?.company || "Empresa por definir",
        location: selectedJob?.location || "Ubicación por definir",
        type: selectedJob?.type || "Remoto",
        schedule: selectedJob?.schedule || "Tiempo completo",
        appliedDate: new Date().toLocaleDateString(),
        salary: selectedJob?.salary || "A negociar",
        url: jobUrl,
        description: selectedJob?.description || "",
        requirements: selectedJob?.requirements || "",
        publishedDate: selectedJob?.publishedDate || "",
        endDate: selectedJob?.endDate || "",
        // Agregar datos de similitud con los nuevos campos
        requisitos_tecnicos: selectedJob?.requisitos_tecnicos || 0,
        similitud_puesto: selectedJob?.similitud_puesto || 0,
        afinidad_sector: selectedJob?.afinidad_sector || 0,
        similitud_semantica: selectedJob?.similitud_semantica || 0,
        juicio_sistema: selectedJob?.juicio_sistema || 0,
        similitud_total: selectedJob?.similitud_total || 0,
        justificacion_requisitos: selectedJob?.justificacion_requisitos || "",
        justificacion_puesto: selectedJob?.justificacion_puesto || "",
        justificacion_afinidad: selectedJob?.justificacion_afinidad || "",
        justificacion_semantica: selectedJob?.justificacion_semantica || "",
        justificacion_juicio: selectedJob?.justificacion_juicio || "",
        toolsUsed: toolsUsed, // Agregar las herramientas utilizadas
        createdAt: new Date() // Fecha de creación
      })
        .then(() => {
          console.log("Postulación guardada exitosamente");
          // Limpiar el contexto después de guardar
          clearSelectedJob();
          // En lugar de redirigir, mostramos el modal de entrevista
          setIsModalOpen(false);
          setIsThirdModalOpen(true);
        })
        .catch((error) => {
          console.error("Error al guardar la postulación: ", error);
        });
    }
  };

  const handleCancelPostular = () => {
    setIsModalOpen(false);
    setIsSecondModalOpen(true); // Mostrar el segundo modal
  };

  const handleSaveForLater = () => {
    // Guardamos la práctica como "guardados" en Firestore
    if (user && jobUrl) {
      const postulacionRef = collection(db, "mispostulaciones");

      addDoc(postulacionRef, {
        id: Date.now(), // ID único basado en timestamp
        status: "guardados",
        email: user.email,
        title: jobTitle,
        company: selectedJob?.company || "Empresa por definir",
        location: selectedJob?.location || "Ubicación por definir",
        type: selectedJob?.type || "Remoto",
        schedule: selectedJob?.schedule || "Tiempo completo",
        appliedDate: new Date().toLocaleDateString(),
        salary: selectedJob?.salary || "A negociar",
        url: jobUrl,
        description: selectedJob?.description || "",
        requirements: selectedJob?.requirements || "",
        publishedDate: selectedJob?.publishedDate || "",
        endDate: selectedJob?.endDate || "",
        // Agregar datos de similitud con los nuevos campos
        requisitos_tecnicos: selectedJob?.requisitos_tecnicos || 0,
        similitud_puesto: selectedJob?.similitud_puesto || 0,
        afinidad_sector: selectedJob?.afinidad_sector || 0,
        similitud_semantica: selectedJob?.similitud_semantica || 0,
        juicio_sistema: selectedJob?.juicio_sistema || 0,
        similitud_total: selectedJob?.similitud_total || 0,
        justificacion_requisitos: selectedJob?.justificacion_requisitos || "",
        justificacion_puesto: selectedJob?.justificacion_puesto || "",
        justificacion_afinidad: selectedJob?.justificacion_afinidad || "",
        justificacion_semantica: selectedJob?.justificacion_semantica || "",
        justificacion_juicio: selectedJob?.justificacion_juicio || "",
        toolsUsed: toolsUsed, // Agregar las herramientas utilizadas
        createdAt: new Date()
      })
        .then(() => {
          console.log("Práctica guardada exitosamente");
          // Limpiar el contexto después de guardar
          clearSelectedJob();
          router.push('/postulaciones'); // Redirige a la página de postulaciones
        })
        .catch((error) => {
          console.error("Error al guardar la práctica: ", error);
        });
    }
    setIsSecondModalOpen(false);
  };

  const handleDiscardPractice = () => {
    setIsSecondModalOpen(false);
    // Limpiar el contexto cuando se descarta
    clearSelectedJob();
    router.push('/dashboard'); // Redirige al dashboard
  };

  const handlePracticeNow = () => {
    setIsThirdModalOpen(false);
    // Limpiar el contexto al finalizar
    clearSelectedJob();
    router.push('/interview-simulation'); // Redirige a la simulación de entrevista
  };

  const handlePracticeLater = () => {
    setIsThirdModalOpen(false);
    // Limpiar el contexto al finalizar
    clearSelectedJob();
    router.push('/postulaciones'); // Redirige a la página de postulaciones
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSecondModalOpen(false);
    setIsThirdModalOpen(false);
    // Limpiar el contexto cuando se cierra el modal
    clearSelectedJob();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-12">
      <Navbar />
      <div className="container mx-auto px-4">
        {/* Header mejorado */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¿Listo para postular a
          </h1>
          <div className="inline-block bg-[#028bbf] text-white px-6 py-2 rounded-full text-xl md:text-2xl font-semibold mb-4">
            {jobTitle}
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Usa nuestras herramientas de IA para maximizar tus posibilidades de éxito
          </p>
        </div>

        {/* Herramientas utilizadas */}
        {toolsUsed.length > 0 && (
          <div className="mb-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Herramientas utilizadas para este puesto
                </h3>
                <p className="text-sm text-gray-600">
                  Has usado {toolsUsed.length} herramienta{toolsUsed.length > 1 ? 's' : ''} de preparación
                </p>
              </div>
              <div className="flex justify-center gap-6">
                {toolsUsed.map((tool, index) => {
                  const { icon: Icon, color, bgColor } = getToolIcon(tool);
                  const toolNames = {
                    'analizar-cv': 'Análisis CV',
                    'interview-simulation': 'Simulación Entrevista',
                    'crear-cv': 'Crear CV',
                    'match-cv': 'Match CV'
                  };
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                      title={toolNames[tool as keyof typeof toolNames] || tool}
                    >
                      <div
                        className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md`}
                      >
                        <Icon className={`h-8 w-8 ${color}`} />
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        {toolNames[tool as keyof typeof toolNames] || tool}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sección de decisión principal */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Opción recomendada: Prepararse primero */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#028bbf] relative">
              <div className="text-center mb-6 pt-4">
                <div className="w-16 h-16 bg-[#028bbf] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Prepárate Primero
                </h2>
                <p className="text-gray-600">
                  Usa nuestras herramientas de IA para maximizar tus posibilidades
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">Aumenta 85% tus posibilidades</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">CV optimizado con IA</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Play className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-purple-800 font-medium">Práctica de entrevistas</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/analizar-cv">
                  <button
                    className="w-full bg-[#028bbf] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#027ba8] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    onClick={() => {
                      handleAnalyzeCVClick();
                    }}
                  >
                    <FileText className="h-5 w-5" />
                    Analizar mi CV con IA
                  </button>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link href="/interview-simulation">
                    <button
                      className="w-full bg-gray-100 text-gray-800 px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                      onClick={() => {
                        handleToolClick('Practicar Entrevistas');
                      }}
                    >
                      Practicar Entrevistas
                    </button>
                  </Link>
                  <Link href="/crear-cv">
                    <button
                      className="w-full bg-gray-100 text-gray-800 px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                      onClick={() => {
                        handleToolClick('Crear CV');
                      }}
                    >
                      Crear CV
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Opción directa: Postular ahora */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Postular Directamente
                </h2>
                <p className="text-gray-600">
                  Si ya tienes tu CV listo y optimizado
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Competencia Alta</span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    Las empresas reciben +200 aplicaciones. Destacar es clave.
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>Asegúrate de tener:</strong></p>
                  <ul className="space-y-1">
                    <li>• CV optimizado para esta posición</li>
                    <li>• Palabras clave del job posting</li>
                    <li>• Experiencia relevante destacada</li>
                  </ul>
                </div>
              </div>

              {jobUrl ? (
                <button
                  onClick={() => {
                    handlePostularClick();
                  }}
                  className="w-full bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <FileText className="h-5 w-5" />
                  Postular Ahora
                </button>
              ) : (
                <div className="w-full bg-gray-50 text-gray-500 px-6 py-4 rounded-xl text-center border border-gray-200">
                  <p className="text-sm">URL de postulación no disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal 1: Confirmación de postulación */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-[40%] border-none">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-left">¿Lograste completar la postulación?</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-left mb-4">Queremos ayudarte a llevar un buen seguimiento de tus postulaciones. Si aplicaste, la añadiremos automáticamente a tu Job Tracker.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelPostular}
                  className="bg-inherit text-myworkin-blue border border-myworkin-blue px-6 py-2 rounded-lg font-medium"
                >
                  No postulé
                </button>
                <button
                  onClick={handleConfirmPostular}
                  className="bg-myworkin-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-myworkin-blue-dark transition-colors"
                >
                  Sí, postulé con éxito
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: No pudo completar la postulación */}
        {isSecondModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-[40%] border-none">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-left">¿No pudiste completar la postulación?</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-left mb-4">Sabemos que a veces algo se cruza en el camino. ¿Quieres guardar esta práctica para retomarla más adelante?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleDiscardPractice}
                  className="bg-inherit text-myworkin-blue border border-myworkin-blue px-6 py-2 rounded-lg font-medium"
                >
                  No, descartar
                </button>
                <button
                  onClick={handleSaveForLater}
                  className="bg-myworkin-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-myworkin-blue-dark transition-colors"
                >
                  Sí, guardar práctica
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Práctica de entrevista */}
        {isThirdModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-[40%] border-none">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-left">¿Quieres practicar tu entrevista para este puesto?</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-left mb-4">Te ayudamos a prepararte con preguntas reales y feedback automático. Así, cuando llegue la entrevista, ya sabrás qué decir y cómo decirlo.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handlePracticeLater}
                  className="bg-inherit text-myworkin-blue border border-myworkin-blue px-6 py-2 rounded-lg font-medium"
                >
                  Quizás más tarde
                </button>
                <button
                  onClick={handlePracticeNow}
                  className="bg-myworkin-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-myworkin-blue-dark transition-colors"
                >
                  Sí, practicar ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección de estadísticas y testimonios - MyWorkIn */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-[#028bbf] to-[#0369a1] rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">
                ¿Por qué usar MyWorkIn antes de postular?
              </h3>
              <p className="text-blue-100">
                Datos reales de nuestros usuarios que usaron nuestras herramientas
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">85%</div>
                <p className="text-blue-100">Mayor tasa de respuesta</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">6,000+</div>
                <p className="text-blue-100">Jóvenes ya entrenados</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4.8⭐</div>
                <p className="text-blue-100">Calificación promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de herramientas principales */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Prepárate con nuestras herramientas de <span className="text-[#028bbf]">Inteligencia Artificial</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Análisis de CV */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-[#028bbf] rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Análisis CV</h3>
                <p className="text-sm text-gray-600">IA Avanzada</p>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                <li>• Feedback detallado y preciso</li>
                <li>• Puntuación profesional</li>
                <li>• Sugerencias específicas</li>
              </ul>
              <Link href="/analizar-cv">
                <button
                  className="w-full bg-[#028bbf] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#027ba8] transition-colors text-sm flex items-center justify-center gap-2"
                  onClick={() => handleToolClick('Análisis CV')}
                >
                  <FileText className="h-4 w-4" />
                  Analizar CV
                </button>
              </Link>
            </div>

            {/* Simulación de Entrevistas */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Entrevistas</h3>
                <p className="text-sm text-gray-600">Simulación IA</p>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                <li>• Preguntas personalizadas</li>
                <li>• Feedback en tiempo real</li>
                <li>• Mejora tu performance</li>
              </ul>
              <Link href="/interview-simulation">
                <button
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2"
                  onClick={() => handleToolClick('Simulación Entrevistas')}
                >
                  <Play className="h-4 w-4" />
                  Practicar
                </button>
              </Link>
            </div>

            {/* Constructor de CV */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Crear CV</h3>
                <p className="text-sm text-gray-600">Formato Harvard</p>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                <li>• Formato profesional</li>
                <li>• Vista previa en tiempo real</li>
                <li>• Descarga PDF optimizada</li>
              </ul>
              <Link href="/crear-cv">
                <button
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors text-sm flex items-center justify-center gap-2"
                  onClick={() => handleToolClick('Crear CV')}
                >
                  <FileText className="h-4 w-4" />
                  Crear CV
                </button>
              </Link>
            </div>

            {/* Match de Empleos */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Match CV</h3>
                <p className="text-sm text-gray-600">Búsqueda IA</p>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                <li>• Empleos compatibles</li>
                <li>• Análisis inteligente</li>
                <li>• Recomendaciones precisas</li>
              </ul>
              <Link href="/match-cv">
                <button
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm flex items-center justify-center gap-2"
                  onClick={() => handleToolClick('Match CV')}
                >
                  <Search className="h-4 w-4" />
                  Buscar Empleos
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tips finales optimizados */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Proceso recomendado para postular
            </h3>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Analizar CV</h4>
                <p className="text-gray-600 text-sm">Recibe feedback detallado de IA</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Optimizar CV</h4>
                <p className="text-gray-600 text-sm">Aplicar mejoras sugeridas</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Practicar</h4>
                <p className="text-gray-600 text-sm">Simular entrevista con IA</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Postular</h4>
                <p className="text-gray-600 text-sm">Aplicar con confianza</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/dashboard">
                <button className="bg-[#028bbf] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#027ba8] transition-colors">
                  Ver todas mis herramientas
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostularPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
        <p className="ml-2">Cargando...</p>
      </div>
    }>
      <PostularContent />
    </Suspense>
  );
}