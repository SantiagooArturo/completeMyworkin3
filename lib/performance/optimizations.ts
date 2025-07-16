/**
 * Configuraciones de optimización de performance para MyWorkIn
 */

// Configuración de Cache
export const CACHE_CONFIG = {
  // Cache para análisis de CV (5 minutos)
  CV_ANALYSIS: {
    ttl: 5 * 60 * 1000, // 5 minutos en ms
    maxSize: 100, // máximo 100 análisis en cache
  },
  
  // Cache para sugerencias de skills (30 minutos)
  SKILLS_SUGGESTIONS: {
    ttl: 30 * 60 * 1000, // 30 minutos
    maxSize: 50,
  },
  
  // Cache para templates de CV (1 hora)
  CV_TEMPLATES: {
    ttl: 60 * 60 * 1000, // 1 hora
    maxSize: 20,
  },
  
  // Cache para datos de usuario (15 minutos)
  USER_DATA: {
    ttl: 15 * 60 * 1000, // 15 minutos
    maxSize: 200,
  }
};

// Configuración de Rate Limiting
export const RATE_LIMIT_CONFIG = {
  // Límites para APIs de IA
  AI_APIS: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 requests por ventana
    message: 'Demasiadas solicitudes de IA. Intenta en 15 minutos.',
  },
  
  // Límites para generación de PDF
  PDF_GENERATION: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 5, // 5 PDFs por ventana
    message: 'Límite de generación de PDF alcanzado. Intenta en 5 minutos.',
  },
  
  // Límites generales para APIs
  GENERAL_API: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // 30 requests por minuto
    message: 'Demasiadas solicitudes. Intenta en un minuto.',
  }
};

// Configuración de Bundle Optimization
export const BUNDLE_CONFIG = {
  // Chunks principales
  chunks: {
    vendor: ['react', 'react-dom', 'next'],
    ui: ['@headlessui/react', '@heroicons/react'],
    firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
    pdf: ['jspdf', 'html2canvas'],
  },
    // Archivos para lazy loading
  lazyComponents: [
    'CVPreview',
    'CVAnalysisModal',
    'PaymentModal',
    'PricingCards',
  ],
  
  // Assets para optimización
  images: {
    quality: 85,
    formats: ['webp', 'avif'],
    sizes: [640, 750, 828, 1080, 1200, 1920],
  }
};

// Configuración de Database
export const DB_CONFIG = {
  // Configuración de Firestore
  firestore: {
    // Índices recomendados
    indexes: [
      { collection: 'cvs', fields: ['userId', 'createdAt'] },
      { collection: 'cvs', fields: ['userId', 'status'] },
      { collection: 'analyses', fields: ['cvId', 'type'] },
      { collection: 'payments', fields: ['userId', 'status'] },
    ],
    
    // Configuración de caché offline
    cache: {
      size: 40 * 1024 * 1024, // 40MB
      tabSynchronization: true,
    },
  },
  
  // Configuración de consultas
  queries: {
    // Límites de paginación
    pagination: {
      default: 10,
      max: 50,
    },
    
    // Timeouts
    timeout: 10000, // 10 segundos
  }
};

// Configuración de Monitoring
export const MONITORING_CONFIG = {
  // Métricas de performance
  performance: {
    // Core Web Vitals thresholds
    lcp: 2.5, // Largest Contentful Paint (segundos)
    fid: 100, // First Input Delay (ms)
    cls: 0.1, // Cumulative Layout Shift
    
    // API response time thresholds
    apiResponseTime: {
      fast: 200, // ms
      acceptable: 1000, // ms
      slow: 3000, // ms
    },
  },
  
  // Configuración de logging
  logging: {
    levels: {
      development: ['error', 'warn', 'info', 'debug'],
      production: ['error', 'warn'],
    },
    
    // Sampling para logs de alto volumen
    sampling: {
      info: 0.1, // 10% de logs info
      debug: 0.01, // 1% de logs debug
    },
  },
  
  // Alertas
  alerts: {
    errorRate: 0.05, // 5% error rate threshold
    responseTime: 5000, // 5 segundos
    memoryUsage: 0.9, // 90% memoria
  }
};

// Utilidades de Performance
export class PerformanceUtils {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * Cache simple en memoria con TTL
   */
  static setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Limpiar cache expirado cada 5 minutos
    if (this.cache.size > 100) {
      this.cleanExpiredCache();
    }
  }

  static getCache(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private static cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Debounce para funciones que se ejecutan frecuentemente
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle para limitar ejecuciones
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Memoización para funciones costosas
   */
  static memoize<T extends (...args: any[]) => any>(
    func: T,
    keyGen?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = keyGen ? keyGen(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  /**
   * Lazy loading de componentes
   */
  static createLazyComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ) {
    const React = require('react');
    return React.lazy(importFunc);
  }

  /**
   * Measure performance de funciones
   */
  static async measurePerformance<T>(
    name: string,
    func: () => Promise<T> | T
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await func();
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ Performance [${name}]: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ Performance Error [${name}]: ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  }
}
