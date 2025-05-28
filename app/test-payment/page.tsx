'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CV_PACKAGES } from '@/config/mercadopago';

export default function TestPayment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (pkg: typeof CV_PACKAGES[0]) => {
    if (!user) {
      alert('Debes estar logueado para comprar');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pkg.name,
          price: pkg.price,
          quantity: 1,
          userId: user.uid,
          revisions: pkg.reviews,
          userEmail: user.email
        })
      });

      const data = await response.json();
      
      if (data.init_point) {
        // En modo sandbox, usar sandbox_init_point
        const checkoutUrl = data.sandbox_init_point || data.init_point;
        window.open(checkoutUrl, '_blank');
      } else {
        throw new Error('No se pudo crear la preferencia de pago');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Prueba de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Debes estar logueado para probar los pagos.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 Prueba de Pagos MercadoPago
        </h1>
          <div className="grid md:grid-cols-3 gap-6">
          {CV_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className={pkg.popular ? 'border-blue-500 border-2' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {pkg.name}
                  {pkg.popular && <Badge variant="secondary">Popular</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold">S/ {pkg.price}</span>
                  <p className="text-gray-600">{pkg.reviews} revisiones</p>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Procesando...' : 'Comprar Ahora'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Información de Prueba:</h3>
          <ul className="text-sm space-y-1">
            <li>• Usuario: {user.email}</li>
            <li>• Modo: Sandbox (pruebas)</li>
            <li>• Webhook: {process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💳 Tarjetas de Prueba MercadoPago:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Visa:</strong> 4170068810108020</p>
            <p><strong>Mastercard:</strong> 5031755734530604</p>
            <p><strong>CVV:</strong> 123 | <strong>Vencimiento:</strong> 11/25</p>
            <p><strong>Nombre:</strong> APRO (aprobado) | CONT (rechazado)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
