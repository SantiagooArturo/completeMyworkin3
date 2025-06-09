'use client';
import React, { useState, useEffect } from 'react';
import { CVAnalysisService, CVAnalysisJob } from '../../services/cvAnalysisService';

interface CVAnalysisProgressProps {
  jobId: string;
  onComplete: (result: any) => void;
  onError: (error: string) => void;
}

const CVAnalysisProgress: React.FC<CVAnalysisProgressProps> = ({
  jobId,
  onComplete,
  onError
}) => {
  const [job, setJob] = useState<CVAnalysisJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const analysisService = CVAnalysisService.getInstance();

  useEffect(() => {
    if (!jobId) return;

    // Usar listener en tiempo real si está disponible, sino polling
    let unsubscribe: (() => void) | null = null;
    let stopPolling: (() => void) | null = null;

    try {
      // Intentar usar listener en tiempo real
      unsubscribe = analysisService.subscribeToJobUpdates(jobId, (updatedJob) => {
        setIsLoading(false);
        
        if (updatedJob) {
          setJob(updatedJob);
          
          if (updatedJob.status === 'completed' && updatedJob.result) {
            onComplete(updatedJob.result);
          } else if (updatedJob.status === 'failed') {
            onError(updatedJob.error || 'Error en el análisis');
          }
        } else {
          onError('Trabajo no encontrado');
        }
      });
    } catch (error) {
      // Si falla el listener, usar polling
      console.log('Usando polling como fallback');
      
      analysisService.pollJobStatus(
        jobId,
        (updatedJob) => {
          setIsLoading(false);
          setJob(updatedJob);
        },
        (completedJob) => {
          onComplete(completedJob.result);
        },
        (error) => {
          onError(error);
        }
      ).then(stopFn => {
        stopPolling = stopFn;
      });
    }

    // Cleanup
    return () => {
      if (unsubscribe) unsubscribe();
      if (stopPolling) stopPolling();
    };
  }, [jobId, onComplete, onError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Conectando...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <p className="text-gray-600">No se pudo encontrar el trabajo</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 border">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Analizando CV
        </h3>
        <p className="text-sm text-gray-600">
          Posición: <span className="font-medium">{job.position}</span>
        </p>
      </div>

      {/* Estado */}
      <div className="flex justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
          {analysisService.formatJobStatus(job.status)}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progreso</span>
          <span>{job.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(job.status)}`}
            style={{ width: `${Math.min(job.progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Tiempo estimado */}
      {job.status === 'processing' && job.estimatedTimeRemaining !== undefined && (
        <div className="text-center text-sm text-gray-600 mb-4">
          Tiempo estimado restante: {analysisService.formatEstimatedTime(job.estimatedTimeRemaining)}
        </div>
      )}

      {/* Indicador de procesamiento */}
      {job.status === 'processing' && (
        <div className="flex justify-center items-center mb-4">
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animation-delay-200"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animation-delay-400"></div>
          </div>
          <span className="ml-3 text-sm text-gray-600">Procesando...</span>
        </div>
      )}

      {/* Error */}
      {job.status === 'failed' && job.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="flex">
            <div className="text-red-400 text-sm">⚠️</div>
            <div className="ml-2">
              <p className="text-sm text-red-700">
                Error: {job.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {job.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <div className="text-green-400 text-sm">✅</div>
            <div className="ml-2">
              <p className="text-sm text-green-700">
                ¡Análisis completado exitosamente!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 text-center">
        <p>ID del trabajo: {job.id}</p>
        {job.createdAt && (
          <p>Iniciado: {new Date(job.createdAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default CVAnalysisProgress;
