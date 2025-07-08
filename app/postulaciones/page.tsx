'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText, Calendar, CheckCircle, Clock, X } from 'lucide-react';

const applications = [
  {
    id: 1,
    jobTitle: 'UX/UI Designer',
    company: 'TechCorp',
    appliedDate: '2024-01-15',
    status: 'pending',
    statusText: 'En revisión'
  },
  {
    id: 2,
    jobTitle: 'Frontend Developer',
    company: 'StartupXYZ',
    appliedDate: '2024-01-10',
    status: 'accepted',
    statusText: 'Aceptado'
  },
  {
    id: 3,
    jobTitle: 'Product Designer',
    company: 'DesignCo',
    appliedDate: '2024-01-05',
    status: 'rejected',
    statusText: 'Rechazado'
  }
];

export default function PostulacionesPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Postulaciones</h1>
          <p className="text-gray-600">Revisa el estado de tus aplicaciones</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Todas las postulaciones</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {applications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{app.jobTitle}</h3>
                      <p className="text-gray-600">{app.company}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Aplicado el {new Date(app.appliedDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span>{app.statusText}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
