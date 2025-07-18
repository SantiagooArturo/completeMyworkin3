"use client";

import React, { useState, useEffect } from "react";
import { analyzeCV, uploadCV } from "../../src/utils/cvAnalyzer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, FileText, AlertCircle, History, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import { useAuth } from "../../hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import InsufficientCreditsModal from "@/components/InsufficientCreditsModal";
import { cvReviewService } from "../../services/cvReviewService";
import { useToolsUsed } from "@/hooks/useToolsUsed";
import Link from "next/link";

export default function AnalizarCVPage() {
  const { user } = useAuth();
  const { credits, hasEnoughCredits, refreshCredits, reserveCredits, confirmReservation, revertReservation } = useCredits(user);
  const [file, setFile] = useState<File | null>(null);
  const [puestoPostular, setPuestoPostular] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [freeUsed, setFreeUsed] = useState(false);
  const [longWait, setLongWait] = useState(false);
  const [veryLongWait, setVeryLongWait] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  
  const { addToolUsed } = useToolsUsed(puestoPostular); // Hook para manejar herramientas utilizadas

  useEffect(() => {
    if (!user) {
      const used = localStorage.getItem("cv_analysis_used");
      setFreeUsed(used === "true");
    }
  }, [user]);

  useEffect(() => {
    let longWaitTimer: NodeJS.Timeout;
    let veryLongWaitTimer: NodeJS.Timeout;
    if (loading) {
      setLongWait(false);
      setVeryLongWait(false);
      longWaitTimer = setTimeout(() => setLongWait(true), 30000); // 30s
      veryLongWaitTimer = setTimeout(() => setVeryLongWait(true), 120000); // 2min
    } else {
      setLongWait(false);
      setVeryLongWait(false);
    }
    return () => {
      clearTimeout(longWaitTimer);
      clearTimeout(veryLongWaitTimer);
    };
  }, [loading]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Por favor, sube un archivo PDF");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Por favor, sube un archivo PDF");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Por favor, sube un archivo PDF");
      return;
    }
    if (!puestoPostular) {
      setError("Por favor, ingresa el puesto al que postulas");
      return;
    }

    // Verificar autenticación para usuarios registrados
    if (!user && freeUsed) {
      setError("Has usado tu análisis gratuito. Inicia sesión para analizar más CVs.");
      return;
    }

    // Para usuarios autenticados, verificar créditos
    if (user && !hasEnoughCredits('cv-review')) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    setLoading(true); 
    setError(null);
    setResult(null);
    setLongWait(false);
    setVeryLongWait(false);

    let reservationId = '';

    try {
      // Para usuarios autenticados, RESERVAR créditos (no consumir aún)
      if (user) {
        const reserveResult = await reserveCredits('cv-review', 'Análisis de CV');
        
        if (!reserveResult.success) {
          setError('No se pudieron reservar los créditos. Inténtalo de nuevo.');
          return;
        }

        reservationId = reserveResult.reservationId;
        console.log('🔒 Créditos reservadños con ID:', reservationId);
      }

      // 1. Subir el archivo CV
      const cvUrl = await uploadCV(file);

      // 2. Procesar el análisis del CV
      const analysisResult = await analyzeCV(cvUrl, puestoPostular, file.name);

      // 3. NUEVO: Guardar en Firebase (solo para usuarios autenticados)
      if (user) {
        const reviewData = {
          userId: user.uid,
          fileName: file.name,
          fileSize: file.size,
          status: 'completed' as const,
          result: analysisResult,
          createdAt: new Date(),
          updatedAt: new Date(),
          position: puestoPostular,
          fileUrl: cvUrl
        };

        const savedReview = await cvReviewService.saveReview(reviewData);
      }
      
      // 4. Confirmar el consumo de créditos (después del éxito)
      if (user && reservationId) {
        const confirmResult = await confirmReservation(reservationId, 'cv-review', 'Análisis de CV completado');
        
        if (confirmResult) {
          console.log('✅ Créditos consumidos exitosamente');
          // Actualizar balance de créditos en la UI
          await refreshCredits();
        } else {
          console.warn('⚠️ Advertencia: Análisis exitoso pero error al confirmar créditos');
          // El análisis fue exitoso, pero hubo un problema con los créditos
        }
      }

      // 5. Mostrar el resultado al usuario
      const finalResultUrl = analysisResult?.extractedData?.analysisResults?.pdf_url || cvUrl;
      setResult(finalResultUrl);

      // 6. Registrar el uso de la herramienta
      if (puestoPostular) {
        addToolUsed('analizar-cv');
      }

      // Marcar como usado solo después de un análisis exitoso para usuarios no logueados
      if (!user) {
        setFreeUsed(true);
        localStorage.setItem("cv_analysis_used", "true");
      }

    } catch (error) {
      console.error('❌ Error en análisis de CV:', error);
      
      // ❌ SI HAY ERROR, REVERTIR LA RESERVA DE CRÉDITOS
      if (user && reservationId) {
        try {
          await revertReservation(reservationId, 'cv-review', 'Error en el servicio de análisis: ' + (error instanceof Error ? error.message : 'Error desconocido'));
          console.log('🔄 Reserva de créditos revertida por error en el servicio');
        } catch (revertErr) {
          console.error('❌ Error al revertir reserva:', revertErr);
          // En este caso, podríamos notificar al soporte para revisión manual
        }
      }
      
      const errorMsg = error instanceof Error ? error.message : "Error al analizar el CV";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = async (purchaseData: any) => {
    // Actualizar balance de créditos después de la compra
    if (user) {
      await refreshCredits();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="h-[52px]"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Análisis de CV con <span className="text-blue-600">IA</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sube tu CV en PDF y recibe feedback detallado e instantáneo para el puesto que deseas.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Clock className="h-4 w-4" />
              Créditos disponibles: {credits}
            </div>
            {user && (
              <Link href="/historial-cv">
                <Button variant="outline" size="sm" className="flex text-black items-center gap-2">
                  <History className="h-4 w-4" />
                  Ver Historial
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Alerta para usuarios no autenticados */}
        {!user && (
          <Alert className="mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Análisis gratuito:</strong> Los usuarios no registrados pueden hacer 1 análisis gratuito. 
              Regístrate para acceso completo con créditos y historial de análisis.
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario principal */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Alerta para usuarios no logueados que ya usaron su análisis gratuito */}
              {!user && freeUsed && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <div>
                    <div className="font-semibold text-amber-800">
                      Análisis gratuito utilizado
                    </div>
                    <div className="text-amber-700 text-sm mt-1">
                      Ya usaste tu análisis gratuito. Crea una cuenta para
                      acceder a análisis ilimitados y muchas funciones más.
                    </div>
                  </div>
                </Alert>
              )}
              
              {/* Zona de subida de archivos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sube tu CV (formato PDF)
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-blue-500 mb-4" />
                    <span className="text-lg font-medium text-gray-900 mb-2">
                      {file
                        ? file.name
                        : "Arrastra tu CV aquí o haz clic para seleccionar"}
                    </span>
                    <span className="text-sm text-gray-500">
                      Solo se aceptan archivos PDF
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Campo de puesto */}
              <div>
                <label htmlFor="puesto" className="block text-sm font-medium text-gray-700 mb-2">
                  Puesto al que postulas
                </label>
                <Input
                  id="puesto"
                  value={puestoPostular}
                  onChange={(e) => setPuestoPostular(e.target.value)}
                  placeholder="Ej: Desarrollador Frontend, Analista de Marketing, Practicante de Ventas"
                  className="w-full"
                />
              </div>

              {/* Información sobre el análisis */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">¿Qué incluye el análisis?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Evaluación detallada de tu CV con IA avanzada</li>
                  <li>• Puntuación profesional y feedback específico</li>
                  <li>• Sugerencias de mejora personalizadas</li>
                  <li>• Optimización para el puesto específico</li>
                  <li>• Reporte en PDF descargable</li>
                </ul>
              </div>

              {/* Balance de créditos para usuarios autenticados */}
              {user && (
                <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-green-800">Balance actual:</span>
                  <span className="font-semibold text-green-900">{credits} créditos</span>
                </div>
              )}
              
              {/* Errores */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <div className="font-semibold">Error</div>
                    <div className="text-sm mt-1">{error}</div>
                  </div>
                </Alert>
              )}
              
              {/* Estado de carga */}
              {loading && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-900">Analizando tu CV...</div>
                    <div className="text-blue-800 text-sm mt-1">
                      Estamos analizando tu CV. Esto puede demorar hasta 2 minutos.
                      {longWait && !veryLongWait && (
                        <span className="block mt-1 text-blue-700">
                          Sigue esperando, esto puede demorar un poco más de lo normal...
                        </span>
                      )}
                      {veryLongWait && (
                        <span className="block mt-1 text-red-600">
                          El análisis está tardando demasiado. Puedes intentarlo más tarde o revisar tu conexión.
                        </span>
                      )}
                    </div>
                  </div>
                </Alert>
              )}
              
              {/* Resultado exitoso */}
              {result && (
                <Alert className="border-green-200 bg-green-50">
                  <FileText className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">¡Análisis completado!</div>
                    <div className="text-green-800 text-sm mt-1 mb-4">
                      Tu CV ha sido analizado correctamente. Puedes ver el resultado en el siguiente enlace:
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={result}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex mx-auto items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow"
                      >
                        <FileText className="h-5 w-5" />
                        Ver PDF Analizado
                      </a>
                    </div>
                    
                    {user && (
                      <p className="text-sm mx-auto text-green-700 mt-3">
                        Tu análisis se ha guardado en tu historial personal.
                      </p>
                    )}
                  </div>
                </Alert>
              )}

              {/* Botón principal */}
              <Button
                onClick={handleAnalyze}
                disabled={loading || !file || !puestoPostular || (!user && freeUsed)}
                className="w-full h-12 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Analizar CV
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insufficient Credits Modal */}
      {user && (
        <InsufficientCreditsModal
          isOpen={showInsufficientCreditsModal}
          onClose={() => setShowInsufficientCreditsModal(false)}
          user={user}
          toolType="cv-review"
          requiredCredits={1}
          currentCredits={credits}
        />
      )}
    </div>
  );
}
