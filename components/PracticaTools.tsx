'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Sparkles
} from 'lucide-react';
import { PracticaToolsProps } from '@/types/practica';

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

export default function PracticaTools({ practica }: PracticaToolsProps) {
  const router = useRouter();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Funciones de navegación
  const handleAdaptarCV = () => {
    // Navegar al CV Builder con contexto de la práctica
    const params = new URLSearchParams({
      from: 'practica-detail',
      company: practica.company,
      position: practica.title,
      target: 'adapt-cv'
    });
    router.push(`/crear-cv?${params.toString()}`);
  };

  const handleAnalizarCV = () => {
    // Navegar al análisis de CV con contexto específico
    const params = new URLSearchParams({
      puesto: `${practica.title} en ${practica.company}`,
      from: 'practica-detail'
    });
    router.push(`/analizar-cv?${params.toString()}`);
  };

  const handleSimularEntrevista = () => {
    // Navegar a simulación de entrevista con contexto
    const params = new URLSearchParams({
      jobTitle: practica.title,
      company: practica.company,
      from: 'practica-detail'
    });
    router.push(`/interview-simulation?${params.toString()}`);
  };

  const handleMejorarMatch = () => {
    // Navegar a sugerencias personalizadas
    router.push('/dashboard');
  };

  // Configuración de herramientas
  const tools: ToolCard[] = [
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
      icon: <Search className="h-6 w-6" />,
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
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
      action: handleMejorarMatch
    }
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
              <ArrowRight 
                className={`h-4 w-4 transition-transform duration-300 ${
                  hoveredTool === tool.id ? 'translate-x-1' : ''
                }`} 
              />
            </div>

            {/* Efecto hover */}
            <div className={`absolute inset-0 bg-white/10 rounded-lg opacity-0 transition-opacity duration-300 ${
              hoveredTool === tool.id ? 'opacity-100' : ''
            }`}></div>
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
              <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-gray-600">CV</span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <div className="w-4 h-4 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-gray-600">Análisis</span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <div className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-gray-600">Entrevista</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 