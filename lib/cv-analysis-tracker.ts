import { db } from '@/firebase/config';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface AnalysisJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  userId: string;
  pdfUrl: string;
  puesto: string;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
}

export class CVAnalysisTracker {
  static async createJob(userId: string, pdfUrl: string, puesto: string): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: AnalysisJob = {
      id: jobId,
      status: 'pending',
      userId,
      pdfUrl,
      puesto,
      createdAt: new Date(),
      progress: 0
    };

    await setDoc(doc(db, 'cv_analysis_jobs', jobId), job);
    console.log('✅ Job creado:', jobId);
    
    return jobId;
  }

  static async getJob(jobId: string): Promise<AnalysisJob | null> {
    try {
      const docRef = doc(db, 'cv_analysis_jobs', jobId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || undefined,
        } as AnalysisJob;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo job:', error);
      return null;
    }
  }

  static async updateJob(jobId: string, updates: Partial<AnalysisJob>): Promise<void> {
    try {
      const docRef = doc(db, 'cv_analysis_jobs', jobId);
      await updateDoc(docRef, updates);
      console.log(`🔄 Job ${jobId} actualizado:`, updates);
    } catch (error) {
      console.error('❌ Error actualizando job:', error);
    }
  }

  static async completeJob(jobId: string, result: any): Promise<void> {
    await this.updateJob(jobId, {
      status: 'completed',
      result,
      completedAt: new Date(),
      progress: 100
    });
  }

  static async failJob(jobId: string, error: string): Promise<void> {
    await this.updateJob(jobId, {
      status: 'failed',
      error,
      completedAt: new Date()
    });
  }

  static async getUserJobs(userId: string, limitCount: number = 10): Promise<AnalysisJob[]> {
    try {
      const q = query(
        collection(db, 'cv_analysis_jobs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const jobs: AnalysisJob[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        jobs.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || undefined,
        } as AnalysisJob);
      });
      
      return jobs;
    } catch (error) {
      console.error('❌ Error obteniendo jobs del usuario:', error);
      return [];
    }
  }
}
