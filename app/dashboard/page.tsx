'use client';

import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "../../components/Avatar";
import ClientOnly from "../../components/ClientOnly";
import CreditDashboard from "../../components/CreditDashboard";
import { cvReviewService } from "../../services/cvReviewService";
import { trackDashboardView } from "../../utils/analytics";
import { 
  User, 
  FileText, 
  Target, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Bell,
  Settings,
  LogOut,
  BookOpen,
  Award,
  CheckCircle,
  Clock
} from "lucide-react";
import { useCredits } from "../../hooks/useCredits";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  
  const { credits, loading: creditsLoading } = useCredits(user);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'credits'>('overview');
  const [cvStats, setCvStats] = useState({
    totalReviews: 0,
    remainingReviews: 0,
    freeReviewUsed: false,
    lastReviewDate: undefined as Date | undefined
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {    const loadCVStats = async () => {
      if (user) {
        try {
          const stats = await cvReviewService.getUserStats(user);
          setCvStats({
            totalReviews: stats.totalReviews,
            remainingReviews: stats.remainingReviews,
            freeReviewUsed: stats.freeReviewUsed,
            lastReviewDate: stats.lastReviewDate || undefined
          });
        } catch (error) {
          console.error('Error loading CV stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    loadCVStats();
  }, [user]);
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  // Función para recargar estadísticas
  const handleRefreshStats = async () => {
    if (user) {
      setStatsLoading(true);
      try {
        const stats = await cvReviewService.getUserStats(user);
        setCvStats({
          totalReviews: stats.totalReviews,
          remainingReviews: stats.remainingReviews,
          freeReviewUsed: stats.freeReviewUsed,
          lastReviewDate: stats.lastReviewDate || undefined
        });
      } catch (error) {
        console.error('Error loading CV stats:', error);
      } finally {
        setStatsLoading(false);
      }
    }
  };
  // Mostrar loading mientras se determina el estado de auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (la redirección se maneja en useEffect)
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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                <Bell size={20} />
              </button>
              <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition">
                <Avatar user={user} size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  {user.displayName || user.email?.split('@')[0] || 'Usuario'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* Saludo personalizado */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {user.displayName || user.email?.split('@')[0] || 'Estudiante'}! 👋
          </h2>
          <p className="text-gray-600">
            Bienvenido a tu panel de control. Aquí puedes gestionar tu perfil y acceder a todas las herramientas de empleabilidad.
          </p>
            {/* Panel de información útil */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Análisis de CV</h3>
                <p className="text-sm text-blue-700">
                  {cvStats.remainingReviews > 0 
                    ? `Tienes ${cvStats.remainingReviews} análisis disponibles`
                    : 'Necesitas comprar análisis adicionales para revisar más CVs'
                  }
                </p>
              </div>
              <Link 
                href="/analizar-cv"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Analizar CV
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-[#028bbf] text-[#028bbf]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resumen General
              </button>              <button
                onClick={() => setActiveTab('credits')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'credits'
                    ? 'border-[#028bbf] text-[#028bbf]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mis Créditos
              </button>
              <Link
                href="/credits"
                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                Ver Todo →
              </Link>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div>
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CVs Analizados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : cvStats.totalReviews}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revisiones Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : cvStats.remainingReviews}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <Link href="/credits" className="block">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#028bbf] transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">Créditos Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-[#028bbf] transition-colors">
                    {creditsLoading ? '-' : credits}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {credits === 0 ? 'Haz clic para recargar' : 
                     credits === 1 ? '1 crédito restante' : 
                     `${credits} créditos restantes`}
                  </p>
                </div>
                <div className={`p-3 rounded-lg transition-colors group-hover:scale-105 transform duration-200 ${
                  credits === 0 ? 'bg-red-100 group-hover:bg-red-200' : 
                  credits <= 2 ? 'bg-orange-100 group-hover:bg-orange-200' : 
                  'bg-green-100 group-hover:bg-green-200'
                }`}>
                  <Award className={`h-6 w-6 transition-colors ${
                    credits === 0 ? 'text-red-600' : 
                    credits <= 2 ? 'text-orange-600' : 
                    'text-green-600'
                  }`} />
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Revisión</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : (cvStats.lastReviewDate ? 
                    cvStats.lastReviewDate.toLocaleDateString() : 'Nunca')}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link 
                    href="/crear-cv"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                  >
                    <div className="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg transition">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Crear CV</h4>
                      <p className="text-sm text-gray-600">Genera tu CV profesional</p>
                    </div>
                  </Link>

                  <Link 
                    href="/analizar-cv"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                  >
                    <div className="bg-green-100 group-hover:bg-green-200 p-2 rounded-lg transition">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Analizar CV</h4>
                      <p className="text-sm text-gray-600">Mejora tu currículum</p>
                    </div>
                  </Link>

                  <Link 
                    href="/bolsa-trabajo"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                  >
                    <div className="bg-purple-100 group-hover:bg-purple-200 p-2 rounded-lg transition">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Buscar Empleo</h4>
                      <p className="text-sm text-gray-600">Encuentra oportunidades</p>
                    </div>
                  </Link>                  <Link 
                    href="/agentes-ai"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                  >
                    <div className="bg-yellow-100 group-hover:bg-yellow-200 p-2 rounded-lg transition">
                      <BookOpen className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Simulacion de Entrevistas</h4>
                      <p className="text-sm text-gray-600">Practica con Worky</p>
                    </div>
                  </Link>

                  <Link 
                    href="/historial-cv"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                  >
                    <div className="bg-indigo-100 group-hover:bg-indigo-200 p-2 rounded-lg transition">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Historial CV</h4>
                      <p className="text-sm text-gray-600">Ver análisis anteriores</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>            {/* Actividad reciente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              </div>
              <div className="p-6">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#028bbf]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cvStats.totalReviews > 0 && (
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">CV analizado</p>
                          <p className="text-sm text-gray-600">
                            {cvStats.lastReviewDate ? 
                              cvStats.lastReviewDate.toLocaleDateString() : 
                              'Fecha no disponible'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {cvStats.remainingReviews > 0 && (
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Revisiones disponibles</p>
                          <p className="text-sm text-gray-600">{cvStats.remainingReviews} análisis restantes</p>
                        </div>
                      </div>
                    )}

                    {!cvStats.freeReviewUsed && (
                      <div className="flex items-start space-x-3">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <Award className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Revisión gratuita disponible</p>
                          <p className="text-sm text-gray-600">Prueba gratis tu primer análisis</p>
                        </div>
                      </div>
                    )}

                    {cvStats.totalReviews === 0 && cvStats.freeReviewUsed && (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No hay actividad reciente</p>
                        <Link 
                          href="/analizar-cv"
                          className="inline-block mt-2 text-sm text-[#028bbf] hover:text-[#027ba8] font-medium transition"
                        >
                          Analizar tu primer CV
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Perfil del usuario */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 text-center">
                <Avatar user={user} size="lg" className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {user.displayName || 'Usuario'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                <Link 
                  href="/profile"
                  className="inline-flex items-center space-x-2 bg-[#028bbf] hover:bg-[#027ba8] text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  <User size={16} />
                  <span>Ver Perfil</span>
                </Link>
              </div>
            </div>

            {/* Progreso */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Tu Progreso</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Perfil completado</span>
                    <span className="text-sm text-gray-600">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#028bbf] h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Empleabilidad</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Logros Recientes</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">CV Profesional</p>
                    <p className="text-xs text-gray-600">Completaste tu primer CV</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Award className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Primera Postulación</p>                    <p className="text-xs text-gray-600">Enviaste tu primera aplicación</p>
                  </div>
                </div>              </div>
            </div>
          </div>        </div>
          </div>
        ) : (
          <div>
            {/* Credit Dashboard Tab Content */}
            <CreditDashboard />
          </div>
        )}
      </div>
    </div>
    </ClientOnly>
  );
}
