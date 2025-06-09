"use client";

import React, { useState, useEffect } from "react";
import { uploadCV } from "../../src/utils/cvAnalyzer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, FileText, AlertCircle } from "lucide-react";
import Navbar from "@/components/navbar";
import { useAuth } from "../../hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import InsufficientCreditsModal from "@/components/InsufficientCreditsModal";
import AsyncCVAnalysisModal from "@/components/cv/AsyncCVAnalysisModal";

export default function AnalizarCVPage() {
  const { user } = useAuth();
  const { credits, hasEnoughCredits, refreshCredits } = useCredits(user);
  const [file, setFile] = useState<File | null>(null);
  const [puestoPostular, setPuestoPostular] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [freeUsed, setFreeUsed] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showAsyncModal, setShowAsyncModal] = useState(false);

  useEffect(() => {
    if (!user) {
      const used = localStorage.getItem("cv_analysis_used");
      setFreeUsed(used === "true");
    }
  }, [user]);

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
        setUploadError(null);
      } else {
        setUploadError("Por favor, sube un archivo PDF");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setUploadError(null);
      } else {
        setUploadError("Por favor, sube un archivo PDF");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setUploadError("Por favor, sube un archivo PDF");
      return;
    }
    if (!puestoPostular) {
      setUploadError("Por favor, ingresa el puesto al que postulas");
      return;
    }

    // Verificar autenticación para usuarios registrados
    if (!user && freeUsed) {
      setUploadError("Has usado tu análisis gratuito. Inicia sesión para analizar más CVs.");
      return;
    }

    // Para usuarios autenticados, verificar créditos
    if (user && !hasEnoughCredits('cv-review')) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setPdfUrl(null);

    try {
      // 1. Subir el archivo CV
      const cvUrl = await uploadCV(file);
      setPdfUrl(cvUrl);

      // 2. Mostrar modal de análisis asíncrono
      setShowAsyncModal(true);

      // Marcar como usado para usuarios no logueados (después de subir exitosamente)
      if (!user) {
        setFreeUsed(true);
        localStorage.setItem("cv_analysis_used", "true");
      }

    } catch (error) {
      console.error('❌ Error al subir CV:', error);
      const errorMsg = error instanceof Error ? error.message : "Error al subir el CV";
      setUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleAsyncModalClose = () => {
    setShowAsyncModal(false);
    setPdfUrl(null);
    setFile(null);
    setPuestoPostular("");
  };

  const handlePurchaseSuccess = async (purchaseData: any) => {
    // Actualizar balance de créditos después de la compra
    if (user) {
      await refreshCredits();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins">
      <Navbar />
      <div className="h-[52px]"></div>
      
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
                  
                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {uploading && (
                    <Alert>
                      <AlertTitle>Subiendo CV...</AlertTitle>
                      <AlertDescription>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-[#028bbf]" />
                          <span>Preparando tu CV para el análisis...</span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    onClick={handleAnalyze}
                    disabled={uploading || !file || !puestoPostular || (!user && freeUsed)}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Analizar CV
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Modal de análisis asíncrono */}
      {pdfUrl && (
        <AsyncCVAnalysisModal
          isOpen={showAsyncModal}
          onClose={handleAsyncModalClose}
          pdfUrl={pdfUrl}
          position={puestoPostular}
        />
      )}

      {/* Modal de créditos insuficientes */}
      {user && (
        <InsufficientCreditsModal
          isOpen={showInsufficientCreditsModal}
          onClose={() => setShowInsufficientCreditsModal(false)}
          user={user}
          toolType="cv-review"
          requiredCredits={1}
          currentCredits={credits}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
