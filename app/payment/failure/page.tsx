'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


export default function PaymentFailure() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">Pago fallido</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            No se pudo procesar tu pago. Puedes intentar nuevamente o contactar al soporte.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/analizar-cv')}
              className="w-full bg-[#028bbf] hover:bg-[#027ba8]"
            >
              Intentar nuevamente
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Ir al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

