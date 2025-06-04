"use client";

import React, { useState, useEffect } from "react";
import { analyzeCV, uploadCV } from "../../src/utils/cvAnalyzer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, FileText, Crown, AlertCircle } from "lucide-react";
import Navbar from "@/components/navbar";
import { useAuth } from "../../hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { CreditService } from "@/services/creditService";
import CreditBalance from "@/components/CreditBalance";
import InsufficientCreditsModal from "@/components/InsufficientCreditsModal";

export default function AnalizarCVPage() {
  const { user } = useAuth();
  const { credits, hasEnoughCredits, refreshCredits } = useCredits(user);
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

    try {
      // Para usuarios autenticados, consumir crédito
      if (user) {
        const consumeResult = await CreditService.consumeCredits(user, 'cv-review', 'Análisis de CV');
        
        if (!consumeResult.success) {
          setError(consumeResult.message || 'Error al procesar los créditos');
          return;
        }

        // Actualizar balance de créditos en la UI
        await refreshCredits();
      }

      // 1. Subir el archivo CV
      const cvUrl = await uploadCV(file);

      // 2. Procesar el análisis del CV
      const analysisResult = await analyzeCV(cvUrl, puestoPostular);

      // 3. Mostrar el resultado al usuario
      const finalResultUrl = analysisResult?.extractedData?.analysisResults?.pdf_url || cvUrl;
      setResult(finalResultUrl);

      // Marcar como usado solo después de un análisis exitoso para usuarios no logueados
      if (!user) {
        setFreeUsed(true);
        localStorage.setItem("cv_analysis_used", "true");
      }
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins">
      <Navbar />      <div className="h-[52px]"></div>
      
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900">
              Analiza tu CV con{" "}
              <span className="text-[#028bbf]">Inteligencia Artificial</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Sube tu CV en PDF y recibe feedback instantáneo para el puesto que deseas.
            </p>
            
            {!user && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800">
                  <strong>Análisis gratuito:</strong> Los usuarios no registrados pueden hacer 1 análisis gratuito. 
                  Regístrate para acceso completo con créditos.
                </p>
              </div>
            )}
            
            <Card className="shadow-none border-0">
              <CardContent>
                <div className="space-y-6">
                  {/* Alerta para usuarios no logueados que ya usaron su análisis gratuito */}
                  {!user && freeUsed && (
                    <Alert className="mb-6 border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">
                        Análisis gratuito utilizado
                      </AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Ya usaste tu análisis gratuito. Crea una cuenta para
                        acceder a análisis ilimitados y muchas funciones más.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      dragActive
                        ? "border-primary bg-primary/10"
                        : "border-gray-300"
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
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <span className="text-sm text-gray-600">
                        {file
                          ? file.name
                          : "Arrastra tu CV aquí o haz clic para seleccionar"}
                      </span>
                      <span className="text-xs text-gray-500 mt-2">
                        Solo se aceptan archivos PDF
                      </span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="puesto" className="text-sm font-medium">
                      Puesto al que postulas
                    </label>
                    <Input
                      id="puesto"
                      value={puestoPostular}
                      onChange={(e) => setPuestoPostular(e.target.value)}
                      placeholder="Ej: Desarrollador Frontend"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {loading && (
                    <Alert>
                      <AlertTitle>Analizando tu CV...</AlertTitle>
                      <AlertDescription>
                        <div className="flex flex-col gap-2 items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-[#028bbf] mb-2" />
                          <span>
                            Estamos analizando tu CV. Esto puede demorar hasta 2
                            minutos.
                          </span>
                          {longWait && !veryLongWait && (
                            <span className="text-sm text-gray-500">
                              Sigue esperando, esto puede demorar un poco más de
                              lo normal...
                            </span>
                          )}
                          {veryLongWait && (
                            <span className="text-sm text-red-500">
                              El análisis está tardando demasiado. Puedes
                              intentarlo más tarde o revisar tu conexión.
                            </span>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  {result && (
                    <Alert>
                      <AlertTitle>¡Análisis completado!</AlertTitle>
                      <AlertDescription>
                        <div className="flex flex-col items-center gap-2 mt-2">
                          <p>
                            Tu CV ha sido analizado correctamente. Puedes ver el
                            resultado en el siguiente enlace:
                          </p>
                          <a
                            href={result}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#028bbf] text-white rounded-lg font-medium hover:bg-[#027ba8] transition-colors shadow"
                          >
                            <FileText className="h-5 w-5" />
                            Ver PDF generado
                          </a>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}{" "}
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || !file || !puestoPostular}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Analizar CV
                      </>
                    )}{" "}
                  </Button>                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>      {/* Insufficient Credits Modal */}
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
