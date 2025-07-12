'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import CVBuilder from './CVBuilder';
import { OnboardingService } from '@/services/onboardingService';
import { cvBuilderService } from '@/services/cvBuilderService';

interface CVBuilderOnboardingProps {
  onComplete?: (cvId: string, cvData: any) => void;
}

export default function CVBuilderOnboarding({ onComplete }: CVBuilderOnboardingProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOnboarding = searchParams.get('from') === 'onboarding';
  
  const [isCreating, setIsCreating] = useState(false);

  const handleCVSaved = async (cvData: any, cvId: string) => {
    if (!user || !isFromOnboarding) return;
    
    try {
      setIsCreating(true);
      
      // Integrar datos del CV al onboarding
      await OnboardingService.integrateCVData(user, cvId, cvData, 'created');
      
      if (onComplete) {
        onComplete(cvId, cvData);
      } else {
        // ✅ CORREGIDO: Redirigir al paso 3 con el CV creado
        router.push(`/onboarding?step=3&cvCreated=true&cvId=${cvId}`);
      }
      
    } catch (error) {
      console.error('Error integrando CV al onboarding:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen">
      {isFromOnboarding && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-blue-900 mb-1">
              Creando tu primer CV
            </h2>
            <p className="text-blue-700">
              Una vez que completes tu CV, continuaremos con tu proceso de onboarding.
            </p>
          </div>
        </div>
      )}
      
      <CVBuilder 
        onSave={handleCVSaved}
        showBackButton={!isFromOnboarding}
        autoRedirect={!isFromOnboarding}
      />
      
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Procesando tu CV</h3>
              <p className="text-gray-600">Integrando la información a tu perfil...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
