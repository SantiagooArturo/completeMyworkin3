// Configuración centralizada de MercadoPago

// Interfaz para paquetes de CV
export interface CVPackage {
  id: string;
  name: string;
  price: number;
  reviews: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const MERCADOPAGO_CONFIG = {
  // Credenciales (desde variables de entorno)
  ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN!,
  PUBLIC_KEY: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!,
  
  // URLs del sitio
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
  
  // Configuración de pagos
  CURRENCY: 'PEN',
  COUNTRY: 'PE',
    // Paquetes de CV con precios actualizados - FUENTE ÚNICA DE VERDAD
  CV_PACKAGES: [
    {
      id: 'cv_basic',
      name: '1 Revisión',
      price: 4.00,
      reviews: 1,
      description: '1 revisión adicional de CV',
      features: [
        '1 análisis detallado',
        'Recomendaciones específicas',
        'Puntuación mejorada'
      ]
    },
    {
      id: 'cv_premium',
      name: '3 Revisiones',
      price: 7.00,
      reviews: 3,
      description: '3 revisiones de CV - ¡Más Popular!',
      popular: true,
      features: [
        '3 análisis detallados',
        'Recomendaciones específicas',
        'Puntuación mejorada',
        'Soporte por email'
      ]
    },
    {
      id: 'cv_enterprise',
      name: '6 Revisiones',
      price: 10.00,
      reviews: 6,
      description: '6 revisiones de CV - Mejor valor',
      features: [
        '6 análisis detallados',
        'Recomendaciones específicas',
        'Puntuación mejorada',
        'Soporte prioritario',
        'Seguimiento de mejoras'
      ]
    }
  ],
  
  // URLs de retorno
  RETURN_URLS: {
    success: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
    failure: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure`,
    pending: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/pending`
  },
  
  // Webhook URL
  WEBHOOK_URL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
  
  // Configuración de desarrollo
  IS_SANDBOX: process.env.NODE_ENV !== 'production',
  
  // Tarjetas de prueba para sandbox
  TEST_CARDS: {
    VISA_APPROVED: '4170068810108020',
    MASTERCARD_APPROVED: '5031755734530604',
    CVV: '123',
    EXPIRY: '11/25',
    NAMES: {
      APPROVED: 'APRO',
      REJECTED: 'CONT'
    }
  }
};

// Utilidades
export const formatPrice = (price: number): string => {
  return `S/ ${price.toFixed(2)}`;
};

export const getPackageById = (id: string): CVPackage | undefined => {
  return MERCADOPAGO_CONFIG.CV_PACKAGES.find(pkg => pkg.id === id);
};

// Exportar los paquetes directamente para facilitar el acceso
export const CV_PACKAGES = MERCADOPAGO_CONFIG.CV_PACKAGES;

export const validateMercadoPagoConfig = (): { isValid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  if (!MERCADOPAGO_CONFIG.ACCESS_TOKEN) missing.push('MP_ACCESS_TOKEN');
  if (!MERCADOPAGO_CONFIG.PUBLIC_KEY) missing.push('NEXT_PUBLIC_MP_PUBLIC_KEY');
  if (!MERCADOPAGO_CONFIG.SITE_URL) missing.push('NEXT_PUBLIC_SITE_URL');
  
  return {
    isValid: missing.length === 0,
    missing
  };
};
