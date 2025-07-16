import { db } from '../firebase/config';
import { User as AuthUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { UserCVProfile, cvReviewService } from './cvReviewService';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  university?: string;
  location?: string;
  phone?: string;
  bio?: string;
  photoURL?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  cvAnalyzesUsed: number;
  cvAnalyzesTotal: number; // El "pool" total que el usuario tuvo/tiene (usadas + restantes)
  cvAnalyzesRemaining: number; // Cuántas le quedan realmente
  subscriptionType: 'free' | 'premium' | string; // 'premium' si tiene paquetes activos con revisiones
  // Otros campos que puedas tener para estadísticas generales
  cvsCreated?: number;
  applicationsSent?: number;
  trainingsCompleted?: number;
}

export class UserService {
  private static USERS_COLLECTION = 'users';
  private static USER_STATS_COLLECTION = 'userStats';

  /**
   * Obtiene el perfil completo del usuario
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      throw error;
    }
  }

  /**
   * Crea o actualiza el perfil del usuario
   */
  static async updateUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(db, this.USERS_COLLECTION, uid);
      const userDoc = await getDoc(userDocRef);

      const updateData = {
        ...profileData,
        updatedAt: new Date(),
      };

      if (userDoc.exists()) {
        // Actualizar perfil existente
        await updateDoc(userDocRef, updateData);
      } else {
        // Crear nuevo perfil
        await setDoc(userDocRef, {
          uid,
          ...updateData,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error al actualizar el perfil del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas del usuario
   */
  public static async getUserStats(user: AuthUser): Promise<UserStats> {
    try {
      const profile: UserCVProfile = await cvReviewService.getUserProfile(user);

      const usedFreeReview = profile.freeReviewUsed;
      const purchasedReviewsRemaining = profile.remainingReviews > 0 ? profile.remainingReviews : 0; // Asegurar que no sea negativo si no hay ilimitado

      let actualCvAnalyzesRemaining = purchasedReviewsRemaining;
      if (!usedFreeReview) {
        actualCvAnalyzesRemaining += 1; // Añadir la gratuita si no se ha usado
      }

      const actualCvAnalyzesUsed = profile.totalReviews;
      const actualCvAnalyzesTotal = actualCvAnalyzesUsed + actualCvAnalyzesRemaining;

      let actualSubscriptionType: 'free' | 'premium' = 'free';
      if (
        profile.purchasedPackages &&
        profile.purchasedPackages.some(
          (pkg: {
        status: string;
        reviewsRemaining: number;
        reviewsIncluded: number;
          }) =>
        pkg.status === 'approved' &&
        (pkg.reviewsRemaining > 0 || pkg.reviewsIncluded === -1)
        )
      ) {
        // Considerar un paquete ilimitado (reviewsIncluded === -1) como premium
        // y si tiene revisiones restantes de un paquete finito.
        actualSubscriptionType = 'premium';
        if (
          profile.purchasedPackages.some(
        (pkg: {
          status: string;
          reviewsRemaining: number;
          reviewsIncluded: number;
        }) =>
          pkg.status === 'approved' && pkg.reviewsIncluded === -1
          )
        ) {
          // Si es ilimitado, las restantes podrían ser un número muy alto o un string "Ilimitadas"
          // Por ahora, la UI del perfil maneja números. Si es ilimitado, podrías poner un número grande.
          // O modificar la UI para mostrar "Ilimitadas".
          // Para este ejemplo, si es ilimitado, remainingReviews podría ser un proxy (ej. 999) desde cvReviewService.
        }
      } else if (purchasedReviewsRemaining > 0) {
        actualSubscriptionType = 'premium';
      }


      // Aquí puedes agregar la lógica para obtener otras estadísticas si es necesario
      // const otherStats = await getOtherUserStats(user.uid);

      return {
        cvAnalyzesUsed: actualCvAnalyzesUsed,
        cvAnalyzesTotal: actualCvAnalyzesTotal,
        cvAnalyzesRemaining: actualCvAnalyzesRemaining,
        subscriptionType: actualSubscriptionType,
        // cvsCreated: otherStats?.cvsCreated || 0, // Ejemplo
        // applicationsSent: otherStats?.applicationsSent || 0, // Ejemplo
        // trainingsCompleted: otherStats?.trainingsCompleted || 0, // Ejemplo
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Devolver un estado por defecto o lanzar el error
      return {
        cvAnalyzesUsed: 0,
        cvAnalyzesTotal: 0,
        cvAnalyzesRemaining: 0,
        subscriptionType: 'free',
      };
    }
  }

  /**
   * Actualiza las estadísticas del usuario
   */
  static async updateUserStats(uid: string, stats: Partial<UserStats>): Promise<void> {
    try {
      const statsDocRef = doc(db, this.USER_STATS_COLLECTION, uid);

      await updateDoc(statsDocRef, {
        ...stats,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error al actualizar las estadísticas del usuario:', error);
      throw error;
    }
  }
  /**
   * Incrementa el uso de análisis de CV
   */
  static async incrementCVAnalysis(user: AuthUser): Promise<boolean> {
    try {
      const stats = await this.getUserStats(user);

      if (stats.cvAnalyzesUsed >= stats.cvAnalyzesTotal) {
        return false; // No tiene análisis disponibles
      }

      // Usar cvReviewService para consumir una revisión
      await cvReviewService.consumeReview(user);

      return true;
    } catch (error) {
      console.error('Error al incrementar el uso de análisis:', error);
      throw error;
    }
  }

  /**
   * Busca usuarios por universidad
   */
  static async getUsersByUniversity(university: string): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('university', '==', university)
      );

      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile);
      });

      return users;
    } catch (error) {
      console.error('Error al buscar usuarios por universidad:', error);
      throw error;
    }
  }
  /**
   * Verifica si el usuario puede realizar un análisis de CV
   */
  static async canAnalyzeCV(user: AuthUser): Promise<boolean> {
    try {
      const stats = await this.getUserStats(user);
      return stats.cvAnalyzesUsed < stats.cvAnalyzesTotal;
    } catch (error) {
      console.error('Error al verificar disponibilidad de análisis:', error);
      return false;
    }
  }

  /**
   * Busca un usuario por email y retorna su UID
   */
  static async getUserByEmail(email: string): Promise<string | null> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('email', '==', email)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }

      return null;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }  /**
   * Añade análisis adicionales al usuario (compra) - acepta UID o email
   */
  static async addCVAnalyses(userIdOrEmail: string, amount: number): Promise<void> {
    try {
      let uid = userIdOrEmail;

      // Si parece ser un email, buscar el UID
      if (userIdOrEmail.includes('@')) {
        const foundUid = await this.getUserByEmail(userIdOrEmail);
        if (!foundUid) {
          throw new Error(`Usuario con email ${userIdOrEmail} no encontrado`);
        }
        uid = foundUid;
      }

      // Este método se usa principalmente para compras, por lo que actualiza directamente
      // las estadísticas sin depender de cvReviewService
      const statsDocRef = doc(db, this.USER_STATS_COLLECTION, uid);
      const statsDoc = await getDoc(statsDocRef);
      
      let currentTotal = 0;
      if (statsDoc.exists()) {
        currentTotal = statsDoc.data().cvAnalyzesTotal || 0;
      }

      await this.updateUserStats(uid, {
        cvAnalyzesTotal: currentTotal + amount,
      });

      console.log(`✅ Añadidos ${amount} análisis al usuario ${userIdOrEmail}`);
    } catch (error) {
      console.error('Error al añadir análisis adicionales:', error);
      throw error;
    }
  }
}
