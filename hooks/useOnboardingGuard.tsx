'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingService } from '@/services/onboardingService';
import { useRouter, usePathname } from 'next/navigation';

export function useOnboardingGuard() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        const completed = await OnboardingService.isOnboardingCompleted(user);
        setOnboardingCompleted(completed);
        
        // Si está en una página protegida y no ha completado el onboarding
        const protectedPaths = ['/dashboard', '/bolsa-trabajo', '/profile', '/match-cv'];
        const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
        
        if (isProtectedPath && !completed && pathname !== '/onboarding') {
          router.push('/onboarding');
          return;
        }
        
        // Si está en onboarding pero ya lo completó
        if (pathname === '/onboarding' && completed) {
          router.push('/dashboard');
          return;
        }
        
      } catch (error) {
        console.error('Error verificando onboarding:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [user, pathname, router]);

  return { isChecking, onboardingCompleted };
}

// Componente wrapper para páginas que requieren onboarding
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isChecking, onboardingCompleted } = useOnboardingGuard();
  
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}
