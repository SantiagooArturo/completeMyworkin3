'use client';

import React, { useState } from 'react';
import { X, CreditCard, Star, CheckCircle, Loader2 } from 'lucide-react';
import { CV_PACKAGES } from '@/config/mercadopago';

interface CVPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export default function CVPaymentModal({ isOpen, onClose, userEmail, userName }: CVPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePayment = async (packageData: typeof CV_PACKAGES[0]) => {
    if (!userEmail || !userName) {
      alert('Por favor, inicia sesión para continuar con el pago');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          title: packageData.name,
          price: packageData.price,
          quantity: 1,
          userId: userEmail, // Usamos email como identificador
          revisions: packageData.reviews,
          userEmail: userEmail
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la preferencia de pago');
      }

      const preference = await response.json();
      
      // Redirigir a MercadoPago (usar sandbox en desarrollo)
      const checkoutUrl = process.env.NODE_ENV === 'production' 
        ? preference.init_point 
        : preference.sandbox_init_point;
        
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(`Error al procesar el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Análisis de CV Premium</h3>
            <p className="text-sm text-gray-500 mt-1">Elige el plan que mejor se adapte a tus necesidades</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>        {/* Contenido */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {CV_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative border rounded-xl p-5 flex flex-col transition-all duration-200 hover:shadow-md ${
                  pkg.popular 
                    ? 'border-[#028bbf] bg-gradient-to-b from-blue-50/50 to-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#028bbf] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-[#028bbf]">S/ {pkg.price}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{pkg.reviews}</span> análisis incluido{pkg.reviews > 1 ? 's' : ''}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6 text-center flex-grow">{pkg.description}</p>

                <button
                  onClick={() => handlePayment(pkg)}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? 'bg-[#028bbf] hover:bg-[#027ba8] text-white shadow-sm'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {isLoading ? 'Procesando...' : 'Seleccionar Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-center gap-x-8 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Pago 100% seguro
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Resultados instantáneos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}