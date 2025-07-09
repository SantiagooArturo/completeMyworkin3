'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import JobCard from '@/components/dashboard/JobCard';
import { 
  MapPin, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Filter,
  ChevronDown,
  Search  // ⬅️ Agregamos el icono Search
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
    id: 3,
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showInterviewBot, setShowInterviewBot] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // ⬅️ Agregamos estado para el buscador

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
        {/* Barra buscador mejorada */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar prácticas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white border-none rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Search className="h-5 w-5 text-gray-800 hover:text-[#028bbf] transition-colors cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {filterChips.map((chip) => (
              <button
                key={chip}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            {filterOptions.map((option) => (
              <div key={option.value} className="relative">
                <button className="flex items-center space-x-2 px-4 py-2 bg-inherit border border-myworkin-blue rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <span>{option.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {sampleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
