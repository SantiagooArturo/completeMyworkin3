'use client';

import { useAuth } from "../../hooks/useAuth";
import { useCredits } from "../../hooks/useCredits";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "../../components/Avatar";
import ClientOnly from "../../components/ClientOnly";
import CreditDashboard from "../../components/CreditDashboard";
import { cvReviewService } from "../../services/cvReviewService";
import { trackDashboardView } from "../../utils/analytics";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  Bell,
  LogOut,
  FileText,
  CheckCircle,
  Award,
  Clock,
  TrendingUp,
  Briefcase,
  BookOpen,
  Calendar,
  User,
  Target,
  Settings,
  AlertCircle
} from 'lucide-react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

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
 const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);


    useEffect(() => {
    const checkProfileCompleteness = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Verificamos si el perfil está completo comparando campos esenciales
          const isComplete = userData.displayName && userData.email && userData.phone && userData.location && userData.university && userData.bio && userData.position;
          setIsProfileComplete(isComplete);
          
          // Si el perfil no está completo, mostramos el modal
          if (!isComplete) {
            setShowProfileModal(true);
          }
        }
      }
    };

    checkProfileCompleteness();
  }, [user]);

    const handleCloseModal = () => {
    setShowProfileModal(false);
  };
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadCVStats = async () => {
      if (user) {
        console.log("Cargando estadísticas de CV para el usuario:", user);
        try {
          // Obtener las revisiones directamente para contar los análisis reales
          const reviews = await cvReviewService.getUserReviews(user.uid);
          const completedReviews = reviews.filter(review => review.status === 'completed');
          
          // También obtener las estadísticas del usuario
          const userStats = await cvReviewService.getUserStats(user);
          
          setCvStats({
            totalReviews: completedReviews.length, // Usar el conteo real de revisiones completadas
            remainingReviews: userStats.remainingReviews,
            freeReviewUsed: userStats.freeReviewUsed,
            lastReviewDate: completedReviews.length > 0 ? 
              completedReviews[0].createdAt?.toDate?.() || new Date(completedReviews[0].createdAt) :
              undefined
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
        // Obtener las revisiones directamente para contar los análisis reales
        const reviews = await cvReviewService.getUserReviews(user.uid);
        const completedReviews = reviews.filter(review => review.status === 'completed');
        
        // También obtener las estadísticas del usuario
        const userStats = await cvReviewService.getUserStats(user);
        
        setCvStats({
          totalReviews: completedReviews.length, // Usar el conteo real de revisiones completadas
          remainingReviews: userStats.remainingReviews,
          freeReviewUsed: userStats.freeReviewUsed,
          lastReviewDate: completedReviews.length > 0 ? 
            completedReviews[0].createdAt?.toDate?.() || new Date(completedReviews[0].createdAt) :
            undefined
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
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
{showProfileModal && !isProfileComplete && (
  <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
    <div className="bg-gradient-to-r from-[#f3f4f6] to-[#e5e7eb] rounded-2xl p-8 max-w-lg w-full shadow-xl transform transition-all duration-300 ease-in-out scale-105">
      {/* Icono de alerta */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-yellow-400 p-3 rounded-full shadow-lg">
          <AlertCircle className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-800">¡Tu perfil está incompleto!</h2>
      </div>

      {/* Mensaje motivacional */}
      <p className="text-gray-700 mb-6 text-lg leading-relaxed">
        Estás casi listo para aprovechar todas las funcionalidades de nuestra plataforma. Completa tu perfil con más
        información para mejorar tu visibilidad y aumentar tus oportunidades laborales.
      </p>

      {/* Barra de progreso */}
      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-2">Progreso del perfil</p>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div
              className="w-full bg-gray-200 rounded-full h-2.5"
              style={{
                backgroundColor: '#E5E7EB', // Color de fondo
              }}
            >
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${(isProfileComplete ? 100 : 50)}%`, // Si está completo es 100%, si no es 50% por defecto
                  backgroundColor: '#028bbf', // Color de la barra
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between space-x-4">
        <button
          onClick={handleCloseModal}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-full font-medium transition duration-200 ease-in-out flex items-center space-x-2 shadow-lg transform hover:scale-105 w-full"
        >
          <Clock className="h-5 w-5" />
          <span>En otro momento</span>
        </button>
        
        <button
          onClick={() => router.push('/profile')} // Asumiendo que /profile es la página para completar el perfil
          className="bg-[#028bbf] hover:bg-[#027ba8] text-white px-6 py-3 rounded-full font-medium transition duration-200 ease-in-out flex items-center space-x-2 shadow-lg transform hover:scale-105 w-full"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Completar Ahora</span>
        </button>
      </div>
    </div>
  </div>
)}


        {/* Saludo personalizado */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {user.displayName || user.email?.split('@')[0] || 'Estudiante'}! 👋
          </h2>
          <p className="text-gray-600">
            Bienvenido a tu panel de control. Aquí puedes gestionar tu perfil y acceder a todas las herramientas de empleabilidad.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                    ? 'border-[#028bbf] text-[#028bbf]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Resumen General
              </button>
              <button
                onClick={() => setActiveTab('credits')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'credits'
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
            {/* Estadísticas rápidas - Solo 2 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link href="/historial-cv" className="block">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#028bbf] transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">CVs Analizados</p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRefreshStats();
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={statsLoading}
                          title="Actualizar estadísticas"
                        >
                          <svg className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 group-hover:text-[#028bbf] transition-colors mt-2">
                        {statsLoading ? '-' : cvStats.totalReviews}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {cvStats.totalReviews === 0 ? 'Haz clic para comenzar' :
                         cvStats.totalReviews === 1 ? 'Haz clic para ver detalles' :
                         'Haz clic para ver historial'}
                      </p>
                    </div>
                    <div className="bg-blue-100 group-hover:bg-blue-200 p-4 rounded-xl transition-all duration-200 group-hover:scale-105">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/credits" className="block">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#028bbf] transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">Créditos Disponibles</p>
                      <p className="text-3xl font-bold text-gray-900 group-hover:text-[#028bbf] transition-colors mt-2">
                        {creditsLoading ? '-' : credits}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {credits === 0 ? 'Haz clic para recargar' :
                          credits === 1 ? '1 crédito restante' :
                            `${credits} créditos restantes`}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl transition-all duration-200 group-hover:scale-105 ${
                      credits === 0 ? 'bg-red-100 group-hover:bg-red-200' :
                      credits <= 2 ? 'bg-orange-100 group-hover:bg-orange-200' :
                      'bg-green-100 group-hover:bg-green-200'
                    }`}>
                      <Award className={`h-8 w-8 transition-colors ${
                        credits === 0 ? 'text-red-600' :
                        credits <= 2 ? 'text-orange-600' :
                        'text-green-600'
                      }`} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Panel principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Acciones rápidas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
                    <p className="text-sm text-gray-600 mt-1">Accede a las herramientas principales de MyWorkIn</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        href="/match-cv"
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                      >
                        <div className="bg-orange-100 group-hover:bg-orange-200 p-2 rounded-lg transition">
                          <Target className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Match CV-Trabajo</h4>
                          <p className="text-sm text-gray-600">Encuentra trabajos compatibles</p>
                        </div>
                      </Link>

                      <Link
                        href="/portal-trabajo"
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                      >
                        <div className="bg-purple-100 group-hover:bg-purple-200 p-2 rounded-lg transition">
                          <Briefcase className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Portal de Trabajo</h4>
                          <p className="text-sm text-gray-600">Oportunidades personalizadas</p>
                        </div>
                      </Link>

                      {/* <Link
                        href="/bolsa-trabajo"
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                      >
                        <div className="bg-teal-100 group-hover:bg-teal-200 p-2 rounded-lg transition">
                          <Briefcase className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Bolsa de Trabajo</h4>
                          <p className="text-sm text-gray-600">Encuentra oportunidades</p>
                        </div>
                      </Link> */}

                      <Link
                        href="/interview-simulation"
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#028bbf] hover:shadow-md transition group"
                      >
                        <div className="bg-yellow-100 group-hover:bg-yellow-200 p-2 rounded-lg transition">
                          <BookOpen className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Simulación de Entrevistas</h4>
                          <p className="text-sm text-gray-600">Practica con Worky</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Actividad reciente */}
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
                        <div className="bg-[#028bbf] h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Empleabilidad</span>
                        <span className="text-sm text-gray-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
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
                        <p className="text-sm font-medium text-gray-900">Primera Postulación</p>
                        <p className="text-xs text-gray-600">Enviaste tu primera aplicación</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Credit Dashboard Tab Content */}
            <CreditDashboard />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
