'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { CV_PACKAGES } from '../../../services/mercadoPagoService';

// Interfaz local para la simulación hasta tener credenciales reales
interface SimulatedPayment {
  id: string;
  amount: number;
  packageId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

function PaymentSimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payment, setPayment] = useState<SimulatedPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const paymentId = searchParams.get('payment_id');
  useEffect(() => {
    const loadPayment = async () => {
      if (!paymentId) {
        router.push('/analizar-cv');
        return;
      }

      try {
        // Simulación local hasta tener credenciales de MercadoPago
        const mockPayment: SimulatedPayment = {
          id: paymentId,
          amount: 15.00,
          packageId: 'cv_basic',
          status: 'pending',
          createdAt: new Date()
        };
        setPayment(mockPayment);
      } catch (error) {
        console.error('Error loading payment:', error);
        router.push('/analizar-cv');
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [paymentId, router]);
  const handleApprovePayment = async () => {
    if (!paymentId) return;
    
    try {
      // Simular aprobación local
      const successUrl = `/payment/success?payment_id=${paymentId}&status=approved`;
      router.push(successUrl);
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const handleRejectPayment = async () => {
    if (!paymentId) return;
    
    try {
      // Simular rechazo local
      const failureUrl = `/payment/failure?payment_id=${paymentId}&status=rejected`;
      router.push(failureUrl);
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>No se encontró información del pago</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const selectedPackage = CV_PACKAGES.find(pkg => pkg.id === payment.packageId);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Simulador de Pago MercadoPago</CardTitle>
          <CardDescription>
            Esta es una simulación para propósitos de desarrollo. En producción serías redirigido a MercadoPago.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información del pago */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Detalles del Pago</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Producto:</span>
                <span className="font-medium">{selectedPackage?.name || 'Paquete desconocido'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cantidad:</span>
                <span className="font-medium">{selectedPackage?.reviews || 0} revisiones</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Precio:</span>
                <span className="font-medium text-lg">S/ {payment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID de Pago:</span>
                <span className="font-mono text-sm">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600 font-medium">Pendiente</span>
                </span>
              </div>
            </div>
          </div>

          {/* Acciones de simulación */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Simular Resultado del Pago</h3>
            <p className="text-sm text-gray-600">
              Elige cómo quieres que termine este pago simulado:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleApprovePayment}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aprobar Pago</span>
              </Button>
              
              <Button
                onClick={handleRejectPayment}
                variant="destructive"
                className="flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar Pago</span>
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Información de Desarrollo</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Este es un simulador para pruebas de desarrollo</li>
              <li>• No se procesará ningún pago real</li>
              <li>• Los datos se guardan localmente en tu navegador</li>
              <li>• En producción, esto sería la interfaz real de MercadoPago</li>
            </ul>
          </div>

          {/* Botón para cancelar */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/analizar-cv')}
              className="text-gray-600"
            >
              Cancelar y Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSimulator() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
      </div>
    }>
      <PaymentSimulatorContent />
    </Suspense>
  );
}
