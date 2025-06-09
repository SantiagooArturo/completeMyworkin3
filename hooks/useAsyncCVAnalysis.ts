'use client';
import { useState, useCallback } from 'react';
import { CVAnalysisService, CVAnalysisJob } from '../services/cvAnalysisService';
import { useAuth } from './useAuth';

interface UseAsyncCVAnalysisReturn {
  // Estados
  isAnalyzing: boolean;
  currentJob: CVAnalysisJob | null;
  error: string | null;
  result: any | null;
  
  // Funciones
  startAnalysis: (pdfUrl: string, position: string) => Promise<boolean>;
  resetAnalysis: () => void;
  
  // Información adicional
  progress: number;
  estimatedTimeRemaining: number;
  statusMessage: string;
}

export const useAsyncCVAnalysis = (): UseAsyncCVAnalysisReturn => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentJob, setCurrentJob] = useState<CVAnalysisJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  
  const analysisService = CVAnalysisService.getInstance();

  const startAnalysis = useCallback(async (pdfUrl: string, position: string): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setCurrentJob(null);

    try {
      // Crear el trabajo
      const createResult = await analysisService.createAnalysisJob(
        user.uid,
        user.email || '',
        pdfUrl,
        position
      );

      if (!createResult.success) {
        throw new Error(createResult.error || 'Error al crear el trabajo');
      }

      const jobId = createResult.jobId!;

      // Suscribirse a las actualizaciones del trabajo
      const unsubscribe = analysisService.subscribeToJobUpdates(jobId, (updatedJob) => {
        if (updatedJob) {
          setCurrentJob(updatedJob);
          
          if (updatedJob.status === 'completed') {
            setResult(updatedJob.result);
            setIsAnalyzing(false);
            unsubscribe();
          } else if (updatedJob.status === 'failed') {
            setError(updatedJob.error || 'Error en el análisis');
            setIsAnalyzing(false);
            unsubscribe();
          }
        } else {
          setError('Trabajo no encontrado');
          setIsAnalyzing(false);
          unsubscribe();
        }
      });

      return true;

    } catch (err) {
      setError(String(err));
      setIsAnalyzing(false);
      return false;
    }
  }, [user, analysisService]);

  const resetAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setCurrentJob(null);
    setError(null);
    setResult(null);
  }, []);

  // Información derivada
  const progress = currentJob?.progress || 0;
  const estimatedTimeRemaining = currentJob?.estimatedTimeRemaining || 0;
  const statusMessage = currentJob ? analysisService.formatJobStatus(currentJob.status) : '';

  return {
    isAnalyzing,
    currentJob,
    error,
    result,
    startAnalysis,
    resetAnalysis,
    progress,
    estimatedTimeRemaining,
    statusMessage
  };
};
