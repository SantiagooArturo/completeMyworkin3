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
  runTransaction,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase/config';
import { 
  CreditAccount, 
  CreditTransaction, 
  CreditPackage, 
  ToolType, 
  CREDIT_CONFIG 
} from '../types/credits';

export class CreditService {
  private static CREDIT_ACCOUNTS_COLLECTION = 'creditAccounts';
  private static CREDIT_TRANSACTIONS_COLLECTION = 'creditTransactions';

  /**
   * Obtiene la cuenta de créditos del usuario
   */
  static async getCreditAccount(user: User): Promise<CreditAccount> {
    try {
      const accountDoc = await getDoc(doc(db, this.CREDIT_ACCOUNTS_COLLECTION, user.uid));
      
      if (accountDoc.exists()) {
        const data = accountDoc.data();
        return {
          userId: user.uid,
          credits: data.credits || 0,
          totalEarned: data.totalEarned || 0,
          totalSpent: data.totalSpent || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };      } else {
        // Crear cuenta nueva con crédito de bienvenida
        const newAccount: CreditAccount = {
          userId: user.uid,
          credits: CREDIT_CONFIG.WELCOME_CREDITS,
          totalEarned: CREDIT_CONFIG.WELCOME_CREDITS,
          totalSpent: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
          await this.createCreditAccount(newAccount);
        
        // Registrar transacción de crédito de bienvenida
        await addDoc(collection(db, this.CREDIT_TRANSACTIONS_COLLECTION), {
          userId: user.uid,
          type: 'bonus',
          amount: CREDIT_CONFIG.WELCOME_CREDITS,
          description: 'Crédito de bienvenida para nuevos usuarios',
          createdAt: serverTimestamp()
        });
        
        return newAccount;
      }
    } catch (error) {
      console.error('Error obteniendo cuenta de créditos:', error);
      throw new Error('No se pudo obtener la información de créditos');
    }
  }

  /**
   * Crea una nueva cuenta de créditos
   */
  private static async createCreditAccount(account: CreditAccount): Promise<void> {
    try {
      await setDoc(doc(db, this.CREDIT_ACCOUNTS_COLLECTION, account.userId), {
        credits: account.credits,
        totalEarned: account.totalEarned,
        totalSpent: account.totalSpent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creando cuenta de créditos:', error);
      throw error;
    }
  }

  /**
   * Verifica si el usuario tiene suficientes créditos para usar una herramienta
   */
  static async hasEnoughCredits(user: User, tool: ToolType): Promise<boolean> {
    try {
      const account = await this.getCreditAccount(user);
      const requiredCredits = CREDIT_CONFIG.TOOL_COSTS[tool];
      return account.credits >= requiredCredits;
    } catch (error) {
      console.error('Error verificando créditos:', error);
      return false;
    }
  }

  /**
   * Consume créditos para usar una herramienta
   */  static async consumeCredits(
    user: User, 
    tool: ToolType, 
    description?: string
  ): Promise<{ success: boolean; remainingCredits: number; message: string }> {
    try {
      const requiredCredits = CREDIT_CONFIG.TOOL_COSTS[tool];
      
      // Log de depuración
      console.log('CreditService.consumeCredits:', { 
        tool, 
        requiredCredits, 
        toolCosts: CREDIT_CONFIG.TOOL_COSTS,
        user: user.uid 
      });
      
      if (requiredCredits === undefined) {
        throw new Error(`Costo no definido para la herramienta: ${tool}`);
      }
      
      return await runTransaction(db, async (transaction) => {
        const accountRef = doc(db, this.CREDIT_ACCOUNTS_COLLECTION, user.uid);
        const accountDoc = await transaction.get(accountRef);
        
        if (!accountDoc.exists()) {
          throw new Error('Cuenta de créditos no encontrada');
        }
        
        const currentCredits = accountDoc.data().credits || 0;
        
        if (currentCredits < requiredCredits) {
          return {
            success: false,
            remainingCredits: currentCredits,
            message: CREDIT_CONFIG.MESSAGES.INSUFFICIENT_CREDITS
          };
        }
        
        const newCredits = currentCredits - requiredCredits;
        
        // Actualizar cuenta
        transaction.update(accountRef, {
          credits: newCredits,
          totalSpent: increment(requiredCredits),
          updatedAt: serverTimestamp()
        });
        
        // Crear transacción
        const transactionRef = doc(collection(db, this.CREDIT_TRANSACTIONS_COLLECTION));
        transaction.set(transactionRef, {
          userId: user.uid,
          type: 'spend',
          amount: requiredCredits,
          tool: tool,
          description: description || `Uso de herramienta: ${tool}`,
          createdAt: serverTimestamp()
        });
        
        return {
          success: true,
          remainingCredits: newCredits,
          message: CREDIT_CONFIG.MESSAGES.TOOL_SUCCESS
        };
      });
    } catch (error) {
      console.error('Error consumiendo créditos:', error);
      throw new Error('No se pudieron descontar los créditos');
    }
  }

  /**
   * Agrega créditos a la cuenta del usuario (compra)
   */
  static async addCredits(
    user: User,
    amount: number,
    paymentId: string,
    packageId: string,
    description?: string
  ): Promise<{ success: boolean; newBalance: number }> {
    try {
      return await runTransaction(db, async (transaction) => {
        const accountRef = doc(db, this.CREDIT_ACCOUNTS_COLLECTION, user.uid);
        const accountDoc = await transaction.get(accountRef);
        
        let currentCredits = 0;
        let totalEarned = 0;
        
        if (accountDoc.exists()) {
          const data = accountDoc.data();
          currentCredits = data.credits || 0;
          totalEarned = data.totalEarned || 0;
        }
        
        const newCredits = currentCredits + amount;
        const newTotalEarned = totalEarned + amount;
        
        // Actualizar o crear cuenta
        if (accountDoc.exists()) {
          transaction.update(accountRef, {
            credits: newCredits,
            totalEarned: newTotalEarned,
            updatedAt: serverTimestamp()
          });
        } else {
          transaction.set(accountRef, {
            credits: newCredits,
            totalEarned: newTotalEarned,
            totalSpent: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        // Crear transacción
        const transactionRef = doc(collection(db, this.CREDIT_TRANSACTIONS_COLLECTION));
        transaction.set(transactionRef, {
          userId: user.uid,
          type: 'purchase',
          amount: amount,
          description: description || `Compra de ${amount} créditos`,
          paymentId: paymentId,
          packageId: packageId,
          createdAt: serverTimestamp()
        });
        
        return {
          success: true,
          newBalance: newCredits
        };
      });
    } catch (error) {
      console.error('Error agregando créditos:', error);
      throw new Error('No se pudieron agregar los créditos');
    }
  }

  /**
   * Obtiene el historial de transacciones del usuario
   */
  static async getTransactionHistory(
    user: User, 
    limitCount: number = 20
  ): Promise<CreditTransaction[]> {
    try {
      const q = query(
        collection(db, this.CREDIT_TRANSACTIONS_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions: CreditTransaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          tool: data.tool,
          description: data.description,
          paymentId: data.paymentId,
          packageId: data.packageId,
          metadata: data.metadata,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      return transactions;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw new Error('No se pudo obtener el historial de transacciones');
    }
  }

  /**
   * Obtiene estadísticas de uso de créditos por herramienta
   */
  static async getUsageStats(user: User): Promise<Record<ToolType, number>> {
    try {
      const q = query(
        collection(db, this.CREDIT_TRANSACTIONS_COLLECTION),
        where('userId', '==', user.uid),
        where('type', '==', 'spend')
      );
      
      const querySnapshot = await getDocs(q);      const stats: Record<ToolType, number> = {
        'cv-adapt': 0,

        'cv-review': 0,
        'cv-creation': 0,
        'job-match': 0,
        'interview-simulation': 0
      };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tool && stats.hasOwnProperty(data.tool)) {
          stats[data.tool as ToolType] += data.amount || 0;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);      return {
        'cv-adapt': 0,

        'cv-review': 0,
        'cv-creation': 0,
        'job-match': 0,
        'interview-simulation': 0
      };
    }
  }

  /**
   * Verifica si el usuario tiene pocos créditos
   */
  static async shouldShowLowCreditsWarning(user: User): Promise<boolean> {
    try {
      const account = await this.getCreditAccount(user);
      return account.credits <= 2;
    } catch (error) {
      return false;
    }
  }

  /**
   * Procesa la compra de créditos usando MercadoPago
   */
  static async purchaseCredits(
    userId: string,
    packageId: string,
    paymentData: {
      cardToken: string;
      userEmail: string;
      userName: string;
      payerData: {
        email: string;
        identification: {
          type: string;
          number: string;
        };
        first_name: string;
        last_name: string;
      };
    }
  ): Promise<{ success: boolean; error?: string; transactionId?: string }> {
    try {
      // Encontrar el paquete seleccionado
      const selectedPackage = CREDIT_CONFIG.CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        return { success: false, error: 'Paquete no encontrado' };
      }

      // Configurar el pago con MercadoPago
      const paymentPayload = {
        transaction_amount: selectedPackage.price,
        token: paymentData.cardToken,
        description: `Compra de ${selectedPackage.name} - ${selectedPackage.credits + (selectedPackage.bonusCredits || 0)} créditos`,
        installments: 1,
        payment_method_id: 'visa', // Se detectará automáticamente
        payer: {
          email: paymentData.payerData.email,
          identification: {
            type: paymentData.payerData.identification.type,
            number: paymentData.payerData.identification.number
          },
          first_name: paymentData.payerData.first_name,
          last_name: paymentData.payerData.last_name
        },
        metadata: {
          user_id: userId,
          package_id: packageId,
          credits: selectedPackage.credits,
          bonus_credits: selectedPackage.bonusCredits || 0
        }
      };

      // Procesar el pago con MercadoPago
      const response = await fetch('/api/mercadopago/process-credit-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload)
      });

      const paymentResult = await response.json();

      if (!response.ok || paymentResult.status !== 'approved') {
        return { 
          success: false, 
          error: paymentResult.status_detail || 'Error al procesar el pago' 
        };
      }

      // Si el pago fue exitoso, agregar créditos al usuario
      const totalCredits = selectedPackage.credits + (selectedPackage.bonusCredits || 0);
      const user = { uid: userId } as User;

      // Usar transacción para agregar créditos y registrar la compra
      await runTransaction(db, async (transaction) => {
        const accountRef = doc(db, this.CREDIT_ACCOUNTS_COLLECTION, userId);
        const accountDoc = await transaction.get(accountRef);

        let currentCredits = 0;
        if (accountDoc.exists()) {
          currentCredits = accountDoc.data().credits || 0;
        }

        // Actualizar cuenta de créditos
        transaction.set(accountRef, {
          userId,
          credits: currentCredits + totalCredits,
          lastUpdated: serverTimestamp(),
          totalCreditsEarned: increment(totalCredits),
          totalCreditsSpent: accountDoc.exists() ? accountDoc.data().totalCreditsSpent || 0 : 0
        }, { merge: true });

        // Registrar transacción de compra
        const transactionRef = doc(collection(db, this.CREDIT_TRANSACTIONS_COLLECTION));
        transaction.set(transactionRef, {
          userId,
          type: 'purchase',
          amount: totalCredits,
          cost: selectedPackage.price,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          description: `Compra de ${selectedPackage.name}`,
          paymentId: paymentResult.id,
          paymentStatus: paymentResult.status,
          createdAt: serverTimestamp(),
          metadata: {
            baseCredits: selectedPackage.credits,
            bonusCredits: selectedPackage.bonusCredits || 0,
            paymentMethod: 'mercadopago'
          }
        });
      });

      return { 
        success: true, 
        transactionId: paymentResult.id 
      };

    } catch (error) {
      console.error('Error purchasing credits:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }
  /**
   * Procesa una compra de créditos después de que el pago ha sido aprobado (para webhooks)
   */
  static async processApprovedCreditPurchase(
    userId: string,
    packageId: string,
    paymentId: string,
    amount: number
  ): Promise<{ success: boolean; creditsAdded: number; error?: string }> {
    try {      // Encontrar el paquete seleccionado
      const selectedPackage = CREDIT_CONFIG.CREDIT_PACKAGES.find((pkg: CreditPackage) => pkg.id === packageId);
      if (!selectedPackage) {
        return { success: false, creditsAdded: 0, error: 'Paquete no encontrado' };
      }

      const totalCredits = selectedPackage.credits + (selectedPackage.bonusCredits || 0);

      // Usar transacción para agregar créditos y registrar la compra
      await runTransaction(db, async (transaction) => {
        const accountRef = doc(db, this.CREDIT_ACCOUNTS_COLLECTION, userId);
        const accountDoc = await transaction.get(accountRef);

        let currentCredits = 0;
        let totalEarned = 0;
        let totalSpent = 0;

        if (accountDoc.exists()) {
          const data = accountDoc.data();
          currentCredits = data.credits || 0;
          totalEarned = data.totalEarned || 0;
          totalSpent = data.totalSpent || 0;
        }

        // Actualizar cuenta de créditos
        transaction.set(accountRef, {
          userId,
          credits: currentCredits + totalCredits,
          totalEarned: totalEarned + totalCredits,
          totalSpent,
          createdAt: accountDoc.exists() ? accountDoc.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Registrar transacción de compra
        const transactionRef = doc(collection(db, this.CREDIT_TRANSACTIONS_COLLECTION));
        transaction.set(transactionRef, {
          userId,
          type: 'purchase',
          amount: totalCredits,
          toolType: null,
          description: `Compra de ${selectedPackage.name}`,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          paymentId,
          paymentAmount: amount,
          status: 'completed',
          createdAt: serverTimestamp(),
          metadata: {
            baseCredits: selectedPackage.credits,
            bonusCredits: selectedPackage.bonusCredits || 0,
            paymentMethod: 'mercadopago'
          }
        });
      });

      return { 
        success: true, 
        creditsAdded: totalCredits
      };

    } catch (error) {
      console.error('Error processing approved credit purchase:', error);
      return { 
        success: false, 
        creditsAdded: 0,
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  /**
   * Obtiene el historial de compras de créditos del usuario
   */
  static async getPurchaseHistory(userId: string, limitCount: number = 20): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.CREDIT_TRANSACTIONS_COLLECTION),
        where('userId', '==', userId),
        where('type', '==', 'purchase'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const purchases: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        purchases.push({
          id: doc.id,
          credits: data.amount,
          status: data.status || 'completed',
          createdAt: data.createdAt || Timestamp.now(),
          packageName: data.packageName,
          paymentId: data.paymentId,
          paymentAmount: data.paymentAmount
        });
      });
      
      return purchases;
    } catch (error) {
      console.error('Error obteniendo historial de compras:', error);
      return [];
    }
  }

  /**
   * Obtiene el historial de uso de créditos del usuario
   */
  static async getUsageHistory(userId: string, limitCount: number = 20): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.CREDIT_TRANSACTIONS_COLLECTION),
        where('userId', '==', userId),
        where('type', '==', 'spend'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const usage: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usage.push({
          id: doc.id,
          credits: data.amount,
          service: data.tool || data.toolType,
          description: data.description,
          createdAt: data.createdAt || Timestamp.now()
        });
      });
      
      return usage;
    } catch (error) {
      console.error('Error obteniendo historial de uso:', error);
      return [];
    }
  }

  /**
   * NUEVOS MÉTODOS PARA SISTEMA DE RESERVA DE CRÉDITOS
   */

  /**
   * Reserva créditos para usar una herramienta (sin consumirlos aún)
   */
  static async reserveCredits(
    user: User,
    tool: ToolType,
    description?: string
  ): Promise<{ success: boolean; reservationId: string; remainingCredits: number; message: string }> {
    try {
      const requiredCredits = CREDIT_CONFIG.TOOL_COSTS[tool];
      const reservationId = `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return await runTransaction(db, async (transaction) => {
        const accountRef = doc(db, this.CREDIT_ACCOUNTS_COLLECTION, user.uid);
        const accountDoc = await transaction.get(accountRef);
        
        if (!accountDoc.exists()) {
          throw new Error('Cuenta de créditos no encontrada');
        }
        
        const currentCredits = accountDoc.data().credits || 0;
        
        if (currentCredits < requiredCredits) {
          return {
            success: false,
            reservationId: '',
            remainingCredits: currentCredits,
            message: CREDIT_CONFIG.MESSAGES.INSUFFICIENT_CREDITS
          };
        }
        
        // No actualizamos la cuenta aquí, solo registramos la reserva
        // Los créditos siguen disponibles hasta que se confirme la reserva
        
        // Crear transacción de reserva
        const transactionRef = doc(collection(db, this.CREDIT_TRANSACTIONS_COLLECTION));
        transaction.set(transactionRef, {
          userId: user.uid,
          type: 'reserve',
          amount: requiredCredits,
          tool: tool,
          status: 'pending',
          reservationId: reservationId,
          description: description || `Reserva de crédito para: ${tool}`,
          createdAt: serverTimestamp()
        });
        
        return {
          success: true,
          reservationId: reservationId,
          remainingCredits: currentCredits,
          message: 'Créditos reservados exitosamente'
        };
      });
    } catch (error) {
      console.error('Error reservando créditos:', error);
      throw new Error('No se pudieron reservar los créditos');
    }
  }

  /**
   * Confirma una reserva de créditos y los consume definitivamente
   */
  static async confirmCreditReservation(
    user: User,
    reservationId: string,
    tool: ToolType,
    description?: string
  ): Promise<{ success: boolean; remainingCredits: number; message: string }> {
    try {
      const requiredCredits = CREDIT_CONFIG.TOOL_COSTS[tool];
      
      return await runTransaction(db, async (transaction) => {
        // Verificar que la reserva existe y está pendiente
        const reservationQuery = query(
          collection(db, this.CREDIT_TRANSACTIONS_COLLECTION),
          where('userId', '==', user.uid),
          where('reservationId', '==', reservationId),
          where('type', '==', 'reserve'),
          where('status', '==', 'pending')
        );
        
        const reservationSnapshot = await getDocs(reservationQuery);
        
        if (reservationSnapshot.empty) {
          return {
            success: false,
            remainingCredits: 0,
            message: 'Reserva no encontrada o ya procesada'
          };
        }
        
        const accountRef = doc(db, this.CREDIT_ACCOUNTS_COLLECTION, user.uid);
        const accountDoc = await transaction.get(accountRef);
        
        if (!accountDoc.exists()) {
          throw new Error('Cuenta de créditos no encontrada');
        }
        
        const currentCredits = accountDoc.data().credits || 0;
        
        if (currentCredits < requiredCredits) {
          return {
            success: false,
            remainingCredits: currentCredits,
            message: 'Créditos insuficientes para confirmar la reserva'
          };
        }
        
        const newCredits = currentCredits - requiredCredits;
        
        // Actualizar cuenta
        transaction.update(accountRef, {
          credits: newCredits,
          totalSpent: increment(requiredCredits),
          updatedAt: serverTimestamp()
        });
        
        // Marcar reserva como confirmada
        const reservationDoc = reservationSnapshot.docs[0];
        transaction.update(reservationDoc.ref, {
          status: 'confirmed',
          updatedAt: serverTimestamp()
        });
        
        // Crear transacción de confirmación/consumo
        const confirmTransactionRef = doc(collection(db, this.CREDIT_TRANSACTIONS_COLLECTION));
        transaction.set(confirmTransactionRef, {
          userId: user.uid,
          type: 'confirm',
          amount: requiredCredits,
          tool: tool,
          status: 'completed',
          reservationId: reservationId,
          description: description || `Consumo confirmado para: ${tool}`,
          createdAt: serverTimestamp()
        });
        
        return {
          success: true,
          remainingCredits: newCredits,
          message: CREDIT_CONFIG.MESSAGES.TOOL_SUCCESS
        };
      });
    } catch (error) {
      console.error('Error confirmando reserva de créditos:', error);
      throw new Error('No se pudo confirmar la reserva de créditos');
    }
  }

  /**
   * Revierte una reserva de créditos si el servicio externo falló
   */
  static async revertCreditReservation(
    user: User,
    reservationId: string,
    tool: ToolType,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Verificar que la reserva existe y está pendiente
        const reservationQuery = query(
          collection(db, this.CREDIT_TRANSACTIONS_COLLECTION),
          where('userId', '==', user.uid),
          where('reservationId', '==', reservationId),
          where('type', '==', 'reserve'),
          where('status', '==', 'pending')
        );
        
        const reservationSnapshot = await getDocs(reservationQuery);
        
        if (reservationSnapshot.empty) {
          return {
            success: false,
            message: 'Reserva no encontrada o ya procesada'
          };
        }
        
        // Marcar reserva como revertida
        const reservationDoc = reservationSnapshot.docs[0];
        transaction.update(reservationDoc.ref, {
          status: 'reverted',
          updatedAt: serverTimestamp()
        });
        
        // Crear transacción de reversión
        const revertTransactionRef = doc(collection(db, this.CREDIT_TRANSACTIONS_COLLECTION));
        transaction.set(revertTransactionRef, {
          userId: user.uid,
          type: 'revert',
          amount: CREDIT_CONFIG.TOOL_COSTS[tool],
          tool: tool,
          status: 'completed',
          reservationId: reservationId,
          description: reason || `Reserva revertida para: ${tool} - Servicio externo falló`,
          createdAt: serverTimestamp()
        });
        
        return {
          success: true,
          message: 'Reserva revertida exitosamente'
        };
      });
    } catch (error) {
      console.error('Error revirtiendo reserva de créditos:', error);
      throw new Error('No se pudo revertir la reserva de créditos');
    }
  }

  /**
   * Limpia reservas antiguas que no fueron confirmadas ni revertidas (más de 1 hora)
   */
  static async cleanupExpiredReservations(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const expiredReservationsQuery = query(
        collection(db, this.CREDIT_TRANSACTIONS_COLLECTION),
        where('type', '==', 'reserve'),
        where('status', '==', 'pending'),
        where('createdAt', '<=', Timestamp.fromDate(oneHourAgo))
      );
        const expiredSnapshot = await getDocs(expiredReservationsQuery);
      
      const batch = writeBatch(db);
      
      expiredSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'reverted',
          updatedAt: serverTimestamp(),
          description: (doc.data().description || '') + ' - Expirado automáticamente'
        });
      });
      
      if (expiredSnapshot.docs.length > 0) {
        await batch.commit();
        console.log(`Limpiadas ${expiredSnapshot.docs.length} reservas expiradas`);
      }
    } catch (error) {      console.error('Error limpiando reservas expiradas:', error);
    }
  }

  /**
   * Suscribe a cambios en tiempo real de los créditos del usuario
   */
  static subscribeToCredits(userId: string, callback: (credits: number) => void): () => void {
    const accountRef = doc(db, this.CREDIT_ACCOUNTS_COLLECTION, userId);
    
    return onSnapshot(accountRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.credits || 0);
      } else {
        callback(0);
      }
    }, (error) => {
      console.error('Error en suscripción de créditos:', error);
      callback(0);
    });
  }
}
