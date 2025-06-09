'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAsyncCVAnalysis } from '../../hooks/useAsyncCVAnalysis';
import CVAnalysisProgress from './CVAnalysisProgress';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface AsyncCVAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  position: string;
}

const AsyncCVAnalysisModal: React.FC<AsyncCVAnalysisModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  position
}) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  const {
    isAnalyzing,
    currentJob,
    error,
    result,
    startAnalysis,
    resetAnalysis
  } = useAsyncCVAnalysis();

  const handleStartAnalysis = async () => {
    const success = await startAnalysis(pdfUrl, position);
    if (success) {
      setHasStarted(true);
    }
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
  };

  const handleAnalysisError = (error: string) => {
    console.error('Error en análisis:', error);
  };

  const handleClose = () => {
    resetAnalysis();
    setJobId(null);
    setAnalysisResult(null);
    setHasStarted(false);
    onClose();
  };

  const handleRestart = () => {
    resetAnalysis();
    setJobId(null);
    setAnalysisResult(null);
    setHasStarted(false);
  };

  const getResultUrl = () => {
    if (analysisResult?.extractedData?.analysisResults?.pdf_url) {
      return analysisResult.extractedData.analysisResults.pdf_url;
    }
    if (typeof analysisResult === 'string' && analysisResult.startsWith('http')) {
      return analysisResult;
    }
    if (result?.extractedData?.analysisResults?.pdf_url) {
      return result.extractedData.analysisResults.pdf_url;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto text-gray-800">
        <DialogHeader>
          <DialogTitle className="text-center">
            Análisis de CV con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!hasStarted && !isAnalyzing && (
            <div className="text-center space-y-4 text-gray-800">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Listo para el análisis?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Analizaremos tu CV para la posición: <span className="font-medium">{position}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Este proceso puede tardar entre 1-2 minutos
                </p>
              </div>
              
              <Button 
                onClick={handleStartAnalysis}
                className="w-full bg-[#028bbf] hover:bg-[#027ba8]"
              >
                Iniciar Análisis
              </Button>
            </div>
          )}

          {isAnalyzing && currentJob && (
            <CVAnalysisProgress
              jobId={currentJob.id}
              onComplete={handleAnalysisComplete}
              onError={handleAnalysisError}
            />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <h4 className="text-sm font-medium text-red-800">Error en el análisis</h4>
              </div>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <div className="flex gap-2">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  size="sm"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}

          {(analysisResult || result) && !isAnalyzing && (
            <div className="bg-green-50 text-gray-800 border border-green-200 rounded-md p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="text-sm font-medium text-green-800">¡Análisis completado!</h4>
              </div>
              
              <p className="text-sm text-green-700 mb-4">
                Tu CV ha sido analizado exitosamente. Puedes ver el resultado detallado en el siguiente enlace.
              </p>

              <div className="flex gap-2">
                {getResultUrl() && (
                  <Button
                    asChild
                    className="flex-1 bg-[#028bbf] hover:bg-[#027ba8]"
                  >
                    <a
                      href={getResultUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver Análisis Completo
                    </a>
                  </Button>
                )}
                
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4 text-gray-800" />
                  Analizar Otro
                </Button>
              </div>
            </div>
          )}

          {!hasStarted && !isAnalyzing && !error && !result && (
            <div className="text-center text-gray-600">
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AsyncCVAnalysisModal;
