'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  FileText, 
  Mic, 
  Search,
  Sparkles,
  Bot
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  videoUrl: string;
}

const tools: Tool[] = [
  {
    id: 'match',
    name: 'Match IA',
    description: 'Encuentra las prácticas que mejor se ajustan a tu perfil con IA',
    icon: <Target className="w-5 h-5" />,
    videoUrl: 'https://www.youtube.com/embed/_2GnA5RXMG0'
  },
  {
    id: 'cv-builder',
    name: 'CV Builder IA',
    description: 'Crea un CV profesional optimizado para cada postulación',
    icon: <FileText className="w-5 h-5" />,
    videoUrl: 'https://www.youtube.com/embed/-m71NYbXR5M'
  },
  {
    id: 'interview',
    name: 'Simulador de Entrevistas',
    description: 'Practica entrevistas con un entrevistador virtual inteligente',
    icon: <Mic className="w-5 h-5" />,
    videoUrl: 'https://www.youtube.com/embed/6O5vFbw0T70'
  },
  {
    id: 'cv-analysis',
    name: 'Análisis de CV',
    description: 'Recibe feedback detallado y mejora tu CV con IA',
    icon: <Search className="w-5 h-5" />,
    videoUrl: 'https://www.youtube.com/embed/FWZenEqyH6M'
  }
];

export default function ToolsShowcase() {
  const [activeTab, setActiveTab] = useState(tools[0].id);
  const activeTool = tools.find(tool => tool.id === activeTab);

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Tu carrera profesional completa.
            <br />
            <span className="relative">
              Impulsada por IA
              <span className="absolute -top-6 right-0">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </span>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Obtén recomendaciones personalizadas, crea CVs optimizados y practica entrevistas.
            Todo en un solo lugar.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center px-6 py-2.5 rounded-full transition-all ${
                  activeTab === tool.id
                    ? 'bg-white text-[#028bbf] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tool.icon}</span>
                {tool.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Tool Info */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-left"
          >
            <div className="inline-flex items-center bg-blue-50 rounded-full px-4 py-2 text-[#028bbf] mb-6">
              <Bot className="w-5 h-5 mr-2" />
              Impulsado por IA
            </div>
            <h3 className="text-3xl font-bold mb-4">{activeTool?.name}</h3>
            <p className="text-xl text-gray-600 mb-8">{activeTool?.description}</p>
            <button className="bg-[#028bbf] text-white px-8 py-3 rounded-full hover:bg-[#027ba8] transition-colors">
              Probar ahora
            </button>
          </motion.div>

          {/* Video Demo */}
          <motion.div
            key={`video-${activeTab}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-gray-900/5 to-gray-900/10 rounded-2xl p-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={`${activeTool?.videoUrl}?autoplay=1&mute=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 