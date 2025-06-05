'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Coins, Zap, FileText, Target, Search } from 'lucide-react';
import CreditPurchaseModal from './CreditPurchaseModal';
import { User } from 'firebase/auth';
import { ToolType } from '@/types/credits';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  toolType: ToolType;
  requiredCredits: number;
  currentCredits: number;
}

const TOOL_LABELS = {
  'cv-review': 'Análisis de CV',
  'cv-creation': 'Creación de CV',
  'job-match': 'Búsqueda de Trabajos'
};

const TOOL_ICONS = {
  'cv-review': FileText,
  'cv-creation': FileText,
  'job-match': Search
};

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  user,
  toolType,
  requiredCredits,
  currentCredits
}: InsufficientCreditsModalProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    onClose();
  };

  const ToolIcon = TOOL_ICONS[toolType];
  const toolLabel = TOOL_LABELS[toolType];
  const missingCredits = requiredCredits - currentCredits;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Créditos Insuficientes</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              No tienes suficientes créditos para usar esta herramienta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Información de la herramienta */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ToolIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800">{toolLabel}</p>
                  <p className="text-sm text-gray-600">Herramienta solicitada</p>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Coins className="h-3 w-3" />
                <span>{requiredCredits} crédito{requiredCredits !== 1 ? 's' : ''}</span>
              </Badge>
            </div>

            {/* Balance actual vs requerido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm text-gray-600">Tienes</p>
                <p className="text-2xl font-bold text-red-500">{currentCredits}</p>
                <p className="text-xs text-gray-500">crédito{currentCredits !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm text-gray-600">Necesitas</p>
                <p className="text-2xl font-bold text-green-500">{requiredCredits}</p>
                <p className="text-xs text-gray-500">crédito{requiredCredits !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Mensaje motivacional */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    ¡Solo necesitas {missingCredits} crédito{missingCredits !== 1 ? 's' : ''} más!
                  </p>
                  <p className="text-sm text-blue-700">
                    Recarga tu cuenta y sigue aprovechando nuestras herramientas de IA.
                  </p>
                </div>
              </div>
            </div>

            {/* Ventajas de recargar */}
            <div className="space-y-2">
              <p className="font-medium text-sm">¿Por qué recargar créditos?</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Acceso inmediato a todas las herramientas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Créditos bonus con paquetes más grandes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Los créditos nunca caducan</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button variant="outline" className='text-gray-800' onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handlePurchaseClick} className="flex items-center space-x-2">
              <Coins className="h-4 w-4" />
              <span>Comprar Créditos</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPurchaseModal && (
        <CreditPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseSuccess}
          user={user}
        />
      )}
    </>
  );
}
