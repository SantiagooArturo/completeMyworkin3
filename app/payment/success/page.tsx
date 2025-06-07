'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      if (!user) return;
      
      try {
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const externalReference = searchParams.get('external_reference');
        
        console.log('Procesando pago exitoso:', { 
          paymentId, 
          status, 
          externalReference, 
          user: user.email 
        });
        
        if (status === 'approved' && paymentId) {
          // Decodificar external_reference para obtener detalles
          if (externalReference) {
            const decoded = decodeURIComponent(externalReference);
            const [userEmail, revisions, timestamp] = decoded.split('_');
            console.log('Detalles del pago:', { userEmail, revisions, timestamp });
          }
          
          // El webhook debería haber procesado el pago automáticamente
          // Aquí solo confirmamos que todo está bien
          setPaymentProcessed(true);
        } else {
          throw new Error('El pago no fue aprobado');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setError('Error al procesar el pago. Contacta al soporte si el problema persiste.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      processPayment();
    }
  }, [user, searchParams]);

  useEffect(() => {
    // Redirigir después de 5 segundos
    if (paymentProcessed) {
      const timer = setTimeout(() => {
        router.push('/analizar-cv');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentProcessed, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
            <p>Verificando sesión...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="animate-spin h-8 w-8 text-[#028bbf] mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Procesando tu pago...</h2>
            <p className="text-gray-600">Por favor espera mientras confirmamos tu compra.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error en el pago</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              onClick={() => router.push('/analizar-cv')}
              className="bg-[#028bbf] hover:bg-[#027ba8]"
            >
              Volver a intentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">¡Pago exitoso!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Tu compra se ha procesado correctamente. Las revisiones han sido agregadas a tu cuenta.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/analizar-cv')}
              className="w-full bg-[#028bbf] hover:bg-[#027ba8]"
            >
              Analizar CV ahora
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Ir al Dashboard
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Serás redirigido automáticamente en 5 segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
            <p>Cargando...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
