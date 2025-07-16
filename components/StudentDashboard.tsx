'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import Avatar from './Avatar';
import { 
  FileText, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  X,
  Upload,
  Download
} from 'lucide-react';

interface StudentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentDashboard({ isOpen, onClose }: StudentDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !user) return null;

  const stats = [
    { label: 'CVs analizados', value: '3', icon: FileText, color: 'bg-blue-500' },
    { label: 'Matches realizados', value: '8', icon: Target, color: 'bg-green-500' },
    { label: 'Cursos completados', value: '2', icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Perfil completado', value: '65%', icon: TrendingUp, color: 'bg-yellow-500' },
  ];

  const recentActivities = [
    { title: 'CV analizado con IA', date: '2 horas atrás', type: 'cv' },
    { title: 'Match con práctica en TechCorp', date: '1 día atrás', type: 'match' },
    { title: 'Perfil actualizado', date: '3 días atrás', type: 'profile' },
    { title: 'CV creado', date: '5 días atrás', type: 'cv' },
  ];

  const recommendations = [
    { 
      title: 'Completa tu perfil',
      description: 'Añade tu universidad y carrera para mejores recomendaciones',
      action: 'Completar ahora'
    },
    {
      title: 'Mejora tu CV',
      description: 'Usa nuestro analizador de CV con IA para obtener sugerencias',
      action: 'Analizar CV'
    },
    {
      title: 'Busca prácticas',
      description: 'Explora oportunidades que coincidan con tu perfil',
      action: 'Ver ofertas'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <Avatar user={user} size="lg" />
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                ¡Hola, {user.displayName || user.email?.split('@')[0]}!
              </h2>
              <p className="text-blue-100">Panel de estudiante</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Resumen', icon: TrendingUp },
              { id: 'cv', label: 'Mi CV', icon: FileText },
              { id: 'matches', label: 'Matches', icon: Target },
              { id: 'activities', label: 'Actividades', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#028bbf] text-[#028bbf]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-full text-white`}>
                        <stat.icon size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones para ti</h3>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        </div>
                        <button className="ml-4 bg-[#028bbf] text-white px-3 py-1 rounded-md text-sm hover:bg-[#027ba8] transition-colors">
                          {rec.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h3>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="space-y-6">
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mt-4">Sube tu CV</h3>
                <p className="text-gray-500 mt-2">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                <button className="mt-4 bg-[#028bbf] text-white px-4 py-2 rounded-md hover:bg-[#027ba8] transition-colors">
                  Seleccionar archivo
                </button>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mt-4">No hay matches aún</h3>
                <p className="text-gray-500 mt-2">Cuando hagas match con prácticas, aparecerán aquí</p>
                <button className="mt-4 bg-[#028bbf] text-white px-4 py-2 rounded-md hover:bg-[#027ba8] transition-colors">
                  Buscar prácticas
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
