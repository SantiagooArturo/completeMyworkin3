'use client';
import { CV_PACKAGES, CVPackage } from '../config/mercadopago';
import { User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  increment,
  arrayUnion,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

// ✅ EXPORTAR CV_PACKAGES para que otros archivos puedan importarlo
export { CV_PACKAGES };
export type { CVPackage };

// Tipos para el sistema de revisiones CV
export interface CVResult {
  [x: string]: any;
  score: number;
  summary: string;
  strengths: string[];
  suggestions: string[];
  sections: {
    [key: string]: {
      score: number;
      feedback: string;
    };
  };
}

export interface CVReview {
  id: string;
  userId: string;
  userEmail: string;
  fileName: string;
  fileUrl: string;
  position: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: any;
  completedAt?: any;
  result?: CVResult;
  resultUrl?: string;
  errorMessage?: string;
  paymentId?: string;
  packageType?: '1-review' | '3-reviews' | '6-reviews';
}

export interface UserCVProfile {
  userId: string;
  email: string;
  freeReviewUsed: boolean;
  totalReviews: number;
  remainingReviews: number;
  purchasedPackages: CVPackagePurchase[];
  createdAt: any;
  updatedAt: any;
}

export interface CVPackagePurchase {
  id: string;
  packageId: string;
  packageName: string;
  reviewsIncluded: number;
  reviewsUsed: number;
  reviewsRemaining: number;
  price: number;
  paymentId: string;
  status: 'pending' | 'approved' | 'cancelled';
  purchasedAt: any;
  expiresAt?: any;
}

// Usar paquetes centralizados - eliminando definición local

// Clase para manejar las revisiones de CV
export class CVReviewService {
  private static instance: CVReviewService;
  
  public static getInstance(): CVReviewService {
    if (!CVReviewService.instance) {
      CVReviewService.instance = new CVReviewService();
    }
    return CVReviewService.instance;
  }  // Obtener perfil del usuario con mejor manejo de errores
  async getUserProfile(user: User): Promise<UserCVProfile> {
    try {
      if (!user || !user.uid) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que Firebase esté configurado
      if (!db) {
        throw new Error('Firebase no está configurado correctamente');
      }

      const userProfileRef = doc(db, 'userCVProfiles', user.uid);
      const userProfileDoc = await getDoc(userProfileRef);
        if (userProfileDoc.exists()) {
        const profileData = userProfileDoc.data();
        return { 
          id: userProfileDoc.id, 
          userId: profileData.userId,
          email: profileData.email,
          freeReviewUsed: profileData.freeReviewUsed,
          totalReviews: profileData.totalReviews,
          remainingReviews: profileData.remainingReviews,
          purchasedPackages: profileData.purchasedPackages || [],
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt
        } as UserCVProfile;
      } else {
        // Crear nuevo perfil
        const newProfile: Omit<UserCVProfile, 'id'> = {
          userId: user.uid,
          email: user.email || '',
          freeReviewUsed: false,
          totalReviews: 0,
          remainingReviews: 0,
          purchasedPackages: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userProfileRef, newProfile);
        return { id: user.uid, ...newProfile } as UserCVProfile;
      }
    } catch (error: any) {
      console.error('Error obteniendo perfil de usuario:', error);
      
      // Manejar errores específicos de Firebase
      if (error.code === 'permission-denied') {
        throw new Error('Sin permisos para acceder a los datos del usuario. Verifique que esté autenticado correctamente.');
      } else if (error.code === 'unavailable') {
        throw new Error('Servicio no disponible. Inténtelo más tarde.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Usuario no autenticado. Inicie sesión nuevamente.');
      } else if (error.message.includes('Firebase')) {
        throw new Error('Error de configuración de Firebase. Verifique las credenciales.');
      } else {
        throw new Error(`Error al cargar el perfil del usuario: ${error.message}`);
      }
    }
  }
  // Verificar si el usuario puede hacer una revisión
  async canUserReview(user: User): Promise<{ canReview: boolean; reason: string }> {
    try {
      const profile = await this.getUserProfile(user);
      
      // Si no ha usado su revisión gratuita
      if (!profile.freeReviewUsed) {
        return { canReview: true, reason: 'free_review_available' };
      }
      
      // Si tiene revisiones restantes de paquetes comprados
      if (profile.remainingReviews > 0) {
        return { canReview: true, reason: 'purchased_reviews_available' };
      }
      
      return { 
        canReview: false, 
        reason: 'no_reviews_remaining' 
      };
    } catch (error) {
      console.error('Error verificando permisos de revisión:', error);
      return { canReview: false, reason: 'Error verificando permisos' };
    }
  }

  // Crear una nueva revisión de CV
  async createReview(
    user: User, 
    reviewData: {
      fileName: string;
      position: string;
      status?: 'pending' | 'processing' | 'completed' | 'failed';
      fileUrl?: string;
    }
  ): Promise<string> {
    try {
      const canReview = await this.canUserReview(user);
      if (!canReview.canReview) {
        throw new Error(canReview.reason || 'No tienes permisos para hacer revisiones');
      }

      const review: Omit<CVReview, 'id'> = {
        userId: user.uid,
        userEmail: user.email || '',
        fileName: reviewData.fileName,
        fileUrl: reviewData.fileUrl || '',
        position: reviewData.position,
        status: reviewData.status || 'pending',
        createdAt: serverTimestamp()
      };

      const reviewRef = await addDoc(collection(db, 'cvReviews'), review);
      return reviewRef.id;
    } catch (error) {
      console.error('Error creando revisión:', error);
      throw error;
    }
  }
  // Actualizar resultado de revisión
  async updateReviewResult(
    reviewId: string, 
    updateData: {
      resultUrl?: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      errorMessage?: string;
    }
  ): Promise<void> {
    try {
      const reviewRef = doc(db, 'cvReviews', reviewId);
      const update: any = {
        status: updateData.status,
        updatedAt: serverTimestamp()
      };

      if (updateData.status === 'completed' && updateData.resultUrl) {
        update.resultUrl = updateData.resultUrl;
        update.completedAt = serverTimestamp();
      }

      if (updateData.status === 'failed' && updateData.errorMessage) {
        update.errorMessage = updateData.errorMessage;
      }

      await updateDoc(reviewRef, update);
    } catch (error) {
      console.error('Error actualizando resultado de revisión:', error);
      throw new Error('Error al actualizar la revisión');
    }
  }

  // Actualizar solo el resultado del análisis CV
  async updateReviewAnalysisResult(
    reviewId: string, 
    result: CVResult
  ): Promise<void> {
    try {
      const reviewRef = doc(db, 'cvReviews', reviewId);
      await updateDoc(reviewRef, {
        result: result,
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error actualizando resultado del análisis:', error);
      throw new Error('Error al guardar el resultado del análisis');
    }
  }

  // Consumir una revisión (marcar como usada)
  async consumeReview(user: User): Promise<void> {
    try {
      const profile = await this.getUserProfile(user);
      const userProfileRef = doc(db, 'userCVProfiles', user.uid);
      
      if (!profile.freeReviewUsed) {
        // Marcar revisión gratuita como usada
        await updateDoc(userProfileRef, {
          freeReviewUsed: true,
          totalReviews: increment(1),
          updatedAt: serverTimestamp()
        });
      } else {
        // Usar revisión de paquete comprado
        await updateDoc(userProfileRef, {
          remainingReviews: increment(-1),
          totalReviews: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error consumiendo revisión:', error);
      throw new Error('Error al procesar la revisión');
    }
  }
  // Agregar revisiones compradas al usuario
  async addPurchasedReviews(
    user: User, 
    purchaseData: {
      packageId: string;
      paymentId: string;
      packageName?: string;
      reviewsIncluded?: number;
      price?: number;
    }
  ): Promise<void> {
    try {
      const selectedPackage = CV_PACKAGES.find(pkg => pkg.id === purchaseData.packageId);
      if (!selectedPackage) {
        throw new Error('Paquete no encontrado');
      }

      const userProfileRef = doc(db, 'userCVProfiles', user.uid);
      const profile = await this.getUserProfile(user);

      const newPurchase: CVPackagePurchase = {
        id: purchaseData.paymentId,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        reviewsIncluded: selectedPackage.reviews,
        reviewsUsed: 0,
        reviewsRemaining: selectedPackage.reviews,
        price: selectedPackage.price,
        paymentId: purchaseData.paymentId,
        status: 'approved',
        purchasedAt: serverTimestamp()
      };

      const updatedPackages = [...profile.purchasedPackages, newPurchase];

      await updateDoc(userProfileRef, {
        remainingReviews: increment(selectedPackage.reviews),
        purchasedPackages: updatedPackages,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error agregando revisiones compradas:', error);
      throw new Error('Error al agregar revisiones al usuario');
    }
  }  // Obtener estadísticas simplificadas del usuario para la interfaz
  async getUserStats(user: User): Promise<{
    totalReviews: number;
    remainingReviews: number;
    freeReviewUsed: boolean;
    lastReviewDate?: Date;
    canUseService: boolean;
    nextReviewType: 'free' | 'paid' | 'none';
  }> {
    try {
      const profile = await this.getUserProfile(user);
      
      // Determinar si puede usar el servicio y qué tipo de revisión sería la siguiente
      let canUseService = false;
      let nextReviewType: 'free' | 'paid' | 'none' = 'none';
      
      if (!profile.freeReviewUsed) {
        canUseService = true;
        nextReviewType = 'free';
      } else if (profile.remainingReviews > 0) {
        canUseService = true;
        nextReviewType = 'paid';
      }
      
      // TEMPORAL: Sin orderBy mientras se construye el índice
      let lastReviewDate: Date | undefined;
      try {
        const lastReviewQuery = query(
          collection(db, 'cvReviews'),
          where('userId', '==', user.uid),
          limit(5) // Reducir para mejor performance
        );
        
        const lastReviewSnapshot = await getDocs(lastReviewQuery);
        if (!lastReviewSnapshot.empty) {
          // Ordenar en memoria por fecha de creación
          const reviews = lastReviewSnapshot.docs
            .map(doc => doc.data())
            .filter(review => review.createdAt)
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate() || new Date(0);
              const dateB = b.createdAt?.toDate() || new Date(0);
              return dateB.getTime() - dateA.getTime();
            });
          
          if (reviews.length > 0) {
            lastReviewDate = reviews[0].createdAt.toDate();
          }
        }
      } catch (indexError) {
        console.log('Índice en construcción, saltando fecha de última revisión');
      }

      return {
        totalReviews: profile.totalReviews,
        remainingReviews: profile.remainingReviews,
        freeReviewUsed: profile.freeReviewUsed,
        lastReviewDate,
        canUseService,
        nextReviewType
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalReviews: 0,
        remainingReviews: 0,
        freeReviewUsed: false,
        canUseService: false,
        nextReviewType: 'none'
      };
    }
  }  // Obtener historial de revisiones del usuario
  async getUserReviews(userId: string): Promise<CVReview[]> {
    try {      // Query optimizada para producción
      const reviewsQuery = query(
        collection(db, 'cvReviews'),
        where('userId', '==', userId),
        // Descomentar cuando el índice esté listo en Firebase Console:
        // orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CVReview[];

      // Ordenar en memoria por fecha de creación (más reciente primero)
      const sortedReviews = reviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      return sortedReviews;
    } catch (error) {
      console.error('Error obteniendo revisiones del usuario:', error);
      
      // En producción, propagar el error para que la UI lo maneje
      throw new Error('Error al cargar el historial de revisiones');
    }
  }

  // Actualizar estado de revisión
  async updateReviewStatus(
    reviewId: string, 
    status: CVReview['status'], 
    resultUrl?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const reviewRef = doc(db, 'cvReviews', reviewId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'completed' && resultUrl) {
        updateData.resultUrl = resultUrl;
        updateData.completedAt = serverTimestamp();
      }

      if (status === 'failed' && errorMessage) {
        updateData.errorMessage = errorMessage;
      }

      await updateDoc(reviewRef, updateData);
    } catch (error) {      console.error('Error actualizando estado de revisión:', error);
      throw new Error('Error al actualizar la revisión');
    }
  }

  // Guardar análisis de CV completado en Firebase
  async saveReview(reviewData: {
    userId: string;
    fileName: string;
    fileSize: number;
    status: 'completed';
    result: CVResult;
    createdAt: Date;
    updatedAt: Date;
    position?: string;
    fileUrl?: string;
  }): Promise<string> {
    try {
      // Validar datos requeridos
      if (!reviewData.userId || !reviewData.fileName || !reviewData.result) {
        throw new Error('Datos de revisión incompletos');
      }

      // Crear el objeto de revisión con la estructura correcta
      const review: Omit<CVReview, 'id'> = {
        userId: reviewData.userId,
        userEmail: '', // Se actualizará en el siguiente paso
        fileName: reviewData.fileName,
        fileUrl: reviewData.fileUrl || '',
        position: reviewData.position || 'No especificado',
        status: 'completed',
        createdAt: Timestamp.fromDate(reviewData.createdAt),
        completedAt: Timestamp.fromDate(reviewData.updatedAt),
        result: reviewData.result
      };

      // Obtener email del usuario si está disponible
      try {
        const userProfileRef = doc(db, 'userCVProfiles', reviewData.userId);
        const userProfileDoc = await getDoc(userProfileRef);
        if (userProfileDoc.exists()) {
          review.userEmail = userProfileDoc.data().email || '';
        }
      } catch (profileError) {
        console.warn('No se pudo obtener el email del usuario:', profileError);
      }

      // Guardar la revisión en Firebase
      const reviewRef = await addDoc(collection(db, 'cvReviews'), review);
      
      console.log('✅ Análisis de CV guardado exitosamente:', reviewRef.id);
      return reviewRef.id;

    } catch (error) {
      console.error('Error guardando análisis de CV:', error);
      throw new Error(`Error al guardar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

// Exportar instancia singleton
export const cvReviewService = CVReviewService.getInstance();
