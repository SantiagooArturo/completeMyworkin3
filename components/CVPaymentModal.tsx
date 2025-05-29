'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Star, CheckCircle, Loader2, Lock, ArrowLeft } from 'lucide-react';
import { CV_PACKAGES } from '@/config/mercadopago';

// Declarar MercadoPago global
declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CVPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  userId?: string;
  onPaymentSuccess?: () => void;
}

interface CardFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  email: string;
  docType: string;
  docNumber: string;
}

export default function CVPaymentModal({ isOpen, onClose, userEmail, userName, userId, onPaymentSuccess }: CVPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof CV_PACKAGES[0] | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [cardData, setCardData] = useState<CardFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: userEmail || '',
    docType: 'DNI',
    docNumber: ''
  });

  // Actualizar email automáticamente cuando cambie userEmail
  useEffect(() => {
    if (userEmail) {
      setCardData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, [userEmail]);

  // Inicializar MercadoPago SDK
  useEffect(() => {
    if (isOpen && !mpInstance) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, {
          locale: 'es-PE'
        });
        setMpInstance(mp);
        console.log('✅ MercadoPago SDK inicializado');
      };
      document.head.appendChild(script);
    }
  }, [isOpen, mpInstance]);

  // CÓDIGO ANTERIOR COMENTADO - Redirección a MercadoPago
  /*
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
        },
        body: JSON.stringify({
          title: packageData.name,
          price: packageData.price,
          quantity: 1,
          userId: userEmail,
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
  */

  // NUEVO CÓDIGO - Mostrar formulario de tarjeta
  const handleSelectPackage = (packageData: typeof CV_PACKAGES[0]) => {
    if (!userEmail || !userName) {
      alert('Por favor, inicia sesión para continuar con el pago');
      return;
    }
    
    setSelectedPackage(packageData);
    setShowCardForm(true);
  };

  const handleCardInputChange = (field: keyof CardFormData, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleProcessPayment = async () => {
    if (!selectedPackage || !mpInstance) {
      alert('Error: MercadoPago no está inicializado');
      return;
    }

    setIsLoading(true);
    try {
      console.log('💳 Tokenizando tarjeta con MercadoPago...');
      
      // Preparar datos de la tarjeta para tokenización
      const cardForm = {
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.expiryDate.split('/')[0],
        cardExpirationYear: '20' + cardData.expiryDate.split('/')[1],
        securityCode: cardData.cvv,
        identificationType: cardData.docType,
        identificationNumber: cardData.docNumber
      };

      // Crear token de la tarjeta
      const token = await mpInstance.createCardToken(cardForm);
      console.log('✅ Token creado:', token.id);

      // Enviar token al backend para procesar el pago
      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageData: selectedPackage,
          cardToken: token.id,
          userEmail: userEmail,
          userName: userName,
          userId: userId,
          payerData: {
            email: cardData.email,
            identification: {
              type: cardData.docType,
              number: cardData.docNumber
            },
            first_name: cardData.cardholderName.split(' ')[0] || '',
            last_name: cardData.cardholderName.split(' ').slice(1).join(' ') || ''
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const result = await response.json();
      
      if (result.status === 'approved') {
        alert('¡Pago exitoso! Se han agregado las revisiones a tu cuenta.');
        onClose();
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        throw new Error(result.status_detail || 'Pago rechazado');
      }
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(`Error al procesar el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPackages = () => {
    setShowCardForm(false);
    setSelectedPackage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {showCardForm && (
              <button
                onClick={handleBackToPackages}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {showCardForm ? 'Datos de Pago' : 'Análisis de CV Premium'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {showCardForm 
                  ? `Paquete: ${selectedPackage?.name} - S/ ${selectedPackage?.price}`
                  : 'Elige el plan que mejor se adapte a tus necesidades'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {!showCardForm ? (
            // Mostrar paquetes
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
                    onClick={() => handleSelectPackage(pkg)}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      pkg.popular
                        ? 'bg-[#028bbf] hover:bg-[#027ba8] text-white shadow-sm'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Seleccionar Plan
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Mostrar formulario de tarjeta
            <div className="space-y-6 text-gray-700">
              {/* Información del paquete */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedPackage?.name}</h4>
                    <p className="text-sm text-gray-600">{selectedPackage?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#028bbf]">S/ {selectedPackage?.price}</div>
                    <div className="text-sm text-gray-600">{selectedPackage?.reviews} análisis</div>
                  </div>
                </div>
              </div>

              {/* Información del usuario logueado */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Facturar a:</h4>
                <p className="text-sm text-gray-600">{userName}</p>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>

              {/* Formulario de tarjeta */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Pago seguro con MercadoPago</span>
                </div>

                {/* Número de tarjeta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                  />
                </div>

                {/* Fecha y CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de vencimiento
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardData.expiryDate}
                      onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Nombre del titular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    value={cardData.cardholderName}
                    onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                  />
                </div>

                {/* Documento */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de documento
                    </label>
                    <select
                      value={cardData.docType}
                      onChange={(e) => handleCardInputChange('docType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">CE</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de documento
                    </label>
                    <input
                      type="text"
                      placeholder="12345678"
                      value={cardData.docNumber}
                      onChange={(e) => handleCardInputChange('docNumber', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Botón de pago */}
                <button
                  onClick={handleProcessPayment}
                  disabled={isLoading || !cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardholderName || !cardData.docNumber}
                  className="w-full bg-[#028bbf] hover:bg-[#027ba8] text-white py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {isLoading ? 'Procesando pago...' : `Pagar S/ ${selectedPackage?.price}`}
                </button>

                {/* Tarjetas de prueba */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">🧪 Tarjetas de prueba:</h4>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <div><strong>Visa (Aprobada):</strong> 4509 9535 6623 3704</div>
                    <div><strong>Mastercard (Aprobada):</strong> 5031 7557 3453 0604</div>
                    <div><strong>CVV:</strong> 123 | <strong>Fecha:</strong> 11/25 | <strong>Nombre:</strong> APRO</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showCardForm && (
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
        )}
      </div>
    </div>
  );
}