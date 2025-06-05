'use client';

import React from 'react';
import { CVData } from '@/types/cv';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Wrench, 
  FolderOpen, 
  Award, 
  Languages, 
  Users,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CVBuilderTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cvData: CVData;
  children: React.ReactNode;
  isStudentMode?: boolean;
}

export default function CVBuilderTabs({ activeTab, onTabChange, cvData, children, isStudentMode = false }: CVBuilderTabsProps) {  const baseTabs = [
    {
      id: 'personal',
      label: 'Personal',
      icon: User,
      isComplete: !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone && cvData.personalInfo.summary)
    },
    {
      id: 'education',
      label: 'Educación',
      icon: GraduationCap,
      isComplete: cvData.education.length > 0 && cvData.education.every(edu => edu.institution && edu.degree)
    },    
    {
      id: 'experience_projects',
      label: isStudentMode ? 'Experiencia' : 'Experiencia',
      icon: FolderOpen,  
      isComplete: isStudentMode 
        ? (cvData.projects.length > 0 || cvData.workExperience.length > 0)
        : (cvData.workExperience.length > 0 && cvData.workExperience.every(exp => exp.company && exp.position && exp.achievements.length > 0))
    },
    {
      id: 'skills_certifications',
      label: 'Habilidades',
      icon: Award,
      isComplete: cvData.skills.length > 0 || cvData.certifications.length > 0
    },
  ];

  // Agregar pestaña de hobbies solo en modo estudiante
  const tabs = isStudentMode 
    ? [
        ...baseTabs,
        {
          id: 'hobbies',
          label: 'Hobbies',
          icon: Heart,
          isComplete: (cvData.hobbies && cvData.hobbies.length > 0) || false
        }
      ]
    : baseTabs;

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const canGoNext = currentTabIndex < tabs.length - 1;
  const canGoPrevious = currentTabIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      onTabChange(tabs[currentTabIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      onTabChange(tabs[currentTabIndex - 1].id);
    }
  };

  const getCompletionPercentage = () => {
    const completedTabs = tabs.filter(tab => tab.isComplete).length;
    return Math.round((completedTabs / tabs.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progreso del CV</h3>
          <span className="text-sm font-medium text-[#028bbf] bg-blue-50 px-3 py-1 rounded-full">
            {getCompletionPercentage()}% Completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-[#028bbf] to-[#0ea5e9] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className={`grid w-full ${isStudentMode ? 'grid-cols-5 lg:grid-cols-5' : 'grid-cols-4 lg:grid-cols-4'} gap-1 h-auto bg-gray-50 p-2 rounded-lg`}>
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isCompleted = tab.isComplete;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white shadow-md border-2 border-[#028bbf] text-[#028bbf]' 
                    : 'hover:bg-white/50 text-gray-600 hover:text-gray-900'
                  }
                  ${isCompleted ? 'bg-green-50 border-green-200' : ''}
                `}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#028bbf]' : 'text-gray-500'}`} />
                  {isCompleted && (
                    <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-white rounded-full" />
                  )}
                  {!isCompleted && (
                    <Circle className="absolute -top-1 -right-1 h-3 w-3 text-gray-300 bg-white rounded-full" />
                  )}
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${isActive ? 'text-[#028bbf]' : 'text-gray-600'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-[#028bbf] rotate-45"></div>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        <div className="mt-8">
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Paso {currentTabIndex + 1} de {tabs.length}</span>
          </div>

          <Button
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex items-center gap-2 bg-[#028bbf] hover:bg-[#027ba8]"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Tabs>
    </div>
  );
}