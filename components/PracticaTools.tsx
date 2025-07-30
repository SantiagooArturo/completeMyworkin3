"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  AlertCircle,
  Coins,
} from "lucide-react";
import { PracticaToolsProps } from "@/types/practica";
import { useToolsUsed } from "@/hooks/useToolsUsed";
import ReactDOM from "react-dom";
import { auth, db } from "@/firebase/config"; // Ajusta la ruta si es necesario
import { onAuthStateChanged } from "firebase/auth";
import { User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import AdaptationLoadingScreen from "./AdaptationLoadingScreen";
import LoadingScreen from "./LoadingScreens";
import { useCredits } from "@/hooks/useCredits";
import InsufficientCreditsModal from "./InsufficientCreditsModal";
import { Badge } from "./ui/badge";
import { Button } from "@/components/ui/button";
import CreditPurchaseModal from "./CreditPurchaseModal";
import { ToolCost } from "@/types/credits";

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
  const [adaptationStep, setAdaptationStep] = useState<
    "extracting" | "analyzing" | "adapting" | "saving" | "complete" | "error"
  >("extracting");
  const [adaptationError, setAdaptationError] = useState<string | null>(null);
  const { addToolUsed } = useToolsUsed(practica.title); // Hook para registrar herramientas utilizadas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any | null>(null); // Asegúrate de que 'userInfo' esté correctamente definido
  const [loading, setLoading] = useState(false); // Estado de carga para el loader
  const [apiResult, setApiResult] = useState<any | null>(null);

  const [usuario, setUser] = useState<User | null>(null); // Actualiza el tipo para aceptar User o null

  const { credits, hasEnoughCredits, refreshCredits } = useCredits(user); // Hook para manejar créditos
  const [toolName, setToolName] = useState<string | null>(null);

  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false); // Agregar el estado para el modal de créditos insuficientes
const [toolType, setToolType] = useState<keyof ToolCost>("cv-review");


  useEffect(() => {
    if (!user) {
      const used = localStorage.getItem("cv_analysis_used");
    }
  }, [user]);

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
    //setIsModalOpen(false); // Cierra solo el modal, no redirige
      window.location.reload(); // Recarga la página

  };
  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
  };

  

  /**  <Button
              onClick={handlePurchaseClick}
              className="flex items-center space-x-2"
            >
              <Coins className="h-4 w-4" />
              <span>Comprar Créditos</span>
            </Button> */

  // Funciones de navegación
  const handleAdaptarCV = async () => {
    if (isAdaptingCV) return; // Prevenir múltiples clics

    addToolUsed("crear-cv");
    setToolType("cv-adapt");

    if (!hasEnoughCredits("cv-adapt")) {
      console.log("No tienes suficientes créditos.");
      setToolName("Adaptar mi CV"); // Establecer el nombre correspondiente

      setShowInsufficientCreditsModal(true);  

      return;
    }

    try {
      setIsAdaptingCV(true);
      setAdaptationStep("extracting");
      setAdaptationError(null);

      // Importar dinámicamente el servicio de adaptación
      const { CVAdaptationService } = await import(
        "@/services/cvAdaptationService"
      );

      if (!user) {
        setAdaptationError("Debes iniciar sesión para adaptar tu CV");
        setAdaptationStep("error");
        return;
      }

      // 1. Obtener CV actual del usuario
      setAdaptationStep("extracting");
      const currentCV = await CVAdaptationService.getUserCurrentCV(user);

      if (!currentCV) {
        // Si no tiene CV, redirigir a crear uno nuevo
        setAdaptationStep("error");
        setAdaptationError(
          "Primero necesitas tener un CV creado. Te llevaremos a crear uno."
        );

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
      setAdaptationStep("analyzing");
      const jobContext = {
        jobTitle: practica.title,
        company: practica.company,
        location: practica.location,
        requirements: practica.descripcion || "",
        description: practica.descripcion || "",
        industry: "",
        skills: [],
      };

      // 3. Adaptar el CV
      setAdaptationStep("adapting");
      const adaptationResult = await CVAdaptationService.adaptCVForJob(
        currentCV,
        jobContext,
        user
      );

      // 4. Guardar CV adaptado temporalmente
      setAdaptationStep("saving");
      const tempCVId = await CVAdaptationService.saveTemporaryAdaptedCV(
        user,
        adaptationResult.adaptedCV,
        jobContext
      );

      // 5. Completar proceso
      setAdaptationStep("complete");

      // Esperar un poco para mostrar el éxito y luego redirigir
      setTimeout(() => {
        // 6. Redirigir al editor con el CV adaptado
        const params = new URLSearchParams({
          from: "practica-detail",
          company: practica.company,
          position: practica.title,
          target: "adapt-cv",
          adaptedCVId: tempCVId,
          adaptationId: adaptationResult.adaptationId,
          totalChanges:
            adaptationResult.adaptationSummary.totalChanges.toString(),
        });

        router.push(`/crear-cv?${params.toString()}`);
      }, 2000);
    } catch (error) {
      console.error("Error adaptando CV:", error);
      setAdaptationStep("error");

      let errorMessage =
        "Hubo un problema adaptando tu CV. Inténtalo de nuevo.";

      if (error instanceof Error) {
        if (
          error.message.includes("timeout") ||
          error.message.includes("aborted")
        ) {
          errorMessage =
            "El proceso está tardando más de lo esperado. Esto puede deberse a un CV complejo o alta demanda del servicio. Por favor, inténtalo de nuevo.";
        } else if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          errorMessage =
            "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
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
    setAdaptationStep("extracting");
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
        onRetry={adaptationStep === "error" ? handleRetryAdaptation : undefined}
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
    setToolType("cv-review");

    if (!hasEnoughCredits("cv-review")) {
      setToolName("Analizar mi CV");
      setShowInsufficientCreditsModal(true);  
      return;
    }

    setLoading(true);

    if (userInfo) {
      const payload = {
        pdf_url: userInfo.cvFileUrl,
        puesto_postular: practica.title,
        original_name: userInfo.cvFileName,
        descripcion_puesto: practica.descripcion,
      };

      const newTab = window.open(`/analizar-cv-puesto?userInfo=${encodeURIComponent(JSON.stringify(payload))}`, "_blank");
      newTab?.focus();

      window.location.reload(); 
    } else {
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
    {user && showInsufficientCreditsModal &&
  ReactDOM.createPortal(
    <div onClick={() => setShowInsufficientCreditsModal(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <InsufficientCreditsModal
          isOpen={showInsufficientCreditsModal}
          onClose={() => setShowInsufficientCreditsModal(false)}
          user={user}  // Pasamos solo el usuario si no es null
          toolType={toolType} 
          requiredCredits={1}
          currentCredits={credits}
        />
      </div>
    </div>,
    document.body // El modal se renderiza en el body, fuera del componente
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
