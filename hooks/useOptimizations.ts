import { useState, useEffect, useMemo } from 'react';
import { PerformanceUtils } from '@/lib/performance/optimizations';

/**
 * Hook para lazy loading optimizado con preload
 */
export function useLazyLoad<T>(
  importFunc: () => Promise<T>,
  options: {
    preload?: boolean;
    fallback?: T;
    retryAttempts?: number;
    retryDelay?: number;
  } = {}
) {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    preload = false,
    fallback = null,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const loadComponent = useMemo(() => 
    PerformanceUtils.throttle(async (attempt = 1) => {
      setLoading(true);
      setError(null);

      try {
        const module = await importFunc();
        setComponent(module);
      } catch (err) {
        const error = err as Error;
        
        if (attempt < retryAttempts) {
          setTimeout(() => loadComponent(attempt + 1), retryDelay * attempt);
        } else {
          setError(error);
          if (fallback) setComponent(fallback);
        }
      } finally {
        setLoading(false);
      }
    }, 100), [importFunc, retryAttempts, retryDelay, fallback]
  );

  useEffect(() => {
    if (preload) {
      loadComponent();
    }
  }, [preload, loadComponent]);

  return {
    component,
    loading,
    error,
    load: loadComponent,
    retry: () => loadComponent(1)
  };
}

/**
 * Hook para cache optimizado
 */
export function useOptimizedCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: {
    ttl?: number;
    staleWhileRevalidate?: boolean;
    errorRetryCount?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    ttl = 5 * 60 * 1000, // 5 minutos
    staleWhileRevalidate = true,
    errorRetryCount = 3
  } = options;

  const fetchData = useMemo(() => 
    PerformanceUtils.memoize(async (retryCount = 0) => {
      // Verificar cache primero
      const cachedData = PerformanceUtils.getCache(key);
      
      if (cachedData && !staleWhileRevalidate) {
        setData(cachedData);
        return cachedData;
      }

      if (cachedData && staleWhileRevalidate) {
        setData(cachedData); // Mostrar datos stale inmediatamente
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        PerformanceUtils.setCache(key, result, ttl);
        setData(result);
        return result;
      } catch (err) {
        const error = err as Error;
        
        if (retryCount < errorRetryCount) {
          // Retry con backoff exponencial
          setTimeout(() => fetchData(retryCount + 1), Math.pow(2, retryCount) * 1000);
        } else {
          setError(error);
          // Si hay datos stale, mantenerlos
          if (!cachedData) setData(null);
        }
      } finally {
        setLoading(false);
      }
    }, () => `${key}_${Date.now()}`), 
    [key, fetcher, ttl, staleWhileRevalidate, errorRetryCount]
  );

  const invalidateCache = () => {
    PerformanceUtils.setCache(key, null, 0);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate: invalidateCache
  };
}

/**
 * Hook para debounced search optimizado
 */
export function useOptimizedSearch<T>(
  searchFunc: (query: string) => Promise<T[]>,
  options: {
    debounceMs?: number;
    minQueryLength?: number;
    maxResults?: number;
    cacheResults?: boolean;
  } = {}
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxResults = 50,
    cacheResults = true
  } = options;

  const debouncedSearch = useMemo(() =>
    PerformanceUtils.debounce(async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults([]);
        return;
      }

      const cacheKey = `search_${searchQuery}`;
      
      if (cacheResults) {
        const cached = PerformanceUtils.getCache(cacheKey);
        if (cached) {
          setResults(cached.slice(0, maxResults));
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunc(searchQuery);
        const limitedResults = searchResults.slice(0, maxResults);
        
        if (cacheResults) {
          PerformanceUtils.setCache(cacheKey, limitedResults, 5 * 60 * 1000); // 5 min cache
        }
        
        setResults(limitedResults);
      } catch (err) {
        setError(err as Error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [searchFunc, debounceMs, minQueryLength, maxResults, cacheResults]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => setResults([])
  };
}

/**
 * Hook para intersection observer optimizado (lazy loading de imágenes/componentes)
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);
    
    return () => observer.disconnect();
  }, [element, options]);

  return { isIntersecting, setElement };
}

/**
 * Hook para performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 100) {
        console.warn(`⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

/**
 * Hook para gestión de memoria optimizada
 */
export function useMemoryOptimized<T>(
  data: T,
  shouldOptimize: (data: T) => boolean = () => true
) {
  const optimizedData = useMemo(() => {
    if (!shouldOptimize(data)) return data;
    
    // Deep freeze para prevenir mutaciones accidentales
    return Object.freeze(JSON.parse(JSON.stringify(data)));
  }, [data, shouldOptimize]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      // Forzar garbage collection hint
      if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc();
      }
    };
  }, []);

  return optimizedData;
}
