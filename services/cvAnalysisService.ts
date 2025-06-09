'use client';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface CVAnalysisJob {
  id: string;
  userId: string;
  userEmail: string;
  pdfUrl: string;
  position: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: any;
  startedAt?: any;
  completedAt?: any;
  progress: number;
  result?: any;
  error?: string;
  estimatedTimeRemaining?: number;
}

export class CVAnalysisService {
  private static instance: CVAnalysisService;
  
  public static getInstance(): CVAnalysisService {
    if (!CVAnalysisService.instance) {
      CVAnalysisService.instance = new CVAnalysisService();
    }
    return CVAnalysisService.instance;
  }

  /**
   * Crear un nuevo trabajo de análisis de CV
   */
  async createAnalysisJob(
    userId: string,
    userEmail: string,
    pdfUrl: string,
    position: string
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const response = await fetch('/api/cv-analysis/create-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          pdfUrl,
          position
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el trabajo');
      }

      return {
        success: true,
        jobId: data.jobId
      };

    } catch (error) {
      console.error('Error creando trabajo de análisis:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Obtener el estado de un trabajo específico
   */
  async getJobStatus(jobId: string): Promise<{ success: boolean; job?: CVAnalysisJob; error?: string }> {
    try {
      const response = await fetch(`/api/cv-analysis/status/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener estado del trabajo');
      }

      return {
        success: true,
        job: data.job
      };

    } catch (error) {
      console.error('Error obteniendo estado del trabajo:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Obtener trabajos del usuario
   */
  async getUserJobs(userId: string, limitCount: number = 10): Promise<{ success: boolean; jobs?: CVAnalysisJob[]; error?: string }> {
    try {
      const response = await fetch(`/api/cv-analysis/user-jobs?userId=${userId}&limit=${limitCount}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener trabajos del usuario');
      }

      return {
        success: true,
        jobs: data.jobs
      };

    } catch (error) {
      console.error('Error obteniendo trabajos del usuario:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Escuchar cambios en tiempo real de un trabajo específico
   */
  subscribeToJobUpdates(
    jobId: string, 
    callback: (job: CVAnalysisJob | null) => void
  ): () => void {
    const jobRef = doc(db, 'cv_analysis_jobs', jobId);
    
    const unsubscribe = onSnapshot(jobRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const job: CVAnalysisJob = {
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          startedAt: data.startedAt instanceof Timestamp ? data.startedAt.toDate().toISOString() : data.startedAt,
          completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate().toISOString() : data.completedAt,
        } as CVAnalysisJob;
        
        callback(job);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error en suscripción a trabajo:', error);
      callback(null);
    });

    return unsubscribe;
  }

  /**
   * Escuchar cambios en tiempo real de trabajos del usuario
   */
  subscribeToUserJobs(
    userId: string,
    callback: (jobs: CVAnalysisJob[]) => void,
    limitCount: number = 10
  ): () => void {
    const jobsQuery = query(
      collection(db, 'cv_analysis_jobs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(jobsQuery, (querySnapshot) => {
      const jobs: CVAnalysisJob[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          startedAt: data.startedAt instanceof Timestamp ? data.startedAt.toDate().toISOString() : data.startedAt,
          completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate().toISOString() : data.completedAt,
        } as CVAnalysisJob;
      });
      
      callback(jobs);
    }, (error) => {
      console.error('Error en suscripción a trabajos del usuario:', error);
      callback([]);
    });

    return unsubscribe;
  }

  /**
   * Polling para obtener actualizaciones de un trabajo
   * Útil cuando no se puede usar listeners en tiempo real
   */
  async pollJobStatus(
    jobId: string,
    onUpdate: (job: CVAnalysisJob) => void,
    onComplete: (job: CVAnalysisJob) => void,
    onError: (error: string) => void,
    intervalMs: number = 3000
  ): Promise<() => void> {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const result = await this.getJobStatus(jobId);
        
        if (result.success && result.job) {
          onUpdate(result.job);
          
          if (result.job.status === 'completed') {
            onComplete(result.job);
            isPolling = false;
            return;
          }
          
          if (result.job.status === 'failed') {
            onError(result.job.error || 'Trabajo falló sin mensaje de error');
            isPolling = false;
            return;
          }
        } else {
          onError(result.error || 'Error desconocido al obtener estado');
          isPolling = false;
          return;
        }

        // Programar siguiente polling
        if (isPolling) {
          setTimeout(poll, intervalMs);
        }
        
      } catch (error) {
        onError(String(error));
        isPolling = false;
      }
    };

    // Iniciar polling
    poll();

    // Retornar función para detener polling
    return () => {
      isPolling = false;
    };
  }

  /**
   * Formatear tiempo estimado restante
   */
  formatEstimatedTime(seconds: number): string {
    if (seconds <= 0) return 'Finalizando...';
    
    if (seconds < 60) {
      return `${seconds} segundos`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  }

  /**
   * Formatear estado del trabajo para mostrar al usuario
   */
  formatJobStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'En cola';
      case 'processing':
        return 'Procesando';
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Falló';
      default:
        return 'Desconocido';
    }
  }
}
