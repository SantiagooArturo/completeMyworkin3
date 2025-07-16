import React from 'react';
import { FileUp, Search, Zap, CheckCircle } from 'lucide-react';

interface OnboardingLoadingScreenProps {
  currentStep?: 'saving' | 'searching' | 'preparing' | 'complete';
}

const LOADING_STEPS = [
  {
    key: 'saving',
    icon: FileUp,
    title: 'Guardando tu perfil...',
    description: 'Almacenando tu información académica y preferencias'
  },
  {
    key: 'searching',
    icon: Search,
    title: 'Buscando prácticas compatibles...',
    description: 'Analizando ofertas que se adapten a tu perfil'
  },
  {
    key: 'preparing',
    icon: Zap,
    title: 'Preparando tu portal de trabajo...',
    description: 'Configurando tu experiencia personalizada'
  },
  {
    key: 'complete',
    icon: CheckCircle,
    title: '¡Listo!',
    description: 'Tu perfil ha sido configurado exitosamente'
  }
];

export default function OnboardingLoadingScreen({ currentStep = 'saving' }: OnboardingLoadingScreenProps) {
  const currentStepIndex = LOADING_STEPS.findIndex(step => step.key === currentStep);
  const CurrentIcon = LOADING_STEPS[currentStepIndex]?.icon || FileUp;
  const currentStepData = LOADING_STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-[#eff8ff] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8 mx-auto mb-4" />
        </div>

        {/* Icono animado principal */}
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
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
          <h2 className="text-2xl font-semibold text-[#373737] mb-2">
            {currentStepData?.title}
          </h2>
          <p className="text-gray-600 text-base">
            {currentStepData?.description}
          </p>
        </div>

        {/* Indicadores de progreso */}
        <div className="space-y-4">
          {LOADING_STEPS.map((step, index) => {
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
                    <CheckCircle className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <step.icon className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </div>
                
                {/* Texto del paso */}
                <div className="flex-1">
                  <div className={`
                    text-sm font-medium transition-colors duration-300
                    ${isCompleted ? 'text-green-600' : 
                      isCurrent ? 'text-[#028bbf]' : 
                      'text-gray-400'}
                  `}>
                    {step.title.replace('...', '')}
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

        {/* Mensaje de espera */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Este proceso puede tomar unos momentos...
          </p>
        </div>
      </div>
    </div>
  );
}
