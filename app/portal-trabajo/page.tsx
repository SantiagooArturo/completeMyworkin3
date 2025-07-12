'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import JobCard from '@/components/dashboard/JobCard';
import { PortalTrabajoService } from '@/services/portalTrabajoService';
import { OnboardingMatchData } from '@/services/onboardingMatchService';
import { 
  MapPin, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Filter,
  ChevronDown,
  Search,
  Sparkles,
  ExternalLink
} from 'lucide-react';

// Datos de ejemplo para los trabajos
const sampleJobs = [
  {
    id: 1,
    title: 'UX/UI Designer',
    company: 'MyWorkin',
    location: 'Lima, Perú',
    type: 'Remoto',
    schedule: 'Tiempo completo',
    salary: 'S/ 1200',
    publishedDate: '5 días',
    skills: {
      technical: 80,
      soft: 80,
      experience: 80
    }
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Lima, Perú',
    type: 'Híbrido',
    schedule: 'Tiempo completo',
    salary: 'S/ 1500',
    publishedDate: '3 días',
    skills: {
      technical: 85,
      soft: 75,
      experience: 70
    }
  },
  {
    id: 3,
    title: 'Marketing Digital',
    company: 'StartupPeru',
    location: 'Arequipa, Perú',
    type: 'Presencial',
    schedule: 'Medio tiempo',
    salary: 'S/ 800',
    publishedDate: '7 días',
    skills: {
      technical: 60,
      soft: 90,
      experience: 65
    }
  }
];

const filterChips = [
  'Diseñador UI',
  'Diseñador UX/UI',
  'Diseñador UX',
  'Project Manager',
  'Diseñador industrial'
];

const filterOptions = [
  { label: 'Ordenar', value: 'sort' },
  { label: 'Fecha', value: 'date' },
  { label: 'Tipo trabajo', value: 'type' },
  { label: 'Experiencia', value: 'experience' },
  { label: 'Salario', value: 'salary' },
  { label: 'Jornada', value: 'schedule' }
];

export default function PortalTrabajoPage() {
  const { user } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchData, setMatchData] = useState<OnboardingMatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserMatches = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const matches = await PortalTrabajoService.getUserMatches(user.uid);
        setMatchData(matches);
      } catch (error) {
        console.error('Error cargando matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserMatches();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Portal de Trabajo
            </h1>
            {matchData && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  {matchData.source === 'api' ? 'Match IA' : 'Recomendadas'}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            {matchData 
              ? `Hemos encontrado ${matchData.practices.length} prácticas compatibles con tu perfil`
              : 'Descubre oportunidades laborales personalizadas para ti'
            }
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tus prácticas personalizadas...</p>
            </div>
          </div>
        ) : matchData && matchData.practices.length > 0 ? (
          <>
            {/* Match Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Match para: {matchData.matchQuery.puesto}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Basado en tu perfil del onboarding • {matchData.source === 'api' ? 'Análisis con IA' : 'Recomendaciones'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#028bbf]">
                    {matchData.practices.length}
                  </div>
                  <div className="text-sm text-gray-600">prácticas</div>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {matchData.practices.map((practice, index) => (
                <div key={`${practice.company}-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{practice.title}</h3>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-green-700">
                            {Math.round(practice.similitud_total)}% Match
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-lg text-gray-600 mb-3">{practice.company}</p>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">{practice.descripcion}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{practice.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{practice.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{practice.fecha_agregado}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>Práctica</span>
                        </div>
                      </div>

                      {/* Compatibility scores */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700">Requisitos</div>
                          <div className="text-lg font-bold text-[#028bbf]">{Math.round(practice.similitud_requisitos)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700">Título</div>
                          <div className="text-lg font-bold text-[#028bbf]">{Math.round(practice.similitud_titulo)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700">Experiencia</div>
                          <div className="text-lg font-bold text-[#028bbf]">{Math.round(practice.similitud_experiencia)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700">General</div>
                          <div className="text-lg font-bold text-green-600">{Math.round(practice.similitud_total)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Agregado el {practice.fecha_agregado}
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Guardar
                      </button>
                      {practice.url && (
                        <a
                          href={practice.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-2 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors"
                        >
                          Aplicar
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Fallback cuando no hay matches
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay prácticas personalizadas aún
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Completa tu onboarding y sube tu CV para recibir recomendaciones personalizadas de prácticas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/onboarding"
                className="px-6 py-3 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors"
              >
                Completar Onboarding
              </a>
              <a
                href="/bolsa-trabajo"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ver Todas las Prácticas
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
