'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Componente que protege rutas que requieren autenticación
 */
export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo actuar si ya terminó la carga del estado de auth
    if (!loading) {
      if (requireAuth && !user) {
        console.log('🛡️ AuthGuard: Redirigiendo a login - usuario no autenticado');
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        // Si no requiere auth pero hay usuario, redirigir al dashboard
        console.log('🛡️ AuthGuard: Usuario ya autenticado, redirigiendo al dashboard');
        router.push('/dashboard');
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Mostrar loading mientras se verifica el estado
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si requiere auth pero no hay usuario, no renderizar nada (se redirigirá)
  if (requireAuth && !user) {
    return null;
  }

  // Si no requiere auth pero hay usuario, no renderizar nada (se redirigirá)
  if (!requireAuth && user) {
    return null;
  }

  // Renderizar children si las condiciones se cumplen
  return <>{children}</>;
}
