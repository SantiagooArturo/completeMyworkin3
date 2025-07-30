// Sistema de créditos para MyWorkIn
// Tipos e interfaces para el nuevo sistema unificado

export interface CreditAccount {
  userId: string;
  credits: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'spend' | 'bonus' | 'refund' | 'reserve' | 'confirm' | 'revert';
  amount: number;
  tool?: 'cv-review' | 'cv-creation' | 'job-match' | 'interview-simulation';
  description: string;
  paymentId?: string;
  packageId?: string;
  status?: 'pending' | 'confirmed' | 'reverted' | 'completed';
  reservationId?: string; // Para vincular reservas, confirmaciones y reversiones
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits?: number;
  description: string;
  features: string[];
  popular?: boolean;
  discount?: number;
}

export interface ToolCost {
  'cv-adapt': number;
  'cv-review': number;
  'cv-creation': number;
  'job-match': number;
  'interview-simulation': number;
}

// Configuración de costos y paquetes
export const CREDIT_CONFIG = {  // Costo por herramienta (en créditos)
  TOOL_COSTS: {
    'cv-adapt': 1,
    'cv-review': 1,
    'cv-creation': 1,
    'job-match': 1,
    'interview-simulation': 1
  } as ToolCost,

  // Cambiar WELCOME_CREDITS de 3 a 1
  WELCOME_CREDITS: 1, // ✅ Ahora los usuarios nuevos empiezan con 1 crédito

  // Paquetes de créditos disponibles
  CREDIT_PACKAGES: [
    {
      id: 'credits_3',
      name: '3 Créditos',
      credits: 3,
      price: 10.00,
      description: 'Perfecto para empezar',
      features: [
        '3 créditos para usar en cualquier herramienta',
        'Válidos por 6 meses',
        'Uso inmediato'
      ]
    },
    {
      id: 'credits_5',
      name: '5 Créditos',
      credits: 5,
      price: 15.00,
      description: 'Más popular - Mejor valor',
      popular: true,
      features: [
        '5 créditos para cualquier herramienta',
        'Válidos por 6 meses',
        'Uso en cualquier herramienta',
        'Mejor relación precio-valor'
      ]
    },
    {
      id: 'credits_10',
      name: '10 Créditos',
      credits: 10,
      price: 20.00,
      description: 'Máximo ahorro por crédito',
      features: [
        '10 créditos al mejor precio',
        'Válidos por 12 meses',
        'Uso ilimitado en herramientas',
        'Máximo ahorro',
        'Mejor precio por crédito'
      ]
    }
  ] as CreditPackage[],

  // Mensajes del sistema
  MESSAGES: {
    INSUFFICIENT_CREDITS: 'No tienes suficientes créditos para usar esta herramienta. Recarga tu cuenta para continuar.',
    PURCHASE_SUCCESS: 'Créditos agregados exitosamente a tu cuenta',
    TOOL_SUCCESS: 'Herramienta utilizada. Se ha descontado 1 crédito de tu cuenta.',
    LOW_CREDITS: 'Te quedan pocos créditos. Considera recargar tu cuenta.',
    WELCOME_CREDITS: '¡Bienvenido! Has recibido 1 crédito gratuito para comenzar.' // ✅ Actualizado el mensaje
  }
};

export type ToolType = keyof ToolCost;
