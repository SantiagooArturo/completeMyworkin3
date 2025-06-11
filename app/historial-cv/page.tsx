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
  Star,
  Download,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";

export default function HistorialCVPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<CVReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Track página view cuando el usuario esté autenticado
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

  const filteredReviews = reviews.filter(review => {
    if (filter === 'completed') return review.status === 'completed';
    if (filter === 'pending') return review.status === 'pending';
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Procesando';
      case 'failed':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition mr-6"
              >
                <ArrowLeft size={20} />
                <span>Volver al Dashboard</span>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Historial de CV</h1>
                  <p className="text-sm text-gray-600">Revisa todas tus análisis de CV anteriores</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtros */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      filter === 'all' 
                        ? 'bg-[#028bbf] text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Todos ({reviews.length})
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      filter === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Completados ({reviews.filter(r => r.status === 'completed').length})
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      filter === 'pending' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Procesando ({reviews.filter(r => r.status === 'pending').length})
                  </button>
                </div>
              </div>
              <Link
                href="/analizar-cv"
                className="bg-[#028bbf] hover:bg-[#027ba8] text-white px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
              >
                <TrendingUp size={16} />
                <span>Nuevo Análisis</span>
              </Link>
            </div>
          </div>

          {/* Lista de revisiones */}
          {error ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-red-200 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar historial</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-[#028bbf] hover:bg-[#027ba8] text-white rounded-lg font-medium transition"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : reviewsLoading ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historial de CV...</p>
              <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-8 sm:px-8 sm:py-12 text-center">
                <div className="max-w-sm mx-auto">
                  <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">
                    {filter === 'all' ? 'Sin análisis de CV' : `Sin análisis ${filter === 'completed' ? 'completados' : 'en proceso'}`}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
                    {filter === 'all' 
                      ? 'Analiza tu primer CV para obtener retroalimentación profesional y mejorar tus oportunidades laborales.'
                      : 'Cambia el filtro para ver otros análisis o realiza uno nuevo.'
                    }
                  </p>

                  {/* Debug info - Solo en desarrollo */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="bg-gray-100 p-3 rounded text-xs text-left mb-4">
                      <p><strong>Debug Info:</strong></p>
                      <p>User ID: {user?.uid}</p>
                      <p>User Email: {user?.email}</p>
                      <p>Total reviews: {reviews.length}</p>
                      <p>Filtered reviews: {filteredReviews.length}</p>
                      <p>Filter: {filter}</p>
                      <p>Loading: {reviewsLoading.toString()}</p>
                    </div>
                  )}
                  
                  <Link
                    href="/analizar-cv"
                    className="inline-flex items-center justify-center space-x-2 bg-[#028bbf] hover:bg-[#027ba8] text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:ring-offset-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Analizar CV</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(review.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Análisis de CV
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        review.status === 'completed' ? 'bg-green-100 text-green-800' :
                        review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(review.status)}
                      </span>
                      {review.status === 'completed' && review.result?.score && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(review.result.score)}`}>
                          {review.result.score}/100
                        </span>
                      )}
                    </div>
                  </div>

                  {review.status === 'completed' && review.result && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{review.result.score}/100</div>
                          <div className="text-sm text-gray-600">Puntuación General</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{review.result.suggestions?.length || 0}</div>
                          <div className="text-sm text-gray-600">Sugerencias</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{review.result.strengths?.length || 0}</div>
                          <div className="text-sm text-gray-600">Fortalezas</div>
                        </div>
                      </div>

                      {review.result.summary && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen del Análisis</h4>
                          <p className="text-sm text-gray-700">{review.result.summary}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                          <Eye size={16} />
                          <span>Ver Detalles</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-[#028bbf] hover:bg-[#027ba8] text-white rounded-lg transition">
                          <Download size={16} />
                          <span>Descargar Reporte</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {review.status === 'pending' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-3 text-yellow-600">
                        <Clock size={16} />
                        <span className="text-sm">Tu CV está siendo analizado. Los resultados estarán listos en unos momentos.</span>
                      </div>
                    </div>
                  )}

                  {review.status === 'failed' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-red-600">
                          <AlertCircle size={16} />
                          <span className="text-sm">Hubo un error al analizar este CV. Intenta nuevamente.</span>
                        </div>
                        <Link
                          href="/analizar-cv"
                          className="text-sm text-[#028bbf] hover:text-[#027ba8] font-medium transition"
                        >
                          Reintentar
                        </Link>
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
