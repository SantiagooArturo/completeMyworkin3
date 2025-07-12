import { FileUp } from 'lucide-react';

interface CVAnalysisCarouselProps {
  analysisStep: number;
  analyzeProgress: number;
}

const ANALYSIS_MESSAGES = [
  'Subiendo tu CV...',
  'Analizando estructura...',
  'Evaluando contenido...',
  'Generando recomendaciones...',
  'Finalizando análisis...'
];

export default function CVAnalysisCarousel({ analysisStep, analyzeProgress }: CVAnalysisCarouselProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center">
              <FileUp className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-[#373737]">
          Analizando tu CV
        </h3>
        <p className="text-base text-gray-600 max-w-md mx-auto">
          {ANALYSIS_MESSAGES[analysisStep]}
        </p>
      </div>
      {/* Barra de progreso */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progreso</span>
          <span>{analyzeProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${analyzeProgress}%` }}
          ></div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500">
        <p>Este proceso puede tomar unos momentos...</p>
      </div>
    </div>
  );
}