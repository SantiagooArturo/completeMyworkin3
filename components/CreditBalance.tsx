'use client';

import React, { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Plus, AlertCircle } from 'lucide-react';
import CreditPurchaseModal from './CreditPurchaseModal';
import { useAuth } from '@/hooks/useAuth';

interface CreditBalanceProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export default function CreditBalance({ 
  className = '', 
  variant = 'compact' 
}: CreditBalanceProps) {
  const { user } = useAuth();
  const { credits, loading, error } = useCredits(user);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  if (!user || loading) {
    return null;
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-500">Error cargando créditos</span>
      </div>
    );
  }

  const isLowCredits = credits < 3;
  const badgeVariant = isLowCredits ? 'destructive' : credits < 5 ? 'outline' : 'default';

  if (variant === 'compact') {
    return (
      <>
        <div className={`flex items-center space-x-2 ${className}`}>
          <Badge variant={badgeVariant} className="flex items-center space-x-1">
            <Coins className="h-3 w-3" />
            <span>{credits} créditos</span>
          </Badge>
          {isLowCredits && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPurchaseModal(true)}
              className="h-6 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>

        {showPurchaseModal && (
          <CreditPurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            user={user}
            onSuccess={() => setShowPurchaseModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`flex items-center justify-between p-4 border rounded-lg ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Coins className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">Balance de Créditos</p>
            <p className="text-sm text-gray-600">
              {credits} crédito{credits !== 1 ? 's' : ''} disponible{credits !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={badgeVariant} className="text-lg px-3 py-1">
            {credits}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Comprar</span>
          </Button>
        </div>
        
        {isLowCredits && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Tienes pocos créditos. ¡Recarga para seguir usando nuestras herramientas!
              </p>
            </div>
          </div>
        )}
      </div>

      {showPurchaseModal && (
        <CreditPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          user={user}
          onSuccess={() => setShowPurchaseModal(false)}
        />
      )}
    </>
  );
}
