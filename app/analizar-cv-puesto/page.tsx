"use client";

import { useSearchParams } from "next/navigation"; // Para acceder a los parámetros de la URL
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreens"; // Si necesitas un loader mientras obtienes los datos
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Definir la interfaz que describe la forma del objeto userInfo
interface UserInfo {
  cvFileUrl: string;
  title: string;
  original_name: string;
  descripcion_puesto: string;
  puesto_postular: string;
  pdf_url: string;
}

export default function AnalizarCVPuesto() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Especifica el tipo de userInfo
  const [loading, setLoading] = useState(true); // Inicializamos el estado de loading como verdadero
  const [apiResult, setApiResult] = useState<any>(null); // Para almacenar el resultado de la API

  const searchParams = useSearchParams();

  useEffect(() => {
    // Obtén el parámetro userInfo de la URL
    const userInfoParam = searchParams.get("userInfo");
    if (userInfoParam) {
      try {
        const decodedParam = decodeURIComponent(userInfoParam);
        const parsedUserInfo = JSON.parse(decodedParam);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error("Error al decodificar el parámetro:", error);
      }
    } else {
      console.log("No se encontraron datos en la URL");
    }
  }, [searchParams]);

  // Función para enviar los datos a la API
  const analizarCV = async () => {
    if (userInfo) {
      const payload = {
        pdf_url: userInfo.pdf_url,
        puesto_postular: userInfo.puesto_postular,
        original_name: userInfo.original_name,
        descripcion_puesto: userInfo.descripcion_puesto,
      };

      try {
        const response = await fetch(
          "https://api-cv-puesto.onrender.com/analizar-cv/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();
        console.log("Resultado de la API:", result); // Loguea el resultado de la API
        setApiResult(result); // Guarda el resultado en el estado
      } catch (error) {
        console.error("Error al hacer la solicitud a la API:", error);
      } finally {
        setLoading(false); // Oculta el loader cuando se haya terminado de cargar
      }
    } else {
      console.log("No se pudo obtener la información del usuario");
      setLoading(false); // Asegúrate de ocultar el loader si no se encuentra el usuario
    }
  };

  useEffect(() => {
    // Llamamos a analizarCV cuando userInfo esté disponible
    if (userInfo) {
      analizarCV();
    }
  }, [userInfo]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          {" "}
          {/* Contenedor centrado */}
          <div className="text-center">
            {" "}
            {/* Contenedor interno con texto centrado */}
            <LoadingScreen
              variant="analysis"
              message="Analizando tu CV con IA avanzada..."
              subtitle={`Estamos evaluando tu perfil para maximizar tus posibilidades de éxito en: ${userInfo?.puesto_postular}`}
              fullScreen={false}
              className="bg-transparent"
            />
            <div className="mt-6">
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                💡 <span className="font-medium">¿Sabías que?</span> Un CV
                optimizado puede aumentar hasta un{" "}
                <span className="font-bold text-blue-600">40%</span> tus
                posibilidades de ser seleccionado para una entrevista.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userInfo) {
    return <div>No se pudo cargar la información del usuario.</div>;
  }

  return (
    <DashboardLayout>
      {/* Aquí va el diseño de la UI */}
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-bold">Análisis de CV</h3>

        {/* Mostrar el resultado de la API */}
        {apiResult && (
          <div className="space-y-6">
            {/* Header del análisis mejorado */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold">
                    {apiResult.nombre.nombre || "Análisis de CV"}
                  </h4>
                  <p className="text-emerald-100 text-sm">
                    Puesto: {apiResult.puesto_postular || "No especificado"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {Math.round(apiResult.mainly_analysis.porcentaje / 10 || 0)}
                    %
                  </div>
                  <div className="text-sm text-emerald-100">
                    Puntaje General
                  </div>
                </div>
              </div>

              {/* Barra de progreso visual */}
              <div className="w-full bg-emerald-400 rounded-full h-3 mb-4">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.round(apiResult.mainly_analysis.porcentaje / 10 || 0)}%`,
                  }}
                ></div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-center mb-2">
                  <span className="text-lg font-semibold">
                    Estado: {apiResult.mainly_analysis.estado || "No evaluado"}
                  </span>
                </div>
                <p className="text-sm text-emerald-50 leading-relaxed">
                  {apiResult.mainly_analysis.analisis ||
                    "Se recomienda mejorar ciertos aspectos de tu CV."}
                </p>
              </div>
            </div>

            {/* Indispensables - Detalles del análisis */}
            <div className="bg-white p-6 border rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-semibold">
                  Elementos Indispensables
                </div>
              </div>
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Elemento</th>
                    <th className="px-4 py-2 text-center">¿Existe?</th>
                    <th className="px-4 py-2 text-center">
                      ¿Bien Posicionado?
                    </th>
                    <th className="px-4 py-2 text-center">
                      ¿Fácil de distinguir?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiResult.indispensable &&
                    apiResult.indispensable.indispensable.evaluacion.map(
                      (element: any) => (
                        <tr className="border-t" key={element.elemento}>
                          <td className="px-4 py-2">{element.elemento}</td>
                          <td className="px-4 py-2 text-center">
                            {element.existe ? "✔️" : "❌"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {element.bien_posicionado ? "✔️" : "❌"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {element.facil_de_distinguir ? "✔️" : "❌"}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>

            {/* Ajuste de Puesto */}
            <div className="bg-white p-6 border rounded-xl shadow-md mt-8">
              <div className="text-lg font-semibold mb-4">
                Ajuste para el Puesto
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tarjeta de "Herramientas de análisis" */}
                <div className="bg-gradient-to-b from-emerald-400 to-emerald-600 p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out transform">
                  <div className="text-xl font-semibold text-white">
                    Herramientas de análisis
                  </div>
                  <div className="mt-2 text-gray-100">
                    <strong>Estado:</strong>{" "}
                    <span className="text-green-100">
                      {apiResult.ajuste_puesto.habilidades_de_analisis.nivel}
                    </span>
                  </div>
                  <div className="mt-2 text-gray-100">
                    <strong>Acción recomendada:</strong>{" "}
                    {apiResult.ajuste_puesto.habilidades_de_analisis.accion}
                  </div>
                </div>

                {/* Tarjeta de "Resultados cuantificables" */}
                <div className="bg-gradient-to-b from-teal-400 to-teal-600 p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out transform">
                  <div className="text-xl font-semibold text-white">
                    Resultados cuantificables
                  </div>
                  <div className="mt-2 text-gray-100">
                    <strong>Estado:</strong>{" "}
                    <span className="text-green-100">
                      {apiResult.ajuste_puesto.resultados_cuantificables.nivel}
                    </span>
                  </div>
                  <div className="mt-2 text-gray-100">
                    <strong>Acción recomendada:</strong>{" "}
                    {apiResult.ajuste_puesto.resultados_cuantificables.accion}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Tarjeta de "Habilidades blandas" */}
                <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out transform">
                  <div className="text-xl font-semibold text-white">
                    Habilidades blandas
                  </div>
                  <div className="mt-2 text-gray-100">
                    <strong>Estado:</strong>{" "}
                    <span className="text-yellow-100">
                      {apiResult.ajuste_puesto.habilidades_blandas.nivel}
                    </span>
                  </div>
                  <div className="mt-2 text-gray-100">
                    <strong>Acción recomendada:</strong>{" "}
                    {apiResult.ajuste_puesto.habilidades_blandas.accion}
                  </div>
                </div>

                {/* Tarjeta de "Lenguaje técnico" */}
                <div className="bg-gradient-to-b from-indigo-400 to-indigo-600 p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out transform">
                  <div className="text-xl font-semibold text-white">
                    Lenguaje técnico
                  </div>
                  <div className="mt-2 text-gray-100">
                    <strong>Estado:</strong>{" "}
                    <span className="text-indigo-100">
                      {apiResult.ajuste_puesto.lenguaje_tecnico.nivel}
                    </span>
                  </div>
                  <div className="mt-2 text-gray-100">
                    <strong>Acción recomendada:</strong>{" "}
                    {apiResult.ajuste_puesto.lenguaje_tecnico.accion}
                  </div>
                </div>
              </div>
            </div>

            {/* ATS & Optimización */}
            {apiResult.extractedData?.analysisResults?.atsCompliance && (
              <div className="bg-white p-6 border rounded-xl shadow-md mt-8">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      Compatibilidad ATS
                    </h4>
                    <p className="text-sm text-gray-600">
                      Análisis de compatibilidad con sistemas de seguimiento
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        apiResult.extractedData.analysisResults.atsCompliance
                          .score
                      }
                      %
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-2">
                      🚨 Problemas detectados
                    </h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      {apiResult.extractedData.analysisResults.atsCompliance.issues?.map(
                        (issue: string, index: number) => (
                          <li key={index}>• {issue}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">
                      ✅ Recomendaciones
                    </h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      {apiResult.extractedData.analysisResults.atsCompliance.recommendations?.map(
                        (rec: string, index: number) => (
                          <li key={index}>• {rec}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Errores Ortográficos y Mejoras */}
            {apiResult.spelling && (
              <div className="bg-white p-6 border rounded-xl shadow-md mt-8">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      Correcciones y Mejoras
                    </h4>
                    <p className="text-sm text-gray-600">
                      {apiResult.spelling.comentario}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Errores ortográficos */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-orange-800 mb-3">
                      🔍 Errores ortográficos ({apiResult.spelling.errores})
                    </h5>
                    <div className="space-y-2">
                      {apiResult.spelling.detalle_errores?.map(
                        (error: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white p-2 rounded border"
                          >
                            <span className="text-red-600 line-through">
                              {error.original}
                            </span>
                            {" → "}
                            <span className="text-green-600 font-semibold">
                              {error.sugerencia}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Verbos de impacto */}
                  {apiResult.verbos_impact && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-800 mb-3">
                        💪 Verbos de Impacto (Nivel{" "}
                        {apiResult.verbos_impact.nivel}/10)
                      </h5>
                      <p className="text-sm text-purple-700 mb-3">
                        {apiResult.verbos_impact.comentario}
                      </p>
                      <div className="space-y-2">
                        {apiResult.verbos_impact.sugerencias?.map(
                          (sugerencia: string, index: number) => (
                            <div
                              key={index}
                              className="bg-white p-2 rounded border text-sm"
                            >
                              • {sugerencia}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Palabras Clave y Repetidas */}
            {(apiResult.extractedData?.analysisResults?.keywordAnalysis ||
              apiResult.repeat_words) && (
              <div className="bg-white p-6 border rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <span className="text-2xl">🔑</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      Análisis de Palabras Clave
                    </h4>
                    <p className="text-sm text-gray-600">
                      Optimización para el puesto específico
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Palabras clave encontradas */}
                  {apiResult.extractedData?.analysisResults
                    ?.keywordAnalysis && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-3">
                        ✅ Palabras clave presentes
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {apiResult.extractedData.analysisResults.keywordAnalysis.jobKeywordsFound?.map(
                          (keyword: string, index: number) => (
                            <span
                              key={index}
                              className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Palabras clave faltantes */}
                  {apiResult.extractedData?.analysisResults
                    ?.keywordAnalysis && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-red-800 mb-3">
                        ❌ Palabras clave faltantes
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {apiResult.extractedData.analysisResults.keywordAnalysis.jobKeywordsMissing?.map(
                          (keyword: string, index: number) => (
                            <span
                              key={index}
                              className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Palabras repetidas */}
                  {apiResult.repeat_words && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-yellow-800 mb-3">
                        ⚠️ Palabras repetidas
                      </h5>
                      <div className="space-y-1">
                        {apiResult.repeat_words.palabras_repetidas
                          ?.slice(0, 5)
                          .map((palabra: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-yellow-700">
                                {palabra.palabra}
                              </span>
                              <span className="font-semibold text-yellow-800">
                                {palabra.veces}x
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Perfil Profesional Optimizado */}
            {apiResult.perfil_profesional && (
              <div className="bg-white p-6 border rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-cyan-100 p-2 rounded-lg mr-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      Perfil Profesional Optimizado
                    </h4>
                    <p className="text-sm text-gray-600">
                      Comparación y sugerencias de mejora
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      📄 Perfil Actual
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {apiResult.perfil_profesional.actual}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">
                      ⭐ Perfil Recomendado
                    </h5>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {apiResult.perfil_profesional.recomendado}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen Ejecutivo */}
            {(apiResult.relevance ||
              apiResult.extractedData?.analysisResults?.feedbackSummary) && (
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 border rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-slate-100 p-2 rounded-lg mr-3">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Resumen Ejecutivo</h4>
                    <p className="text-sm text-gray-600">
                      Análisis integral de tu candidatura
                    </p>
                  </div>
                </div>

                {apiResult.relevance && (
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      🎯 Relevancia para el puesto
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {apiResult.relevance}
                    </p>
                  </div>
                )}

                {apiResult.extractedData?.analysisResults?.feedbackSummary && (
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      📝 Resumen de Evaluación
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {apiResult.extractedData.analysisResults.feedbackSummary}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Información adicional del archivo */}
            {(apiResult.pagination || apiResult.filename) && (
              <div className="bg-white p-6 border rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-100 p-2 rounded-lg mr-3">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      Información del Documento
                    </h4>
                    <p className="text-sm text-gray-600">
                      Análisis técnico del CV
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {apiResult.pagination && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-2">
                        📏 Extensión ({apiResult.pagination.paginas} página
                        {apiResult.pagination.paginas > 1 ? "s" : ""})
                      </h5>
                      <p className="text-sm text-green-700">
                        {apiResult.pagination.comentario}
                      </p>
                    </div>
                  )}

                  {apiResult.filename && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">
                        📁 Nombre del archivo
                      </h5>
                      <p className="text-sm text-blue-700">
                        {apiResult.filename.comentario}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
