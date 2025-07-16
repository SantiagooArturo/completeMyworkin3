'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, CreditCard, Clock } from 'lucide-react';
import { CV_PACKAGES, CVPackage } from '@/services/cvReviewService';

interface CVPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (packageId: string) => Promise<void>;
  userEmail?: string;
  loading?: boolean;
}

export default function CVPricingModal({ 
  isOpen, 
  onClose, 
  onSelectPackage, 
  userEmail,
  loading = false 
}: CVPricingModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);

  if (!isOpen) return null;
  const handleSelectPackage = async (packageId: string) => {
    if (processingPayment) return;
    
    setSelectedPackage(packageId);
    setProcessingPayment(true);
    
    try {
      // Simulación de pago exitoso
      const selectedPkg = CV_PACKAGES.find(pkg => pkg.id === packageId);
      if (!selectedPkg) {
        throw new Error('Paquete no encontrado');
      }

      // Simular delay de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulación de pago exitoso - llamar a la función del padre
      await onSelectPackage(packageId);
      
      // Mostrar mensaje de éxito
      alert(`¡Pago exitoso! Has adquirido ${selectedPkg.reviews} revisiones de CV.`);
      
    } catch (error) {
      console.error('Error selecting package:', error);
      alert('Error al procesar el pago. Por favor, intenta nuevamente.');
    } finally {
      setProcessingPayment(false);
      setSelectedPackage('');
    }
  };

  const getPackageFeatures = (pkg: CVPackage) => {
    const features = [
      `${pkg.reviews} revisión${pkg.reviews > 1 ? 'es' : ''} de CV con IA`,
      'Análisis detallado de fortalezas y debilidades',
      'Sugerencias específicas de mejora',
      'Optimización para ATS (sistemas de seguimiento)',
      'Feedback personalizado por industria'
    ];

    if (pkg.reviews >= 3) {
      features.push('Seguimiento de progreso entre revisiones');
    }

    if (pkg.reviews >= 6) {
      features.push('Consulta prioritaria');
      features.push('Templates exclusivos de CV');
    }

    return features;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Elige tu Plan de Revisión de CV
              </h2>
              <p className="text-gray-600 mt-1">
                Mejora tu CV con análisis profesional potenciado por IA
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              disabled={processingPayment}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Mensaje de información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Clock className="text-blue-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-blue-900">¿Ya usaste tu revisión gratuita?</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Cada usuario puede revisar 1 CV gratuitamente. Para más revisiones, elige uno de nuestros planes.
                </p>
              </div>
            </div>
          </div>

          {/* Planes de precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CV_PACKAGES.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  pkg.popular ? 'border-[#028bbf] shadow-md' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#028bbf] text-white px-3 py-1">
                      <Star size={12} className="mr-1" />
                      Más Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {pkg.name}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-[#028bbf]">
                      S/ {pkg.price}
                    </span>
                    <span className="text-gray-600 text-sm ml-1">
                      / {pkg.reviews} revisión{pkg.reviews > 1 ? 'es' : ''}
                    </span>
                  </div>
                  {pkg.reviews > 1 && (
                    <div className="text-sm text-gray-500">
                      S/ {(pkg.price / pkg.reviews).toFixed(2)} por revisión
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {getPackageFeatures(pkg).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPackage(pkg.id)}
                    disabled={processingPayment}
                    className={`w-full mt-6 ${
                      pkg.popular 
                        ? 'bg-[#028bbf] hover:bg-[#027ba8] text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >                    {processingPayment && selectedPackage === pkg.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Procesando con MercadoPago...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center space-x-1 bg-blue-500 px-2 py-1 rounded text-xs">
                          <span>💳</span>
                          <span>MP</span>
                        </div>
                        <span>Pagar S/ {pkg.price}</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">¿Qué incluye cada revisión?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Análisis completo de contenido y estructura</li>
              <li>• Optimización para palabras clave específicas del puesto</li>
              <li>• Mejoras en formato y diseño visual</li>
              <li>• Compatibilidad con sistemas ATS</li>
              <li>• Reporte detallado con feedback actionable</li>
            </ul>
          </div>          {/* Métodos de pago */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Pagos seguros procesados por:</p>
            <div className="flex justify-center items-center space-x-6 bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MP</span>
                </div>
                <span className="text-sm font-medium text-gray-700">MercadoPago</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">💳 Tarjetas</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">🏦 Bancos</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              🔒 Transacciones seguras y encriptadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
