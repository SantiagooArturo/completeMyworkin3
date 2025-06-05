'use client';

import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Gift, Coins } from 'lucide-react';
import { CREDIT_CONFIG } from '@/types/credits';

interface WelcomeCreditsNotificationProps {
  /**
   * Si se debe mostrar la notificación
   */
  show: boolean;
  /**
   * Callback cuando la notificación se muestra
   */
  onShown?: () => void;
}

/**
 * Componente que muestra una notificación de bienvenida cuando el usuario recibe sus créditos gratuitos.
 * Utiliza el sistema de toast de la aplicación para mostrar un mensaje atractivo y profesional.
 */
export default function WelcomeCreditsNotification({ 
  show, 
  onShown 
}: WelcomeCreditsNotificationProps) {
  
  useEffect(() => {
    if (show) {
      // Mostrar toast de bienvenida con créditos
      toast({
        title: (
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-green-100 rounded-full">
              <Gift className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-semibold text-green-900">¡Bienvenido a MyWorkIn!</span>
          </div>
        ),
        description: (
          <div className="space-y-2">
            <p className="text-gray-700">
              {CREDIT_CONFIG.MESSAGES.WELCOME_CREDITS}
            </p>
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
              <Coins className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                {CREDIT_CONFIG.WELCOME_CREDITS} crédito agregado a tu cuenta
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Usa tu crédito para analizar tu CV, crear uno nuevo, o buscar empleos compatibles.
            </div>
          </div>
        ),
        variant: "default",
        className: "border-green-200 bg-green-50"
      });

      // Llamar callback si se proporciona
      onShown?.();
    }
  }, [show, onShown]);

  // Este componente no renderiza nada visualmente, solo maneja el toast
  return null;
}

/**
 * Hook personalizado para manejar la notificación de créditos de bienvenida
 */
export function useWelcomeCreditsNotification() {
  const showWelcomeNotification = () => {
    toast({
      title: (
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-green-100 rounded-full">
            <Gift className="h-4 w-4 text-green-600" />
          </div>
          <span className="font-semibold text-green-900">¡Bienvenido a MyWorkIn!</span>
        </div>
      ),
      description: (
        <div className="space-y-2">
          <p className="text-gray-700">
            {CREDIT_CONFIG.MESSAGES.WELCOME_CREDITS}
          </p>
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
            <Coins className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              {CREDIT_CONFIG.WELCOME_CREDITS} crédito agregado a tu cuenta
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Usa tu crédito para analizar tu CV, crear uno nuevo, o buscar empleos compatibles.
          </div>
        </div>
      ),
      variant: "default",
      className: "border-green-200 bg-green-50"
    });
  };

  return { showWelcomeNotification };
}