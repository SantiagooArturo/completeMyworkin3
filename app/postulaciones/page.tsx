'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Building, 
  MapPin, 
  Clock, 
  Search, 
  Filter,
  ChevronDown,
  Calendar
} from 'lucide-react';

// Tipos para las columnas
type ColumnType = 'guardados' | 'postulados' | 'entrevistas' | 'rechazados' | 'aceptados';

interface JobApplication {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  schedule: string;
  appliedDate: string;
  status: ColumnType;
}

// Datos de ejemplo
const initialApplications: JobApplication[] = [
  {
    id: 1,
    title: 'UX/UI Designer',
    company: 'MyWorkin',
    location: 'Lima, Perú',
    type: 'Remoto',
    schedule: 'Tiempo completo',
    appliedDate: '07/01/25',
    status: 'guardados'
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Lima, Perú',
    type: 'Híbrido',
    schedule: 'Tiempo completo',
    appliedDate: '07/01/25',
    status: 'postulados'
  },
  {
    id: 3,
    title: 'Product Designer',
    company: 'DesignCo',
    location: 'Arequipa, Perú',
    type: 'Presencial',
    schedule: 'Medio tiempo',
    appliedDate: '07/01/25',
    status: 'entrevistas'
  },
  {
    id: 4,
    title: 'Marketing Digital',
    company: 'StartupPeru',
    location: 'Lima, Perú',
    type: 'Remoto',
    schedule: 'Tiempo completo',
    appliedDate: '06/01/25',
    status: 'aceptados'
  },
  {
    id: 5,
    title: 'Desarrollador Backend',
    company: 'TechSolutions',
    location: 'Cusco, Perú',
    type: 'Híbrido',
    schedule: 'Tiempo completo',
    appliedDate: '05/01/25',
    status: 'rechazados'
  }
];

const columns = [
  { id: 'guardados' as ColumnType, title: 'Guardados', count: 20, color: 'bg-blue-500' },
  { id: 'postulados' as ColumnType, title: 'Postulados', count: 13, color: 'bg-purple-500' },
  { id: 'entrevistas' as ColumnType, title: 'Entrevistas', count: 13, color: 'bg-orange-500' },
  { id: 'rechazados' as ColumnType, title: 'Rechazados', count: 5, color: 'bg-red-500' },
  { id: 'aceptados' as ColumnType, title: 'Aceptados', count: 9, color: 'bg-green-500' }
];

// Componente de JobCard simplificado
function JobApplicationCard({ job, onDragStart }: { job: JobApplication; onDragStart: (job: JobApplication) => void }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(job)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-move mb-3"
    >
      {/* Header con fecha */}
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs text-gray-500">
          Última actualización {job.appliedDate}
        </p>
      </div>

      {/* Logo y título */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight">
            {job.title}
          </h3>
          <p className="text-gray-600 text-sm">
            {job.company}
          </p>
        </div>
      </div>

      {/* Detalles */}
      <div className="space-y-2">
        <div className="flex items-center text-xs text-gray-600">
          <MapPin className="h-3 w-3 mr-2" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <Building className="h-3 w-3 mr-2" />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <Clock className="h-3 w-3 mr-2" />
          <span>{job.schedule}</span>
        </div>
      </div>
    </div>
  );
}

export default function PostulacionesPage() {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [draggedJob, setDraggedJob] = useState<JobApplication | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const handleDragStart = useCallback((job: JobApplication) => {
    setDraggedJob(job);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: ColumnType) => {
    e.preventDefault();
    if (draggedJob) {
      setApplications(prev => 
        prev.map(app => 
          app.id === draggedJob.id 
            ? { ...app, status: newStatus }
            : app
        )
      );
      setDraggedJob(null);
    }
  }, [draggedJob]);

  const getApplicationsByStatus = (status: ColumnType) => {
    return applications.filter(app => app.status === status);
  };

  const filterOptions = [
    'Estado',
    'Tipo trabajo', 
    'Experiencia',
    'Jornada'
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mis postulaciones
          </h1>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar en mis postulaciones"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-myworkin-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-myworkin-500"
                placeholder="04/17/2022"
              />
            </div>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-myworkin-500"
                placeholder="04/17/2022"
              />
            </div>
            
            {/* Botón Filtrar */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center space-x-2 px-6 py-3 bg-myworkin-500 text-white rounded-xl font-medium hover:bg-myworkin-600 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtrar</span>
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                    Filtros
                  </div>
                  {filterOptions.map((option) => (
                    <div key={option} className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{option}</span>
                        <select className="text-xs border border-gray-200 rounded px-2 py-1">
                          <option>Selecciona {option.toLowerCase()}</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-myworkin-500 hover:text-myworkin-600">
                      Limpiar
                    </button>
                    <button className="text-sm bg-myworkin-500 text-white px-3 py-1 rounded hover:bg-myworkin-600">
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-gray-50 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
                  {getApplicationsByStatus(column.id).length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {getApplicationsByStatus(column.id).map((job) => (
                  <JobApplicationCard
                    key={job.id}
                    job={job}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
