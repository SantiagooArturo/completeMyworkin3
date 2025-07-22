'use client';

import { useState, useEffect } from 'react';
import { FileText, Bot, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface AdaptationLoadingScreenProps {
  currentStep?: 'extracting' | 'analyzing' | 'adapting' | 'saving' | 'complete' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
}

const ADAPTATION_STEPS = [
  {
    key: 'extracting',
    icon: FileText,
    title: 'Extrayendo información del CV',
    description: 'Analizando tu CV para obtener todos los datos relevantes...'
  },
  {
    key: 'analyzing', 
    icon: Bot,
    title: 'Analizando el puesto de trabajo',
    description: 'Comparando tu perfil con los requisitos del puesto...'
  },
  {
    key: 'adapting',
    icon: Bot,
    title: 'Adaptando tu CV con IA',
    description: 'Personalizando tu CV para maximizar tus posibilidades...'
  },
  {
    key: 'saving',
    icon: CheckCircle,
    title: 'Guardando adaptaciones',
    description: 'Preparando tu CV personalizado...'
  }
];

export default function AdaptationLoadingScreen({ 
  currentStep = 'extracting', 
  errorMessage,
  onRetry 
}: AdaptationLoadingScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Simular progreso automático
  useEffect(() => {
    const targetProgress = (currentStepIndex + 1) * 25;
    
    if (progress < targetProgress) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 1, targetProgress));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, progress]);

  // Actualizar step index cuando cambia el currentStep
  useEffect(() => {
    const stepIndex = ADAPTATION_STEPS.findIndex(step => step.key === currentStep);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  }, [currentStep]);

  if (currentStep === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8 mx-auto mb-4" />
          </div>

          {/* Icono de error */}
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>

          <h2 className="text-2xl font-semibold text-red-900 mb-4">
            Error al adaptar tu CV
          </h2>
          
          <p className="text-red-700 mb-6">
            {errorMessage || 'Hubo un problema procesando tu CV. Por favor, inténtalo de nuevo.'}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8 mx-auto mb-4" />
          </div>

          {/* Icono de éxito */}
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-2xl font-semibold text-green-900 mb-4">
            ¡CV adaptado exitosamente!
          </h2>
          
          <p className="text-green-700 mb-6">
            Tu CV ha sido personalizado específicamente para este puesto de trabajo.
          </p>
        </div>
      </div>
    );
  }

  const currentStepData = ADAPTATION_STEPS[currentStepIndex];
  const CurrentIcon = currentStepData?.icon || Bot;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8 mx-auto mb-4" />
        </div>

        {/* Icono animado principal */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Círculo de fondo */}
          <div className="absolute inset-0 border-4 border-[#028bbf]/20 rounded-full"></div>
          
          {/* Círculo animado */}
          <div 
            className="absolute inset-0 border-4 border-transparent border-t-[#028bbf] rounded-full animate-spin"
            style={{ animationDuration: '2s' }}
          ></div>
          
          {/* Círculo interno */}
          <div className="absolute inset-3 bg-[#028bbf]/10 rounded-full flex items-center justify-center">
            <CurrentIcon className="w-10 h-10 text-[#028bbf]" strokeWidth={1.5} />
          </div>
        </div>
        
        {/* Título y descripción */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Adaptando tu CV con IA
        </h2>
        
        <h3 className="text-lg font-medium text-[#028bbf] mb-2">
          {currentStepData?.title}
        </h3>
        
        <p className="text-gray-600 text-base mb-8">
          {currentStepData?.description}
        </p>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className="bg-gradient-to-r from-[#028bbf] to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Indicadores de progreso por pasos */}
        <div className="space-y-3">
          {ADAPTATION_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            
            return (
              <div key={step.key} className="flex items-center gap-4">
                {/* Icono del paso */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : 
                    isCurrent ? 'bg-[#028bbf] text-white' : 
                    'bg-gray-200 text-gray-400'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <step.icon className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </div>
                
                {/* Texto del paso */}
                <div className="flex-1 text-left">
                  <div className={`
                    text-sm font-medium transition-colors duration-300
                    ${isCompleted ? 'text-green-600' : 
                      isCurrent ? 'text-[#028bbf]' : 
                      'text-gray-400'}
                  `}>
                    {step.title}
                  </div>
                </div>
                
                {/* Indicador de estado */}
                {isCurrent && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#028bbf] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#028bbf] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#028bbf] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensaje de espera con tiempo estimado */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-2">
            Este proceso puede tomar entre 1-3 minutos...
          </p>
          <p className="text-xs text-gray-400">
            {currentStep === 'extracting' && 'La extracción puede tardar más si tu CV es muy detallado'}
            {currentStep === 'analyzing' && 'Analizando compatibilidad con el puesto'}
            {currentStep === 'adapting' && 'Aplicando mejoras personalizadas'}
            {currentStep === 'saving' && 'Finalizando los cambios...'}
          </p>
        </div>
      </div>
    </div>
  );
}
