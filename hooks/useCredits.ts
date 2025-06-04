import { useState, useEffect } from 'react';
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

  const refreshCredits = async (): Promise<void> => {
    if (!user) return;
    
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
  };

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
    
    // Utilidades
    shouldShowLowCreditsWarning
  };
}
