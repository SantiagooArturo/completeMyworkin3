'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Zap, Crown, Star, ArrowRight, FileText, TrendingUp, Users, Sparkles, CheckCircle, Lock } from 'lucide-react';

interface CVAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CVAnalysisModal({ isOpen, onClose }: CVAnalysisModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const benefits = [
    {
      icon: FileText,
      title: "Análisis ilimitados",
      description: "Analiza todos los CVs que quieras sin restricciones",
      color: "bg-blue-500"
    },
    {
      icon: TrendingUp,
      title: "IA Especialista",
      description: "Acceso a Worky y otros agentes de empleabilidad",
      color: "bg-green-500"
    },
    {
      icon: Users,
      title: "Búsqueda personalizada",
      description: "Encuentra trabajos que coincidan con tu perfil",
      color: "bg-purple-500"
    },
    {
      icon: Crown,
      title: "Dashboard premium",
      description: "Seguimiento avanzado de tu progreso profesional",
      color: "bg-yellow-500"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      const timer = setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden transform transition-all duration-300 scale-100">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                {['⭐', '🚀', '💼', '📈', '🎯'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}

        {/* Header con gradiente animado */}
        <div className="bg-gradient-to-br from-[#028bbf] via-[#0369a1] to-[#1e40af] px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 p-2 hover:bg-white/20 rounded-full"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          
          <div className="text-center relative z-10">
            <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm animate-pulse">
              <Lock className="h-10 w-10 text-yellow-300" />
            </div>
            <h3 className="text-3xl font-bold mb-3 animate-fade-in">¡Análisis Bloqueado! 🔒</h3>
            <p className="text-blue-100 text-lg">
              Tu CV está esperando un análisis premium
            </p>
            <div className="mt-4 bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
              <span className="text-yellow-300 font-semibold">⚡ Análisis gratuito usado</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-8 py-8">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              🚀 ¡Desbloquea tu potencial!
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Crea una cuenta <span className="font-semibold text-[#028bbf]">totalmente gratis</span> y obtén 
              acceso a herramientas que han ayudado a <span className="font-semibold">+10,000 estudiantes</span> 
              a conseguir empleo.
            </p>
          </div>          {/* Beneficios con animaciones */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="benefit-item group p-4 border border-gray-200 rounded-xl hover:border-[#028bbf] hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className={`${benefit.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform animate-float`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-1 group-hover:text-[#028bbf] transition-colors">
                    {benefit.title}
                  </h5>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Estadísticas sociales */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6 border border-green-200">
            <div className="flex items-center justify-center space-x-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">10K+</div>
                <div className="text-xs text-gray-600">Estudiantes</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <div className="text-2xl font-bold text-blue-600">85%</div>
                <div className="text-xs text-gray-600">Éxito laboral</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-xs text-gray-600">Disponible</div>
              </div>
            </div>
          </div>

          {/* Call to action mejorado */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="group w-full bg-gradient-to-r from-[#028bbf] to-[#0369a1] hover:from-[#027ba8] hover:to-[#1e40af] text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Sparkles className="h-5 w-5 group-hover:animate-spin" />
              <span>¡Crear cuenta GRATIS ahora!</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="text-center">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Continuar sin registrarme
              </button>
            </div>
          </div>

          {/* Footer mejorado */}
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>100% gratuito</span>
              <span>•</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sin tarjeta de crédito</span>
              <span>•</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Acceso inmediato</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
