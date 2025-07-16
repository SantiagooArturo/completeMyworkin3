'use client';

import { db } from '@/firebase/config';
import { User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { cvBuilderService, SavedCV } from './cvBuilderService';

export interface UnifiedCV {
  id: string;
  title: string;
  source: 'created' | 'uploaded' | 'analyzed';
  fileName?: string;
  fileUrl?: string;
  cvData?: any;
  createdAt: any;
  updatedAt: any;
  fileSize?: number;
  originalCV?: SavedCV; // Para CVs creados
}

export class UnifiedCVService {
  private static instance: UnifiedCVService;

  public static getInstance(): UnifiedCVService {
    if (!UnifiedCVService.instance) {
      UnifiedCVService.instance = new UnifiedCVService();
    }
    return UnifiedCVService.instance;
  }

  /**
   * Obtiene todos los CVs del usuario (creados, subidos y analizados)
   */
  async getAllUserCVs(user: User): Promise<UnifiedCV[]> {
    if (!user || !user.uid) {
      throw new Error('Usuario no autenticado');
    }

    const allCVs: UnifiedCV[] = [];

    try {
      // 1. Obtener CVs creados con la herramienta
      const createdCVs = await this.getCreatedCVs(user);
      allCVs.push(...createdCVs);

      // 2. Obtener CVs subidos/adjuntados
      const uploadedCVs = await this.getUploadedCVs(user);
      allCVs.push(...uploadedCVs);

      // 3. Obtener CVs de análisis (si tienes esta funcionalidad)
      const analyzedCVs = await this.getAnalyzedCVs(user);
      allCVs.push(...analyzedCVs);

      // Ordenar por fecha de actualización/creación más reciente
      return allCVs.sort((a, b) => {
        const dateA = a.updatedAt?.toDate() || a.createdAt?.toDate() || new Date(0);
        const dateB = b.updatedAt?.toDate() || b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

    } catch (error) {
      console.error('Error obteniendo CVs del usuario:', error);
      throw new Error('Error al cargar los CVs');
    }
  }

  /**
   * Obtiene CVs creados con la herramienta de construcción
   */
  private async getCreatedCVs(user: User): Promise<UnifiedCV[]> {
    try {
      const savedCVs = await cvBuilderService.getUserCVs(user);
      
      return savedCVs.map(cv => ({
        id: `created_${cv.id}`,
        title: cv.title,
        source: 'created' as const,
        cvData: cv.data,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
        originalCV: cv
      }));
    } catch (error) {
      console.warn('Error obteniendo CVs creados:', error);
      return [];
    }
  }

  /**
   * Obtiene CVs subidos/adjuntados del onboarding
   */
  private async getUploadedCVs(user: User): Promise<UnifiedCV[]> {
    try {
      // Buscar en onboarding data
      const onboardingQuery = query(
        collection(db, 'onboarding_data'),
        where('userId', '==', user.uid),
        where('cvSource', '==', 'uploaded')
      );

      const onboardingSnapshot = await getDocs(onboardingQuery);
      const uploadedCVs: UnifiedCV[] = [];

      onboardingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.cvFileUrl && data.cvFileName) {
          uploadedCVs.push({
            id: `uploaded_${doc.id}`,
            title: data.cvFileName.replace(/\.[^/.]+$/, ''), // Remover extensión
            source: 'uploaded',
            fileName: data.cvFileName,
            fileUrl: data.cvFileUrl,
            createdAt: data.createdAt || data.updatedAt,
            updatedAt: data.updatedAt || data.createdAt
          });
        }
      });

      return uploadedCVs;
    } catch (error) {
      console.warn('Error obteniendo CVs subidos:', error);
      return [];
    }
  }

  /**
   * Obtiene CVs de análisis guardados
   */
  private async getAnalyzedCVs(user: User): Promise<UnifiedCV[]> {
    try {
      const reviewsQuery = query(
        collection(db, 'cvReviews'),
        where('userId', '==', user.uid),
        where('status', '==', 'completed'),
        orderBy('createdAt', 'desc')
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      const analyzedCVs: UnifiedCV[] = [];

      reviewsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.fileName && data.fileUrl) {
          analyzedCVs.push({
            id: `analyzed_${doc.id}`,
            title: `${data.fileName.replace(/\.[^/.]+$/, '')} (Analizado)`,
            source: 'analyzed',
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            fileSize: data.fileSize,
            createdAt: data.createdAt,
            updatedAt: data.completedAt || data.createdAt
          });
        }
      });

      return analyzedCVs;
    } catch (error) {
      console.warn('Error obteniendo CVs analizados:', error);
      return [];
    }
  }

  /**
   * Elimina un CV según su fuente
   */
  async deleteCV(cvId: string): Promise<void> {
    const [source, realId] = cvId.split('_', 2);

    switch (source) {
      case 'created':
        return await cvBuilderService.deleteCV(realId);
      
      case 'uploaded':
        // Para CVs subidos, marcar como eliminado en onboarding_data
        // Implementar según tu lógica de negocio
        throw new Error('Eliminación de CVs subidos no implementada');
      
      case 'analyzed':
        // Para CVs analizados, marcar como eliminado en cvReviews
        // Implementar según tu lógica de negocio
        throw new Error('Eliminación de CVs analizados no implementada');
      
      default:
        throw new Error('Tipo de CV no reconocido');
    }
  }

  /**
   * Genera URL de descarga para un CV
   */
  async getDownloadUrl(cvId: string): Promise<string> {
    const [source, realId] = cvId.split('_', 2);

    switch (source) {
      case 'created':
        return await cvBuilderService.generatePDFUrl(realId);
      
      case 'uploaded':
      case 'analyzed':
        // Buscar la URL directa del archivo
        const allCVs = await this.getAllUserCVs({ uid: 'temp' } as User);
        const cv = allCVs.find(c => c.id === cvId);
        if (cv?.fileUrl) {
          return cv.fileUrl;
        }
        throw new Error('URL de CV no encontrada');
      
      default:
        throw new Error('Tipo de CV no reconocido');
    }
  }

  /**
   * Obtiene un CV específico por ID
   */
  async getCV(user: User, cvId: string): Promise<UnifiedCV | null> {
    const allCVs = await this.getAllUserCVs(user);
    return allCVs.find(cv => cv.id === cvId) || null;
  }
}

// Exportar instancia singleton
export const unifiedCVService = UnifiedCVService.getInstance();
