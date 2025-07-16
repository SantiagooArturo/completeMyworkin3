'use client';

import { MapPin, Clock, DollarSign, Heart, Building, PiggyBank } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    schedule: string;
    salary: string;
    publishedDate: string;
    applicationUrl?: string; // AGREGAR ESTA PROPIEDAD OPCIONAL
    skills: {
      technical: number;
      soft: number;
      experience: number;
      macro?: number;
    };
  };
  index?: number; // Para navegación al detalle
  onCardClick?: (index: number) => void; // Callback para click en el card
}

function CircularProgress({ percentage, label, color }: { percentage: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 mb-2">
        <svg className={`w-20 h-20 transform -rotate-90 ${color}`} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            opacity={0.25}
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <p className="text-sm text-white text-center font-medium">{label}</p>
    </div>
  );
}

function getPublishedAgo(dateString: string) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

export default function JobCard({ job, index, onCardClick }: JobCardProps) {
  const router = useRouter();

  // Calcular el match general como la suma de las 4 similitudes
  const matchGeneral = job.skills.technical + job.skills.soft + job.skills.experience + (job.skills.macro || 0);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams({
      title: job.title,
      url: job.applicationUrl || '',
      worky: 'https://mc.ht/s/SH1lIgc'
    });
    router.push(`/postular?${params.toString()}`);
  };

  const handleCardClick = () => {
    if (typeof index === 'number' && onCardClick) {
      onCardClick(index);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl border-gray-200 p-1 hover:shadow-md transition-shadow min-h-[200px] flex cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex-1 p-4 flex flex-col">
        {/* Logo y título */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Company Logo */}
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building className="h-8 w-8 text-gray-400" />
          </div>

          {/* Job Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-500">
                Publicado {job.publishedDate}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 group-hover:text-[#028bbf] transition-colors opacity-0 group-hover:opacity-100">
                  Click para ver detalle
                </span>
                <button 
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#028bbf] transition-colors">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium">
              {job.company}
            </p>
          </div>
        </div>

        {/* Detalles del trabajo en formato horizontal */}
        <div className="flex items-center justify-between mt-4">
          {/* Columna izquierda de detalles */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              <span>{job.type}</span>
            </div>
          </div>

          {/* Columna derecha de detalles */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{job.schedule}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <PiggyBank className="h-4 w-4" />
              <span>{job.salary}</span>
            </div>
          </div>

          {/* Botón de aplicar ACTUALIZADO */}
          <button 
            onClick={handleApplyClick}
            className="bg-myworkin-blue hover:bg-myworkin-600 text-white px-8 py-3 rounded-xl font-medium transition-colors whitespace-nowrap z-10 relative"
          >
            Aplicar ahora
          </button>
        </div>
      </div>

      {/* Skills Match aquí */}
      <div className="ml-6 flex flex-col self-stretch justify-center items-center bg-gradient-to-r from-teal-500 via-myworkin-500 to-teal-500 rounded-2xl px-8 w-auto">
        <div className="flex space-x-8">
          <CircularProgress
            percentage={Math.round(matchGeneral)}
            label="Match General"
            color="text-white"
          />
        </div>
      </div>
    </div>
  );
}