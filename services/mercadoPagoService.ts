// Configuración de MercadoPago - Usando configuración centralizada
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { UserService } from './userService';
import { CV_PACKAGES, CVPackage, getPackageById } from '../config/mercadopago';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '';

// Configurar cliente de MercadoPago
let client: MercadoPagoConfig | null = null;

// Solo inicializar cliente si tenemos credenciales
if (MP_ACCESS_TOKEN) {
  client = new MercadoPagoConfig({ 
    accessToken: MP_ACCESS_TOKEN,
    options: { timeout: 5000 }
  });
}

export interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface PaymentData {
  userId: string;
  userEmail: string;
  userName: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
}

// Re-exportar CVPackage desde la configuración centralizada
export type { CVPackage } from '../config/mercadopago';
export { CV_PACKAGES } from '../config/mercadopago';

// Clase para manejar pagos con MercadoPago
export class MercadoPagoService {
  private static instance: MercadoPagoService;
  private preference: Preference | null = null;
  
  private constructor() {
    if (client) {
      this.preference = new Preference(client);
    }
  }
  
  public static getInstance(): MercadoPagoService {
    if (!MercadoPagoService.instance) {
      MercadoPagoService.instance = new MercadoPagoService();
    }
    return MercadoPagoService.instance;
  }

  // Verificar si MercadoPago está configurado
  private isConfigured(): boolean {
    return !!(client && this.preference && MP_ACCESS_TOKEN && MP_PUBLIC_KEY);
  }

  // Crear preferencia de pago real
  async createPaymentPreference(paymentData: PaymentData): Promise<PaymentPreference> {
    const selectedPackage = getPackageById(paymentData.packageId);
    if (!selectedPackage) {
      throw new Error(`Paquete ${paymentData.packageId} no encontrado`);
    }

    if (!this.isConfigured()) {
      throw new Error('MercadoPago no está configurado. Faltan las credenciales de acceso.');
    }

    try {
      const preferenceData = {
        items: [
          {
            id: selectedPackage.id,
            title: selectedPackage.name,
            description: selectedPackage.description,
            category_id: 'services',
            quantity: 1,
            unit_price: selectedPackage.price,
            currency_id: paymentData.currency || 'PEN'
          }
        ],
        payer: {
          name: paymentData.userName,
          email: paymentData.userEmail
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/pending`
        },
        auto_return: 'approved' as const,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12
        },
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
        statement_descriptor: 'MyWorkIn CV Review',
        external_reference: `cv_${paymentData.userId}_${Date.now()}`,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      const result = await this.preference!.create({ body: preferenceData });
      
      return {
        id: result.id!,
        init_point: result.init_point!,
        sandbox_init_point: result.sandbox_init_point!
      };
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw new Error('Error al crear la preferencia de pago');
    }
  }

  // Redirigir a checkout de MercadoPago
  redirectToPayment(preference: PaymentPreference): void {
    if (typeof window !== 'undefined') {
      // En producción usar init_point, en desarrollo usar sandbox_init_point
      const checkoutUrl = process.env.NODE_ENV === 'production' 
        ? preference.init_point 
        : preference.sandbox_init_point;
      
      window.location.href = checkoutUrl;
    }
  }

  // Procesar pago completo
  async processPayment(paymentData: PaymentData): Promise<void> {
    try {
      if (!this.isConfigured()) {
        throw new Error('MercadoPago no está configurado. Por favor, configura las credenciales de acceso.');
      }

      const preference = await this.createPaymentPreference(paymentData);
      this.redirectToPayment(preference);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Verificar credenciales de MercadoPago
  static validateCredentials(): boolean {
    return !!(MP_ACCESS_TOKEN && MP_PUBLIC_KEY);
  }

  // Obtener información del estado de configuración
  getConfigurationStatus(): {
    isConfigured: boolean;
    hasAccessToken: boolean;
    hasPublicKey: boolean;
    message: string;
  } {
    const hasAccessToken = !!MP_ACCESS_TOKEN;
    const hasPublicKey = !!MP_PUBLIC_KEY;
    const isConfigured = hasAccessToken && hasPublicKey;

    let message = '';
    if (!isConfigured) {
      if (!hasAccessToken && !hasPublicKey) {
        message = 'Faltan las credenciales de MercadoPago (Access Token y Public Key)';
      } else if (!hasAccessToken) {
        message = 'Falta el Access Token de MercadoPago';
      } else if (!hasPublicKey) {
        message = 'Falta el Public Key de MercadoPago';
      }
    } else {
      message = 'MercadoPago está configurado correctamente';
    }

    return {
      isConfigured,
      hasAccessToken,
      hasPublicKey,
      message
    };
  }
}

// Hook para usar MercadoPago en componentes React
export function useMercadoPago() {
  const mercadoPagoService = MercadoPagoService.getInstance();

  const processPackagePurchase = async (
    userId: string,
    userEmail: string,
    userName: string,
    packageId: string
  ): Promise<void> => {
    const selectedPackage = getPackageById(packageId);
    if (!selectedPackage) {
      throw new Error('Paquete no encontrado');
    }

    const paymentData: PaymentData = {
      userId,
      userEmail,
      userName,
      packageId,
      packageName: selectedPackage.name,
      amount: selectedPackage.price,
      currency: 'PEN'
    };

    await mercadoPagoService.processPayment(paymentData);
  };

  const checkConfiguration = () => {
    return mercadoPagoService.getConfigurationStatus();
  };

  return {
    processPackagePurchase,
    checkConfiguration,
    isConfigured: mercadoPagoService.getConfigurationStatus().isConfigured
  };
}

// Exportar instancia singleton
export const mercadoPagoService = MercadoPagoService.getInstance();
