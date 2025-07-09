'use client';

import { Loader2, FileText, Bot, Brain, Search, Upload, Download } from 'lucide-react';

interface LoadingScreenProps {
  variant?: 'default' | 'dashboard' | 'cv' | 'interview' | 'analysis' | 'upload' | 'processing';
  message?: string;
  subtitle?: string;
  progress?: number;
  showProgress?: boolean;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingScreen({ 
  variant = 'default',
  message,
  subtitle,
  progress,
  showProgress = false,
  fullScreen = true,
  className = ''
}: LoadingScreenProps) {
  
  const getLoadingContent = () => {
    switch (variant) {
      case 'dashboard':
        return {
          icon: <Loader2 className="h-12 w-12 text-myworkin-blue animate-spin" />,
          title: message || 'Cargando dashboard...',
          subtitle: subtitle || 'Preparando tu espacio de trabajo',
          bgGradient: 'from-blue-50 via-indigo-50 to-purple-50'
        };
        
      case 'cv':
        return {
          icon: <FileText className="h-12 w-12 text-myworkin-blue animate-pulse" />,
          title: message || 'Procesando CV...',
          subtitle: subtitle || 'Preparando tu currículum vitae',
          bgGradient: 'from-green-50 via-blue-50 to-teal-50'
        };
        
      case 'interview':
        return {
          icon: <Bot className="h-12 w-12 text-myworkin-blue animate-bounce" />,
          title: message || 'Preparando entrevista...',
          subtitle: subtitle || 'Configurando simulación con IA',
          bgGradient: 'from-purple-50 via-pink-50 to-red-50'
        };
        
      case 'analysis':
        return {
          icon: <Brain className="h-12 w-12 text-myworkin-blue animate-pulse" />,
          title: message || 'Analizando con IA...',
          subtitle: subtitle || 'Procesando información',
          bgGradient: 'from-orange-50 via-yellow-50 to-amber-50'
        };
        
      case 'upload':
        return {
          icon: <Upload className="h-12 w-12 text-myworkin-blue animate-bounce" />,
          title: message || 'Subiendo archivo...',
          subtitle: subtitle || 'Guardando tu documento',
          bgGradient: 'from-cyan-50 via-sky-50 to-blue-50'
        };
        
      case 'processing':
        return {
          icon: <Search className="h-12 w-12 text-myworkin-blue animate-spin" />,
          title: message || 'Procesando...',
          subtitle: subtitle || 'Esto puede tomar unos momentos',
          bgGradient: 'from-indigo-50 via-purple-50 to-pink-50'
        };
        
      default:
        return {
          icon: <Loader2 className="h-12 w-12 text-myworkin-blue animate-spin" />,
          title: message || 'Cargando...',
          subtitle: subtitle || 'Por favor espera',
          bgGradient: 'from-gray-50 via-slate-50 to-zinc-50'
        };
    }
  };

  const content = getLoadingContent();
  
  const containerClasses = fullScreen 
    ? `min-h-screen bg-gradient-to-br ${content.bgGradient} flex items-center justify-center`
    : `flex items-center justify-center p-8 bg-gradient-to-br ${content.bgGradient} rounded-lg`;

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-full shadow-lg">
            {content.icon}
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {content.title}
        </h2>
        
        {/* Subtitle */}
        {content.subtitle && (
          <p className="text-gray-600 mb-6">
            {content.subtitle}
          </p>
        )}
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full max-w-sm mx-auto mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-myworkin-blue h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-myworkin-blue rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-myworkin-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-myworkin-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Componente específico para modal de carga
export function LoadingModal({ 
  isOpen, 
  variant = 'default', 
  message,
  subtitle,
  progress,
  showProgress = false 
}: LoadingScreenProps & { isOpen: boolean }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
        <LoadingScreen 
          variant={variant}
          message={message}
          subtitle={subtitle}
          progress={progress}
          showProgress={showProgress}
          fullScreen={false}
          className="bg-transparent"
        />
      </div>
    </div>
  );
}

// Spinner simple para botones
export function ButtonSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Loader2 className={`animate-spin ${className}`} />
  );
}

// Componente de carga inline
export function InlineLoader({ 
  message = "Cargando...", 
  className = "" 
}: { 
  message?: string; 
  className?: string; 
}) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex items-center space-x-3">
        <Loader2 className="h-6 w-6 text-myworkin-blue animate-spin" />
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}

// Skeleton loader para contenido
export function SkeletonLoader({ 
  type = 'card',
  count = 1 
}: { 
  type?: 'card' | 'list' | 'text' | 'profile';
  count?: number;
}) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        );
        
      case 'profile':
        return (
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-3/5"></div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
