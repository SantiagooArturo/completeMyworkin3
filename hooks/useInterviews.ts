import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { interviewService, SavedInterview } from '@/services/interviewService';

export function useInterviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<SavedInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    totalCreditsUsed: 0,
    lastInterviewDate: null as Date | null,
    bestScore: 0,
    improvementTrend: 0,
  });

  const fetchInterviews = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      // Usar el nuevo método que sigue el patrón de CVs
      const userInterviews = await interviewService.getUserInterviewsFromFirebase(user);
      setInterviews(userInterviews);
      
      // Para mantener compatibilidad con stats, usar el UID
      const userStats = await interviewService.getUserInterviewStats(user.uid);
      setStats(userStats);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Error al cargar el historial de entrevistas');
    } finally {
      setLoading(false);
    }
  };

  const saveInterview = async (interviewData: {
    jobTitle: string;
    questions: any[];
    totalScore?: number;
    creditsUsed?: number;
  }): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const interviewId = await interviewService.saveInterview(user, interviewData);
      // Refrescar la lista después de guardar
      await fetchInterviews();
      return interviewId;
    } catch (error) {
      console.error('Error saving interview:', error);
      throw error;
    }
  };

  const deleteInterview = async (interviewId: string): Promise<void> => {
    try {
      await interviewService.deleteInterview(interviewId);
      // Refrescar la lista después de eliminar
      await fetchInterviews();
    } catch (error) {
      console.error('Error deleting interview:', error);
      throw error;
    }
  };

  const refreshInterviews = () => {
    setLoading(true);
    fetchInterviews();
  };

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  return {
    interviews,
    stats,
    loading,
    error,
    refreshInterviews,
  };
}
