'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, FileText } from 'lucide-react';
import { getOptimizationSuggestions } from './CVPreview';
import { CVData } from '@/types/cv';

interface PageWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalPages: number;
  cvData: CVData;
}

export default function PageWarningModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  totalPages, 
  cvData 
}: PageWarningModalProps) {
  const suggestions = getOptimizationSuggestions(cvData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-black" />
            CV con múltiples páginas
          </DialogTitle>
          <DialogDescription>
            Tu CV tiene {totalPages} páginas. Te recomendamos mantenerlo en 1 página para puestos junior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="font-medium mb-2">Recomendación para estudiantes y recién graduados:</div>
              <p className="text-sm">
                Los reclutadores prefieren CVs de 1 página para posiciones junior. 
                Un CV conciso demuestra capacidad de síntesis y priorización.
              </p>
            </AlertDescription>
          </Alert>

          {suggestions.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="font-medium mb-2">Sugerencias para optimizar:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {suggestions.slice(0, 4).map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                  {suggestions.length > 4 && (
                    <li className="text-blue-600 font-medium">
                      Y {suggestions.length - 4} sugerencias más...
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto text-black"
          >
            Editar CV
          </Button>
          <Button 
            onClick={onConfirm}
            className="w-full sm:w-auto bg-[#028bbf] hover:bg-[#027ba8]"
          >
            Descargar de todas formas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
