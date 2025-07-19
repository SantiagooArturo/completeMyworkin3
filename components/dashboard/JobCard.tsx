'use client';

import { MapPin, Clock, DollarSign, Bookmark, Building, PiggyBank } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useJobContext } from '@/contexts/JobContext';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';

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
      general: number; // Match general
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
  const { setSelectedJob } = useJobContext();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Verificar si la práctica ya está guardada al cargar el componente
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !user.email) return;

      try {
        const q = query(
          collection(db, "mispostulaciones"),
          where("email", "==", user.email),
          where("status", "==", "guardados"),
          where("title", "==", job.title),
          where("company", "==", job.company)
        );

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setIsSaved(true);
        }
      } catch (error) {
        console.error("Error verificando si la práctica está guardada:", error);
      }
    };

    checkIfSaved();
  }, [user, job.title, job.company]);


  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Guardar los datos completos del trabajo en el contexto
    setSelectedJob({
      id: job.id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      schedule: job.schedule,
      salary: job.salary,
      url: job.applicationUrl || '',
      publishedDate: job.publishedDate,
      // Agregar datos de similitud con nueva estructura
      requisitos_tecnicos: job.skills.technical,
      similitud_puesto: job.skills.soft,
      afinidad_sector: job.skills.experience,
      similitud_semantica: job.skills.macro || 0,
      juicio_sistema: (job.skills.technical + job.skills.soft + job.skills.experience + (job.skills.macro || 0)) / 4,
      similitud_total: (job.skills.technical + job.skills.soft + job.skills.experience + (job.skills.macro || 0)) / 4,
      justificacion_requisitos: 'Evaluación de requisitos técnicos',
      justificacion_puesto: 'Evaluación de compatibilidad con puesto',
      justificacion_afinidad: 'Evaluación de afinidad con el sector',
      justificacion_semantica: 'Evaluación semántica del perfil',
      justificacion_juicio: 'Evaluación general del sistema',
    });
    
    const params = new URLSearchParams({
      title: job.title,
      url: job.applicationUrl || '',
      worky: 'https://mc.ht/s/SH1lIgc'
    });
    router.push(`/postular?${params.toString()}`);
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Verificar que el usuario esté autenticado
    if (!user || !user.email) {
      alert('Debes iniciar sesión para guardar prácticas');
      return;
    }

    // Si ya está guardado, no hacer nada
    if (isSaved) {
      return;
    }

    // Si está en proceso de guardado, no hacer nada
    if (isSaving) return;

    setIsSaving(true);
    
    try {
      // Verificar nuevamente si ya existe antes de guardar (para evitar race conditions)
      const q = query(
        collection(db, "mispostulaciones"),
        where("email", "==", user.email),
        where("status", "==", "guardados"),
        where("title", "==", job.title),
        where("company", "==", job.company)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Ya existe, solo actualizar el estado visual
        setIsSaved(true);
        console.log("La práctica ya estaba guardada");
        return;
      }

      // No existe, proceder a guardar
      const postulacionRef = collection(db, "mispostulaciones");

      await addDoc(postulacionRef, {
        id: Date.now(), // ID único basado en timestamp
        status: "guardados",
        email: user.email,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        schedule: job.schedule,
        appliedDate: new Date().toLocaleDateString(),
        salary: job.salary,
        url: job.applicationUrl || '',
        description: '',
        requirements: '',
        publishedDate: job.publishedDate,
        endDate: '',
        // Agregar datos de similitud
        requisitos_tecnicos: job.skills.technical,
        similitud_puesto: job.skills.soft,
        afinidad_sector: job.skills.experience,
        similitud_semantica: job.skills.macro || 0,
        juicio_sistema: (job.skills.technical + job.skills.soft + job.skills.experience + (job.skills.macro || 0)) / 4,
        similitud_total: (job.skills.technical + job.skills.soft + job.skills.experience + (job.skills.macro || 0)) / 4,
        justificacion_requisitos: 'Evaluación de requisitos técnicos',
        justificacion_puesto: 'Evaluación de compatibilidad con puesto',
        justificacion_afinidad: 'Evaluación de afinidad con el sector',
        justificacion_semantica: 'Evaluación semántica del perfil',
        justificacion_juicio: 'Evaluación general del sistema',
        toolsUsed: [], // Sin herramientas usadas al guardar
        createdAt: new Date() // Fecha de creación
      });

      setIsSaved(true);
      console.log("Práctica guardada exitosamente");

    } catch (error) {
      console.error("Error al guardar la práctica: ", error);
      alert("Error al guardar la práctica. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
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
                  className={`transition-colors ${
                    isSaved 
                      ? 'text-[#028bbf] cursor-default' 
                      : isSaving 
                        ? 'text-gray-500 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-[#028bbf] cursor-pointer'
                  }`}
                  onClick={handleBookmarkClick}
                  disabled={isSaving}
                  title={isSaved ? 'Práctica guardada' : isSaving ? 'Guardando práctica...' : 'Guardar práctica'}
                >
                  {isSaving ? (
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#028bbf] rounded-full"></div>
                  ) : (
                    <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                  )}
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
            percentage={job.skills.general}
            label="Match General"
            color="text-white"
          />
        </div>
      </div>
    </div>
  );
}