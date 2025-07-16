'use client';

import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ClientOnly from "../../components/ClientOnly";
import { cvReviewService } from "../../services/cvReviewService";
import { CVReview } from "../../services/cvReviewService";
import { trackCVHistoryView } from "../../utils/analytics";
import { 
  FileText, 
  ArrowLeft,
  Calendar,
  Download,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Eye
} from "lucide-react";

export default function HistorialCVPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<CVReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      trackCVHistoryView();
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadReviews = async () => {
      if (user) {
        try {
          setReviewsLoading(true);
          setError(null);
          const userReviews = await cvReviewService.getUserReviews(user.uid);
          setReviews(userReviews);
        } catch (error) {
          console.error('Error loading CV reviews:', error);
          setError('Error al cargar el historial. Por favor, intenta de nuevo.');
          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      } else {
        setReviewsLoading(false);
        setReviews([]);
      }
    };

    if (!loading) {
      loadReviews();
    }
  }, [user, loading]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función corregida con mejor tipado
  const getAnalyzedPdfUrl = (review: CVReview): string | null => {
    try {
      // Verificar múltiples rutas posibles para la URL del PDF analizado
      if (review.status === 'completed' && review.result) {
        // Ruta principal
        if (review.result.extractedData?.analysisResults?.pdf_url) {
          return review.result.extractedData.analysisResults.pdf_url;
        }
        
        // Rutas alternativas (por si la estructura cambia)
        if (review.result.pdf_url) {
          return review.result.pdf_url;
        }
        
        if (typeof review.result === 'string') {
          return review.result;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      return null;
    }
  };

  if (loading || reviewsLoading) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#028bbf] border-t-transparent mx-auto mb-4"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-[#028bbf]" />
              </div>
              <p className="text-gray-600 font-medium">Cargando tu historial de CV...</p>
              <p className="text-sm text-gray-500 mt-2">Esto solo tomará un momento</p>
            </div>
          </div>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header mejorado */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link 
                  href="/analizar-cv"
                  className="inline-flex items-center text-gray-600 hover:text-[#028bbf] transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Volver</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-[#028bbf] to-blue-600 p-3 rounded-xl shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Historial de CV</h1>
                    <p className="text-gray-600 mt-1">Revisa todos tus análisis anteriores</p>
                  </div>
                </div>
              </div>

              {/* Botón de nuevo análisis en header */}
              <Link
                href="/analizar-cv"
                className="hidden sm:inline-flex items-center space-x-2 bg-gradient-to-r from-[#028bbf] to-blue-600 hover:from-[#027ba8] hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Sparkles className="h-5 w-5" />
                <span>Nuevo Análisis</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Botón móvil para nuevo análisis */}
          <div className="mb-8 sm:hidden">
            <Link
              href="/analizar-cv"
              className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#028bbf] to-blue-600 hover:from-[#027ba8] hover:to-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              <span>Crear Nuevo Análisis</span>
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Análisis</p>
                    <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Download className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reviews.filter(r => r.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Último Análisis</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {reviews.length > 0 ? 
                        new Intl.DateTimeFormat('es-ES', { 
                          month: 'short', 
                          day: 'numeric' 
                        }).format(reviews[0].createdAt?.toDate?.() || new Date(reviews[0].createdAt)) 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de revisiones */}
          {error ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-red-100 text-center">
              <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Error al cargar historial</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-[#028bbf] hover:bg-[#027ba8] text-white rounded-xl font-medium transition-colors shadow-lg"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">¡Comienza tu primer análisis!</h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Sube tu CV y recibe retroalimentación profesional para mejorar tus oportunidades laborales.
              </p>
              <Link
                href="/analizar-cv"
                className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-[#028bbf] to-blue-600 hover:from-[#027ba8] hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Sparkles className="h-5 w-5" />
                <span>Analizar mi CV</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
                >
                  {/* Header del análisis */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-[#028bbf] text-white rounded-full text-sm font-semibold">
                        {reviews.length - index}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Análisis #{reviews.length - index}</h3>
                        <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>

                    {/* Badge de estado */}
                    <div className="flex items-center space-x-2">
                      {review.status === 'completed' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Completado
                        </span>
                      )}
                      {review.status === 'pending' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></div>
                          Procesando
                        </span>
                      )}
                      {review.status === 'failed' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                          Error
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenido principal */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CV Original */}
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">CV Original</h4>
                          <p className="text-sm text-gray-600">Archivo subido</p>
                        </div>
                      </div>
                      
                      {review.fileUrl ? (
                        <a
                          href={review.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center space-x-2 text-[#028bbf] hover:text-[#027ba8] transition-colors"
                        >
                          <span className="truncate max-w-[200px] font-medium">
                            {review.fileName || 'Ver archivo original'}
                          </span>
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      ) : (
                        <p className="text-gray-500 italic">Archivo no disponible</p>
                      )}
                    </div>

                    {/* PDF Analizado */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Download className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Resultado del Análisis</h4>
                          <p className="text-sm text-gray-600">PDF con feedback</p>
                        </div>
                      </div>

                      {review.status === 'completed' && getAnalyzedPdfUrl(review) ? (
                        <a
                          href={getAnalyzedPdfUrl(review)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center space-x-2 text-green-700 hover:text-green-800 transition-colors font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver análisis completo</span>
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      ) : review.status === 'pending' ? (
                        <div className="flex items-center space-x-2 text-yellow-700">
                          <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-medium">Procesando análisis...</span>
                        </div>
                      ) : review.status === 'failed' ? (
                        <p className="text-red-600 font-medium">Error en el análisis</p>
                      ) : (
                        <p className="text-gray-500 italic">Análisis no disponible</p>
                      )}
                    </div>
                  </div>

                  {/* Información adicional */}
                  {review.position && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Puesto analizado:</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {review.position}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}