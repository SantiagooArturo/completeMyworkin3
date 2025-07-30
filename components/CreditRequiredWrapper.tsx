'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { ToolType } from '@/types/credits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, AlertCircle, CreditCard, Zap } from 'lucide-react';
import CreditPurchaseModal from './CreditPurchaseModal';
import Link from 'next/link';

interface CreditRequiredWrapperProps {
  children: React.ReactNode;
  tool: ToolType;
  description?: string;
  onCreditConsumed?: () => void;
  className?: string;
}

export default function CreditRequiredWrapper({
  children,
  tool,
  description,
  onCreditConsumed,
  className = ''
}: CreditRequiredWrapperProps) {
  const { user } = useAuth();
  const { credits, loading, hasEnoughCredits, consumeCredits, refreshCredits } = useCredits(user);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);
  const [hasConsumedCredits, setHasConsumedCredits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toolNames = {
        'cv-adapt': 'Adaptación de CV',

    'cv-review': 'Análisis de CV',
    'job-match': 'Match de CV con empleos',
    'cv-creation': 'Creación de CV',
    'interview-simulation': 'Simulación de Entrevistas'
  };

  const toolIcons = {
    'cv-adapt': '📄',

    'cv-review': '📄',
    'job-match': '🎯',
    'cv-creation': '✨',
    'interview-simulation': '🎤'
  };

  const handleConsumeCredits = async () => {
    if (!user || hasConsumedCredits) return;

    setIsConsuming(true);
    setError(null);

    try {
      const success = await consumeCredits(tool, description);
      
      if (success) {
        setHasConsumedCredits(true);
        onCreditConsumed?.();
      } else {
        setError('No tienes suficientes créditos para usar esta herramienta');
      }
    } catch (error) {
      console.error('Error consuming credits:', error);
      setError('Error al procesar los créditos. Inténtalo de nuevo.');
    } finally {
      setIsConsuming(false);
    }
  };

  const handlePurchaseSuccess = () => {
    refreshCredits();
    setShowPurchaseModal(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Acceso Requerido</span>
          </CardTitle>
          <CardDescription>
            Necesitas iniciar sesión para usar esta herramienta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">
              Iniciar Sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (hasConsumedCredits) {
    return <div className={className}>{children}</div>;
  }

  if (!hasEnoughCredits(tool)) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-orange-500" />
              <span>Créditos Insuficientes</span>
            </CardTitle>
            <CardDescription>
              Necesitas 1 crédito para usar {toolNames[tool]}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{toolIcons[tool]}</div>
                <div>
                  <p className="font-medium text-orange-800">{toolNames[tool]}</p>
                  <p className="text-sm text-orange-600">Costo: 1 crédito</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-600">Créditos disponibles</p>
                <p className="text-xl font-bold text-orange-800">{credits}</p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => setShowPurchaseModal(true)}
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Comprar Créditos</span>
              </Button>
              
              <Link href="/credits">
                <Button variant="outline" className="w-full">
                  Ver Mi Balance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <CreditPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          user={user}
          onSuccess={handlePurchaseSuccess}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <span>Confirmar Uso de Crédito</span>
          </CardTitle>
          <CardDescription>
            Esta acción consumirá 1 crédito de tu balance actual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{toolIcons[tool]}</div>
              <div>
                <p className="font-medium text-blue-800">{toolNames[tool]}</p>
                <p className="text-sm text-blue-600">Costo: 1 crédito</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Balance actual</p>
              <p className="text-xl font-bold text-blue-800">{credits} créditos</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleConsumeCredits}
              disabled={isConsuming}
              className="flex items-center space-x-2"
            >
              {isConsuming ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Coins className="h-4 w-4" />
              )}
              <span>
                {isConsuming ? 'Procesando...' : 'Confirmar y Continuar'}
              </span>
            </Button>
            
            <Link href="/credits">
              <Button variant="outline" className="w-full">
                Comprar Más Créditos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Show content only after credits are consumed */}
      <div style={{ display: hasConsumedCredits ? 'block' : 'none' }}>
        {children}
      </div>
    </div>
  );
}
