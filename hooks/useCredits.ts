import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { CreditService } from '../services/creditService';
import { CreditAccount, CreditTransaction, ToolType } from '../types/credits';

export interface UseCreditReturn {
  // Estado
  credits: number;
  loading: boolean;
  error: string | null;
  account: CreditAccount | null;
  transactions: CreditTransaction[];
  
  // Acciones
  refreshCredits: () => Promise<void>;
  consumeCredits: (tool: ToolType, description?: string) => Promise<boolean>;
  hasEnoughCredits: (tool: ToolType) => boolean;
  loadTransactionHistory: () => Promise<void>;
  
  // Nuevos métodos para reserva de créditos
  reserveCredits: (tool: ToolType, description?: string) => Promise<{ success: boolean; reservationId: string }>;
  confirmReservation: (reservationId: string, tool: ToolType, description?: string) => Promise<boolean>;
  revertReservation: (reservationId: string, tool: ToolType, reason?: string) => Promise<boolean>;
  
  // Utilidades
  shouldShowLowCreditsWarning: boolean;
}

export function useCredits(user: User | null): UseCreditReturn {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<CreditAccount | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [shouldShowLowCreditsWarning, setShouldShowLowCreditsWarning] = useState<boolean>(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      refreshCredits();
    } else {
      // Reset cuando no hay usuario
      setCredits(0);
      setAccount(null);
      setTransactions([]);
      setLoading(false);
      setError(null);
      setShouldShowLowCreditsWarning(false);
    }
  }, [user]);

  const refreshCredits = useCallback(async (): Promise<void> => {
    if (!user) {
      setCredits(0);
      setAccount(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Obtener cuenta de créditos
      const creditAccount = await CreditService.getCreditAccount(user);
      setAccount(creditAccount);
      setCredits(creditAccount.credits);
      
      // Verificar si debe mostrar warning de pocos créditos
      const showWarning = await CreditService.shouldShowLowCreditsWarning(user);
      setShouldShowLowCreditsWarning(showWarning);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al cargar créditos:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const consumeCredits = async (tool: ToolType, description?: string): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    try {
      setError(null);
      
      const result = await CreditService.consumeCredits(user, tool, description);
      
      if (result.success) {
        setCredits(result.remainingCredits);
        
        // Actualizar account si existe
        if (account) {
          setAccount({
            ...account,
            credits: result.remainingCredits,
            totalSpent: account.totalSpent + 1,
            updatedAt: new Date()
          });
        }
        
        // Verificar warning después del consumo
        const showWarning = await CreditService.shouldShowLowCreditsWarning(user);
        setShouldShowLowCreditsWarning(showWarning);
        
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al consumir créditos';
      setError(errorMessage);
      console.error('Error consumiendo créditos:', err);
      return false;
    }
  };

  const hasEnoughCredits = (tool: ToolType): boolean => {
    if (!account) return false;
    
    const requiredCredits = 1; // Todas las herramientas cuestan 1 crédito
    return account.credits >= requiredCredits;
  };

  const loadTransactionHistory = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setError(null);
      const history = await CreditService.getTransactionHistory(user);
      setTransactions(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar historial';
      setError(errorMessage);
      console.error('Error cargando historial:', err);
    }
  };

  // Nuevos métodos para el sistema de reserva de créditos
  const reserveCredits = async (tool: ToolType, description?: string): Promise<{ success: boolean; reservationId: string }> => {
    if (!user) {
      setError('Usuario no autenticado');
      return { success: false, reservationId: '' };
    }

    try {
      setError(null);
      
      const result = await CreditService.reserveCredits(user, tool, description);
      
      if (result.success) {
        // No actualizamos el balance aquí, solo marcamos la reserva
        return { success: true, reservationId: result.reservationId };
      } else {
        setError(result.message);
        return { success: false, reservationId: '' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reservar créditos';
      setError(errorMessage);
      console.error('Error reservando créditos:', err);
      return { success: false, reservationId: '' };
    }
  };

  const confirmReservation = async (reservationId: string, tool: ToolType, description?: string): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    try {
      setError(null);
      
      const result = await CreditService.confirmCreditReservation(user, reservationId, tool, description);
      
      if (result.success) {
        // Actualizar el balance después de confirmar
        setCredits(result.remainingCredits);
        
        if (account) {
          setAccount({
            ...account,
            credits: result.remainingCredits,
            totalSpent: account.totalSpent + 1,
            updatedAt: new Date()
          });
        }
        
        // Verificar warning después del consumo
        const showWarning = await CreditService.shouldShowLowCreditsWarning(user);
        setShouldShowLowCreditsWarning(showWarning);
        
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al confirmar la reserva';
      setError(errorMessage);
      console.error('Error confirmando reserva:', err);
      return false;
    }
  };

  const revertReservation = async (reservationId: string, tool: ToolType, reason?: string): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    try {
      setError(null);
      
      const result = await CreditService.revertCreditReservation(user, reservationId, tool, reason);
      
      if (result.success) {
        // Los créditos no se habían consumido, así que no necesitamos actualizar el balance
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al revertir la reserva';
      setError(errorMessage);
      console.error('Error revirtiendo reserva:', err);
      return false;
    }
  };

  // ✅ NUEVA FUNCIÓN: Escuchar cambios en tiempo real
  useEffect(() => {
    if (!user) return;

    const unsubscribe = CreditService.subscribeToCredits(user.uid, (newCredits) => {
      setCredits(newCredits);
    });

    return () => unsubscribe?.();
  }, [user]);

  return {
    // Estado
    credits,
    loading,
    error,
    account,
    transactions,
    
    // Acciones
    refreshCredits,
    consumeCredits,
    hasEnoughCredits,
    loadTransactionHistory,
    
    // Nuevos métodos para reserva de créditos
    reserveCredits,
    confirmReservation,
    revertReservation,
    
    // Utilidades
    shouldShowLowCreditsWarning
  };
}
