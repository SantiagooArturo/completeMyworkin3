'use client';

import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CVAccountStatusProps {
  userStats: {
    totalReviews: number;
    remainingReviews: number;
    freeReviewUsed: boolean;
    lastReviewDate?: Date;
    canUseService: boolean;
    nextReviewType: 'free' | 'paid' | 'none';
  };
  onPurchaseClick: () => void;
}

export default function CVAccountStatus({ userStats, onPurchaseClick }: CVAccountStatusProps) {
  const totalAvailable = userStats.remainingReviews + (!userStats.freeReviewUsed ? 1 : 0);

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Status Info - Simplificado */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalAvailable}
              </div>
              <div className="text-sm text-gray-500">
                {totalAvailable === 1 ? 'Revisión disponible' : 'Revisiones disponibles'}
              </div>
            </div>
          </div>

          {/* Action Button - Siempre visible */}
          <div className="flex-shrink-0">
            <Button 
              onClick={onPurchaseClick}
              size="sm"
              className="bg-[#028bbf] hover:bg-[#027ba8] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Comprar Revisiones
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
