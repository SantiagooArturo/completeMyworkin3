'use client';

import { Crown, CheckCircle, AlertTriangle, Plus, Zap } from 'lucide-react';
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
  const getStatusColor = () => {
    if (!userStats.freeReviewUsed) return 'text-green-600';
    if (userStats.remainingReviews > 0) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (!userStats.freeReviewUsed) return <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
    if (userStats.remainingReviews > 0) return <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />;
    return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />;
  };

  const getStatusText = () => {
    if (!userStats.freeReviewUsed) return 'Revisión gratuita disponible';
    if (userStats.remainingReviews > 0) return `${userStats.remainingReviews} revisiones disponibles`;
    return 'Sin revisiones disponibles';
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Info */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm sm:text-base font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </h3>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    {userStats.totalReviews}
                  </div>
                  <div className="text-xs text-gray-500">Realizadas</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    {userStats.remainingReviews + (!userStats.freeReviewUsed ? 1 : 0)}
                  </div>
                  <div className="text-xs text-gray-500">Disponibles</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          {!userStats.canUseService && (
            <div className="flex-shrink-0">
              <Button 
                onClick={onPurchaseClick}
                size="sm"
                className="w-full sm:w-auto bg-[#028bbf] hover:bg-[#027ba8] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Comprar Revisiones
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
