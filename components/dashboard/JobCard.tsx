'use client';

import { MapPin, Clock, DollarSign, Heart, Building } from 'lucide-react';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    schedule: string;
    salary: string;
    publishedDate: string;
    skills: {
      technical: number;
      soft: number;
      experience: number;
    };
  };
}

function CircularProgress({ percentage, label, color }: { percentage: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 mb-2">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 text-center font-medium">{label}</p>
    </div>
  );
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Job Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            {/* Company Logo Placeholder */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            
            {/* Job Details */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-3">{job.company}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{job.schedule}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Publicado hace {job.publishedDate}
              </p>
              
              <button className="bg-[#028bbf] hover:bg-[#027ba8] text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Aplicar ahora
              </button>
            </div>
          </div>
        </div>
        
        {/* Skills Match */}
        <div className="ml-6 flex space-x-6">
          <CircularProgress
            percentage={job.skills.technical}
            label="Habilidades técnicas"
            color="text-green-500"
          />
          <CircularProgress
            percentage={job.skills.soft}
            label="Habilidades blandas"
            color="text-blue-500"
          />
          <CircularProgress
            percentage={job.skills.experience}
            label="Experiencia"
            color="text-teal-500"
          />
        </div>
      </div>
    </div>
  );
}
