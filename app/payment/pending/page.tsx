'use client';

import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from 'react-day-picker';

export default function PaymentPending() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl text-yellow-900">Pago pendiente</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme la transacción.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#028bbf] hover:bg-[#027ba8]"
            >
              Ir al Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/analizar-cv')}
              className="w-full"
            >
              Volver al análisis de CV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
