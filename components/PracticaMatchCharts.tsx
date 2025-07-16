'use client';

import { useState } from 'react';
import { Info, TrendingUp, User, Target, Star } from 'lucide-react';
import { MatchChartsProps, SimilitudData } from '@/types/practica';

// Componente para un gráfico circular individual
const CircularChart = ({ data }: { data: SimilitudData }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Crear el path del círculo SVG
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (data.value / 100) * circumference;

  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'habilidades técnicas':
        return <TrendingUp className="h-5 w-5" />;
      case 'habilidades blandas':
        return <User className="h-5 w-5" />;
      case 'experiencia':
        return <Star className="h-5 w-5" />;
      case 'título':
        return <Target className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="relative">
      {/* Círculo de progreso */}
      <div 
        className="relative cursor-pointer flex items-center justify-center"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg className="transform -rotate-90 w-20 h-20" viewBox="0 0 96 96">
          {/* Círculo de fondo */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="rgb(229, 231, 235)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Círculo de progreso */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={data.color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        
        {/* Contenido central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-lg font-bold text-gray-900 leading-none tracking-tight">{data.value}%</div>
          <div className="text-xs text-gray-500 text-center">
            {getIcon(data.label)}
          </div>
        </div>
      </div>

      {/* Tooltip con la justificación */}
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-black text-white text-[11px] p-2 rounded-lg shadow-lg">
          <div className="font-medium mb-0.5">{data.label}</div>
          <div className="text-gray-300">{data.justificacion}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-black"></div>
        </div>
      )}
      
      {/* Label */}
      <div className="text-center mt-0.5">
        <div className="text-[11px] text-gray-600 font-medium">{data.label}</div>
      </div>
    </div>
  );
};

export default function PracticaMatchCharts({ similitudes }: MatchChartsProps) {
  // Use the match general value directly from the similitudes array
  const matchGeneral = similitudes.find(s => s.label.toLowerCase() === 'match general')?.value || 0;

  // Determinar nivel de match
  const getNivelMatch = (valor: number) => {
    if (valor >= 70) return { nivel: 'Excelente', color: 'text-green-600', bg: 'bg-green-50' };
    if (valor >= 50) return { nivel: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (valor >= 30) return { nivel: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { nivel: 'Bajo', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const nivelMatch = getNivelMatch(matchGeneral);

  return (
    <div className="mt-1">
      {/* Header con Match Score */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-0 flex items-center">
            <TrendingUp className="h-3.5 w-3.5 mr-1 text-[#028bbf]" />
            Tu Match Score
          </h3>
          <p className="text-gray-600 text-[10px]">
            Evaluación automática de compatibilidad
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-red-500">
            {matchGeneral}%
          </div>
          <div className="text-[10px] font-medium text-red-500">
            Bajo
          </div>
        </div>
      </div>

      {/* Gráficos en una sola fila */}
      <div className="flex justify-between gap-2">
        {similitudes.map((similitud, index) => (
          <CircularChart key={index} data={similitud} />
        ))}
      </div>
    </div>
  );
} 