import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { interviewService, InterviewSession } from '@/services/interviewService';

export function useInterviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
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
      const userInterviews = await interviewService.getUserInterviews(user.uid);
      setInterviews(userInterviews);
      
      const userStats = await interviewService.getUserInterviewStats(user.uid);
      setStats(userStats);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Error al cargar el historial de entrevistas');
    } finally {
      setLoading(false);
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
