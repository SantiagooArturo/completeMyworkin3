"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const { addToolUsed } = useToolsUsed(practica.title); // Hook para registrar herramientas utilizadas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any | null>(null); // Asegúrate de que 'userInfo' esté correctamente definido
  const [loading, setLoading] = useState(false); // Estado de carga para el loader
  const [apiResult, setApiResult] = useState<any | null>(null);

  const [user, setUser] = useState<User | null>(null); // Actualiza el tipo para aceptar User o null
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Almacena el usuario en el estado
        if (user.email) {
          fetchUserInfo(user.email); // Llama a la función solo si user.email es un string
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

  const fetchUserInfoByEmail = async (email: string) => {
    try {
      const usersRef = collection(db, "users"); // Accede a la colección 'users'
      const q = query(usersRef, where("email", "==", email)); // Consulta para buscar por email

      const querySnapshot = await getDocs(q); // Ejecuta la consulta

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data(); // Toma el primer documento (asumiendo que es único)
        setUserInfo(userDoc); // Almacena la información del usuario
      } else {
        console.log("Usuario no encontrado");
      }
    } catch (error) {
      console.error("Error al obtener la información del usuario:", error);
    }
  };

  const Modal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[50%] transform transition-all duration-500 max-h-[80vh] overflow-y-auto">
     <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Análisis de CV</h3>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <span className="text-2xl">×</span> {/* Aquí está la X */}
        </button>
      </div>
        {/* Mostrar loader mientras estamos cargando */}
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Mostrar el resultado de la API */}
            {apiResult && (
              <>
<div className="bg-gradient-to-b from-emerald-500 to-emerald-300 p-6 rounded-lg shadow-lg text-white mx-auto">
  <div className="flex justify-between items-center">
    <div className="text-lg font-semibold">
      {apiResult.nombre.nombre || "No identificado"}
    </div>
    <div className="text-sm">
      {apiResult.puesto_postular || "Puesto no definido"}
    </div>
  </div>

  <div className="my-4">
    <div className="text-3xl font-bold">
      {apiResult.mainly_analysis.porcentaje / 10 || "N/A"}
    </div>
    <div className="text-sm">Puntaje General</div>
  </div>

  <div className="bg-green-50 p-2 rounded text-center text-black font-semibold">
    Tu CV está{" "}
    <span className="font-bold">
      {apiResult.mainly_analysis.estado || "No observado"}
    </span>
  </div>

  <div className="mt-4 text-sm">
    <p>
      {apiResult.mainly_analysis.analisis ||
        "Se recomienda mejorar ciertos aspectos de tu CV."}
    </p>
  </div>
</div>

<br />

{/* Indispensables - Detalles del análisis */}
<div className="max-w-4xl mx-auto p-4 border rounded-lg shadow-md">
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

<br />

{/* Ajuste de Puesto */}
<div className="max-w-4xl mx-auto p-4 border rounded-lg shadow-md">
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




              </>
            )}
          </>
        )}

  
      </div>
    </div>
  );

  // Funciones de navegación
  const handleAdaptarCV = () => {
    // Registrar uso de la herramienta
    addToolUsed("crear-cv");

    // Navegar al CV Builder con contexto de la práctica
    const params = new URLSearchParams({
      from: "practica-detail",
      company: practica.company,
      position: practica.title,
      target: "adapt-cv",
    });
    router.push(`/crear-cv?${params.toString()}`);
  };

  /*
  const handleAnalizarCV = () => {
    addToolUsed('analizar-cv');
    
    const params = new URLSearchParams({
      puesto: `${practica.title} en ${practica.company}`,
      from: 'practica-detail'
    });
    router.push(`/analizar-cv?${params.toString()}`);
  };*/

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
