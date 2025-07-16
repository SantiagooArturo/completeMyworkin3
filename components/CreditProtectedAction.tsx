'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { CreditService } from '@/services/creditService';
import { ToolType } from '@/types/credits';
import InsufficientCreditsModal from './InsufficientCreditsModal';

interface CreditProtectedActionProps {
  children: React.ReactNode;
  toolType: ToolType;
  requiredCredits?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function CreditProtectedAction({
  children,
  toolType,
  requiredCredits = 1,
  onSuccess,
  onError,
  className = ''
}: CreditProtectedActionProps) {
  const { user } = useAuth();
  const { credits, refreshCredits } = useCredits(user);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);

  const handleAction = async () => {
    if (!user) {
      onError?.('Debes iniciar sesión para usar esta herramienta');
      return;
    }

    // Verificar si tiene suficientes créditos
    if (credits < requiredCredits) {
      setShowInsufficientModal(true);
      return;
    }

    try {
      setIsConsuming(true);
        // Consumir créditos
      const consumeResult = await CreditService.consumeCredits(user, toolType, `Uso de herramienta: ${toolType}`);
      
      if (!consumeResult.success) {
        onError?.(consumeResult.message || 'Error al consumir créditos');
        return;
      }

      // Actualizar balance de créditos
      await refreshCredits();
      
      // Ejecutar acción exitosa
      onSuccess?.();
      
    } catch (error) {
      console.error('Error consuming credits:', error);
      onError?.(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsConsuming(false);
    }
  };

  const handleInsufficientModalClose = () => {
    setShowInsufficientModal(false);
  };

  return (
    <>
      <div 
        className={className}
        onClick={handleAction}
        style={{ cursor: isConsuming ? 'wait' : 'pointer' }}
      >
        {children}
      </div>

      {showInsufficientModal && user && (
        <InsufficientCreditsModal
          isOpen={showInsufficientModal}
          onClose={handleInsufficientModalClose}
          user={user}
          toolType={toolType}
          requiredCredits={requiredCredits}
          currentCredits={credits}
        />
      )}
    </>
  );
}
