"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import {
  Bot,
  Upload,
  Target,
  Briefcase,
  Users,
  Search,
} from "lucide-react";
import { matchesCV, uploadCV } from "@/src/utils/cvAnalyzer";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import InsufficientCreditsModal from "@/components/InsufficientCreditsModal";

interface Practica {
  title: string;
  description: string;
  posted_date: string;
  company: string;
  location: string;
  link: string;
  porcentaje: number;
}

export default function MatchCV() {
  const { user } = useAuth();
  const { 
    credits, 
    hasEnoughCredits, 
    refreshCredits, 
    reserveCredits, 
    confirmReservation, 
    revertReservation 
  } = useCredits(user);
  const [file, setFile] = useState<File | null>(null);
  const [telefono, setTelefono] = useState("");
  const [puesto, setPuesto] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  // Maneja la carga del archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // Simula la carga del CV y muestra los inputs
  const handleUpload = () => {
    if (!file) {
      setError("Por favor, selecciona un archivo PDF");
      return;
    }
    setUploaded(true);
    setShowInputs(true);
    setError(null);
  };
  // Maneja la búsqueda real de prácticas
  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Por favor, selecciona un archivo PDF");
      return;
    }
    if (!telefono || !puesto) {
      setError("Completa todos los campos");
      return;
    }

    // Verificar autenticación
    if (!user) {
      setError("Debes iniciar sesión para usar esta herramienta");
      return;
    }

    // Verificar créditos
    if (!hasEnoughCredits('job-match')) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setShowInputs(false);
    setShowResults(false);
    
    let reservationId: string | null = null;
    
    try {
      // 1. RESERVAR créditos antes de procesar (no consumir aún)
      console.log("🔒 Reservando créditos para job matching...");
      const reserveResult = await reserveCredits('job-match', 'Búsqueda de empleos');
      
      if (!reserveResult.success) {
        setError('Error al reservar créditos');
        setShowInputs(true);
        return;
      }
      
      reservationId = reserveResult.reservationId;
      console.log(`✅ Créditos reservados con ID: ${reservationId}`);

      // 2. Intentar servicios externos
      console.log("📤 Subiendo CV...");
      const pdfUrl = await uploadCV(file);
      console.log("✅ CV subido exitosamente");
      
      console.log("🔍 Buscando prácticas...");
      const trabajos = await matchesCV(pdfUrl, puesto, telefono);
      console.log(`✅ Encontradas ${trabajos.length} prácticas`);
      
      // 3. CONFIRMAR consumo de créditos solo después del éxito
      console.log("💳 Confirmando consumo de créditos...");
      const confirmResult = await confirmReservation(reservationId, 'job-match', 'Búsqueda de empleos completada');
      
      if (!confirmResult) {
        console.warn("⚠️ No se pudo confirmar el consumo de créditos, pero el servicio fue exitoso");
      } else {
        console.log("✅ Créditos confirmados y consumidos");
      }
      
      // Actualizar balance de créditos en la UI
      await refreshCredits();
      
      // Mostrar resultados
      setPracticas(trabajos);
      setShowResults(true);
      
    } catch (err: any) {
      console.error("❌ Error en job matching:", err);
      
      // REVERTIR reserva de créditos en caso de error
      if (reservationId) {
        try {
          console.log("🔄 Revirtiendo reserva de créditos...");
          const revertResult = await revertReservation(reservationId, 'job-match', `Error: ${err.message}`);
          
          if (revertResult) {
            console.log("✅ Reserva de créditos revertida exitosamente");
          } else {
            console.warn("⚠️ No se pudo revertir la reserva de créditos");
          }
        } catch (revertError) {
          console.error("❌ Error al revertir reserva:", revertError);
        }
      }
      
      setError(err.message || "Error inesperado");
      setShowInputs(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarOtro = () => {
    setShowResults(false);
    setShowInputs(true);
    setPracticas([]);
    setPuesto("");
    setTelefono("");
    setFile(null);
    setUploaded(false);
  };

  function LoadingSpinner() {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#028bbf] border-t-transparent animate-spin"></div>
        </div>
        <span className="text-[#028bbf] font-semibold text-lg mt-2">Buscando prácticas para ti...</span>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins">
      <Navbar />
      <div className="h-[52px]"></div>
      
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-black">Encuentra las </span>
              <span className="text-[#028bbf]">Prácticas Ideales</span>
            </h1>
            <p className="text-xl text-gray-600">
              Nuestra IA analiza tu CV y te conecta con las prácticas que mejor se ajustan a tu perfil.
            </p>
            {!user && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800">
                  <strong>Nota:</strong> Necesitas iniciar sesión y tener créditos para usar esta herramienta. 
                  Cada búsqueda consume 1 crédito.
                </p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#028bbf] rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Match Inteligente</h2>
                <p className="text-gray-600">Powered by El Chambas AI</p>
              </div>
            </div>
            <div className="space-y-8">
              {/* Sección de Upload */}
              {!uploaded && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-full mb-2 border-2 border-[#028bbf]">
                      <Upload className="w-8 h-8 text-[#028bbf]" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 mb-1">Sube tu CV para comenzar</span>
                    <span className="text-gray-600 mb-2">Encuentra las prácticas que mejor se ajustan a tus habilidades y experiencia</span>
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="inline-block px-4 py-2 bg-[#028bbf]/10 text-[#028bbf] rounded-lg font-medium text-sm mt-2">
                      Solo archivos PDF
                    </span>
                  </label>
                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 animate-fade-in">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="font-semibold text-green-700">{file.name}</span>
                    </div>
                  )}
                  <button
                    className="mt-6 px-6 py-3 bg-[#028bbf] text-white rounded-xl font-medium hover:bg-[#027ba8] transition-colors"
                    onClick={handleUpload}
                  >
                    Subir CV
                  </button>
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
              )}
              {/* Inputs de teléfono y puesto */}
              {showInputs && !showResults && !loading && (
                <form className="max-w-lg mx-auto text-gray-800 bg-blue-50 rounded-xl p-6 shadow flex flex-col gap-4 animate-fade-in" onSubmit={handleBuscar}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Completa tus datos</h3>
                  <input type="tel" className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#028bbf]" placeholder="Número de teléfono (ej: 51999999999)" value={telefono} onChange={e => setTelefono(e.target.value)} required />
                  <input type="text" className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#028bbf]" placeholder="Puesto de trabajo que buscas" value={puesto} onChange={e => setPuesto(e.target.value)} required />
                  <button type="submit" className="px-6 py-3 bg-[#028bbf] text-white rounded-xl font-medium hover:bg-[#027ba8] transition-colors mt-2 disabled:opacity-60" disabled={loading}>Buscar prácticas</button>
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
              )}
              {/* Animación de cargando solo al buscar prácticas */}
              {loading && <LoadingSpinner />}
              {/* Lista de prácticas recomendadas */}
              {showResults && practicas.length > 0 && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Prácticas recomendadas para ti</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {practicas.map((p, idx) => (
                      <div key={idx} className="border rounded-2xl p-6 shadow-lg hover:shadow-2xl transition bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-between h-full">
                        <div>
                          <h4 className="text-xl font-semibold text-[#028bbf] mb-2">{p.title}</h4>
                          <p className="text-gray-800 font-medium mb-1">{p.company} · {p.location}</p>
                          <p className="text-gray-600 mb-3 line-clamp-4 text-sm">{p.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-[#028bbf] text-white rounded-lg font-medium hover:bg-[#027ba8] transition-colors text-center">Ver Detalle</a>
                          <span className="text-xs text-gray-500 ml-2">{p.posted_date}</span>
                        </div>
                        <div className="mt-2 text-xs text-green-600 font-semibold">Match: {p.porcentaje}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-8">
                    <button onClick={handleBuscarOtro} className="px-6 py-3 bg-gray-200 text-[#028bbf] rounded-xl font-medium hover:bg-gray-300 transition-colors shadow">Buscar con otro puesto</button>
                  </div>
                </div>
              )}
              {/* Características del servicio */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Search className="w-6 h-6 text-[#028bbf]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Búsqueda Inteligente</h3>
                    <p className="text-gray-600">Analizamos tus habilidades y experiencia para encontrar las mejores coincidencias.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-[#028bbf]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Prácticas Actualizadas</h3>
                    <p className="text-gray-600">Accede a una base de datos de prácticas actualizada diariamente.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#028bbf]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Conexión Directa</h3>
                    <p className="text-gray-600">Conecta directamente con los reclutadores de las empresas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-[#028bbf]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recomendaciones IA</h3>
                    <p className="text-gray-600">Recibe sugerencias personalizadas para mejorar tus posibilidades.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-lg text-gray-600 mb-4">¿Quieres recibir alertas de prácticas en WhatsApp?</p>
                <a href="https://mc.ht/s/SH1lIgc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 bg-[#028bbf] text-white rounded-xl font-medium hover:bg-[#027ba8] transition-colors">Conecta con El Chambas</a>
              </div>
            </div>          </div>
        </div>
      </section>      {/* Insufficient Credits Modal */}
      {user && (
        <InsufficientCreditsModal
          isOpen={showInsufficientCreditsModal}
          onClose={() => setShowInsufficientCreditsModal(false)}
          user={user}
          toolType="job-match"
          requiredCredits={1}
          currentCredits={credits}
        />
      )}
    </div>
  );
}
