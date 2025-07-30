'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Star, CheckCircle, Loader2, Lock, ArrowLeft, Zap, Crown, Gift } from 'lucide-react';
import { CREDIT_CONFIG } from '@/types/credits';
import { useCredits } from '@/hooks/useCredits';
import { User } from 'firebase/auth';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess?: () => void;
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

export default function CreditPurchaseModal({ 
  isOpen, 
  onClose, 
  user, 
  onSuccess 
}: CreditPurchaseModalProps) {
  const { refreshCredits } = useCredits(user || null);
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_CONFIG.CREDIT_PACKAGES[0] | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [userReady, setUserReady] = useState(false);
  const [cardData, setCardData] = useState<CardFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: user?.email || '',
    docType: 'DNI',
    docNumber: ''
  });

  // Actualizar email automáticamente cuando cambie user
  useEffect(() => {
    if (user?.email) {
      setCardData(prev => ({
        ...prev,
        email: user.email!
      }));
    }
  }, [user?.email]);

  // Verificar que el usuario esté completamente cargado
  useEffect(() => {
    if (user && user.uid) {
      setUserReady(true);
      console.log('✅ Usuario listo para compra:', user.email || user.uid);
    } else {
      setUserReady(false);
      console.log('⏳ Esperando datos del usuario...', { user, uid: user?.uid, email: user?.email });
    }
  }, [user]);

  // Debug cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal de créditos abierto. Estado del usuario:', {
        user: user,
        email: user?.email,
        uid: user?.uid,
        displayName: user?.displayName,
        userReady: userReady
      });
    }
  }, [isOpen, user, userReady]);

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
        console.log('✅ MercadoPago SDK inicializado para créditos');
      };
      document.head.appendChild(script);
    }
  }, [isOpen, mpInstance]);

  const handleSelectPackage = (packageData: typeof CREDIT_CONFIG.CREDIT_PACKAGES[0]) => {
    console.log('🔍 Debug usuario en handleSelectPackage:', {
      user: user,
      email: user?.email,
      uid: user?.uid,
      userReady: userReady
    });
    
    if (!user || !user.uid) {
      alert('Por favor, inicia sesión para continuar con la compra');
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
    if (!selectedPackage || !mpInstance || !user) {
      alert('Error: Información incompleta para procesar el pago');
      return;
    }

    setIsLoading(true);
    try {
      console.log('💳 Procesando compra de créditos...');
      
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
      console.log('✅ Token de créditos creado:', token.id);

      // Detectar el tipo de tarjeta del token
      const paymentMethodId = token.payment_method_id || 'visa'; // Fallback a visa si no se detecta
      console.log('💳 Método de pago detectado:', paymentMethodId);

      // Enviar compra a la nueva API de créditos
      console.log('📦 Enviando datos de compra:', {
        packageId: selectedPackage.id,
        userId: user.uid,
        paymentData: {
          token: token.id,
          installments: 1,
          payment_method_id: paymentMethodId
        }
      });

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          userId: user.uid,
          paymentData: {
            token: token.id,
            installments: 1,
            payment_method_id: 'visa', // Se detectará automáticamente
            payer: {
              email: cardData.email,
              identification: {
                type: cardData.docType,
                number: cardData.docNumber
              },
              first_name: cardData.cardholderName.split(' ')[0] || '',
              last_name: cardData.cardholderName.split(' ').slice(1).join(' ') || ''
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const result = await response.json();
      
      if (result.status === 'approved') {
        // Actualizar créditos en el hook
          await refreshCredits();
        
        alert(`¡Compra exitosa! Se han agregado ${result.credits_added} créditos a tu cuenta.`);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.status_detail || 'Pago rechazado');
      }
      
    } catch (error) {
      console.error('Error processing credit purchase:', error);
      alert(`Error al procesar el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPackages = () => {
    setShowCardForm(false);
    setSelectedPackage(null);
  };

  const fillTestCard = () => {
    setCardData(prev => ({
      ...prev,
      cardNumber: '4509 9535 6623 3704',
      expiryDate: '11/25',
      cvv: '123',
      cardholderName: 'APRO',
      docType: 'DNI',
      docNumber: '12345678'
    }));
  };

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'starter': return <Zap className="h-6 w-6" />;
      case 'popular': return <Crown className="h-6 w-6" />;
      case 'premium': return <Gift className="h-6 w-6" />;
      default: return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPackageGradient = (packageId: string) => {
    switch (packageId) {
      case 'starter': return 'from-blue-500 to-blue-600';
      case 'popular': return 'from-purple-500 to-purple-600';
      case 'premium': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  // Si no hay usuario o no está listo, mostrar loading muy brevemente
  if (isOpen && (!user || !user.uid)) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Preparando compra</h3>
          <p className="text-gray-600">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                {showCardForm ? 'Datos de Pago' : 'Comprar Créditos'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {showCardForm 
                  ? `Paquete: ${selectedPackage?.name} - S/ ${selectedPackage?.price}`
                  : 'Elige el paquete que mejor se adapte a tus necesidades'
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
            // Mostrar paquetes de créditos
            <div className="space-y-6">
              {/* Información sobre los créditos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Zap className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-blue-900">¿Cómo funcionan los créditos?</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Cada herramienta (análisis de CV, creación de CV, búsqueda de empleos) consume 1 crédito. 
                      Los créditos no expiran y puedes usarlos cuando quieras.
                    </p>
                  </div>
                </div>
              </div>              <div className="grid md:grid-cols-3 gap-6">
                {CREDIT_CONFIG.CREDIT_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${
                      pkg.popular 
                        ? 'border-[#028bbf] bg-gradient-to-b from-blue-50/50 to-white ring-2 ring-[#028bbf]/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-[#028bbf] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Más Popular
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${getPackageGradient(pkg.id)} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                        {getPackageIcon(pkg.id)}
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-[#028bbf]">S/ {pkg.price}</span>
                      </div>                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{pkg.credits}</span> créditos base
                        {(pkg.bonusCredits || 0) > 0 && (
                          <div className="text-green-600 font-medium">
                            + {pkg.bonusCredits} créditos bonus
                          </div>
                        )}
                        <div className="text-lg font-bold text-gray-900 mt-1">
                          Total: {pkg.credits + (pkg.bonusCredits || 0)} créditos
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 text-center flex-grow">
                      {pkg.description}
                    </p>

                    <div className="space-y-2 mb-6">                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{pkg.credits + (pkg.bonusCredits || 0)} análisis de CV</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{pkg.credits + (pkg.bonusCredits || 0)} creaciones de CV</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{pkg.credits + (pkg.bonusCredits || 0)} búsquedas de empleo</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Sin fecha de expiración</span>
                      </div>
                      {pkg.popular && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Mejor relación precio-valor</span>
                        </div>
                      )}
                    </div>

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
                      Comprar Créditos
                    </button>
                  </div>
                ))}
              </div>

              {/* Información adicional */}
              <div className="bg-gray-50 rounded-lg p-4 mt-8">
                <h3 className="font-medium text-gray-900 mb-3">Ventajas del sistema de créditos:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Flexibilidad total en el uso</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Sin límites de tiempo</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Mejor valor por herramienta</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Acceso a todas las funciones</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Mostrar formulario de tarjeta
            <div className="space-y-6 text-gray-700">
              {/* Información del paquete seleccionado */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedPackage?.name}</h4>
                    <p className="text-sm text-gray-600">{selectedPackage?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#028bbf]">S/ {selectedPackage?.price}</div>                    <div className="text-sm text-gray-600">
                      {selectedPackage?.credits! + (selectedPackage?.bonusCredits || 0)!} créditos
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del usuario */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Facturar a:</h4>
                <p className="text-sm text-gray-600">{user?.displayName || 'Usuario'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
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
                      <option value="PAS">Pasaporte</option>
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
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-yellow-800">🧪 Tarjetas de prueba:</h4>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 text-xs font-medium rounded-md transition-colors"
                    >
                      Usar datos de prueba
                    </button>
                  </div>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <div><strong>Visa (Aprobada):</strong> 4509 9535 6623 3704</div>
                    <div><strong>Mastercard (Aprobada):</strong> 5031 7557 3453 0604</div>
                    <div><strong>CVV:</strong> 123 | <strong>Fecha:</strong> 11/25 | <strong>Nombre:</strong> APRO</div>
                    <div><strong>DNI:</strong> 12345678</div>
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
                Sin suscripciones
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Créditos sin vencimiento
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}
