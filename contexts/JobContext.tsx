'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Definir la interfaz para los datos del trabajo
interface JobData {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  schedule: string;
  salary: string;
  url: string;
  description?: string;
  requirements?: string;
  publishedDate?: string;
  endDate?: string;
  logo?:string;
  // Campos adicionales que podrían venir de las prácticas
  similitud_requisitos?: number;
  similitud_puesto?: number;
  afinidad_sector?: number;
  similitud_semantica?: number;
  juicio_sistema?: number;
  similitud_total?: number;
  justificacion_requisitos?: string;
  justificacion_puesto?: string;
  justificacion_afinidad?: string;
  justificacion_semantica?: string;
  justificacion_juicio?: string;
}

interface JobContextType {
  selectedJob: JobData | null;
  setSelectedJob: (job: JobData | null) => void;
  clearSelectedJob: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider = ({ children }: JobProviderProps) => {
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);

  const clearSelectedJob = () => {
    setSelectedJob(null);
  };

  const value = {
    selectedJob,
    setSelectedJob,
    clearSelectedJob,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
