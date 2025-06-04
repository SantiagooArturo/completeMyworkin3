import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'test-key'
  }
});

const payment = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔄 Procesando pago de créditos:', {
      amount: body.transaction_amount,
      description: body.description,
      userId: body.metadata?.user_id
    });

    // Crear el pago con MercadoPago
    const paymentResponse = await payment.create({
      body: {
        transaction_amount: body.transaction_amount,
        token: body.token,
        description: body.description,
        installments: body.installments,
        payment_method_id: body.payment_method_id,
        payer: body.payer,
        metadata: body.metadata
      }
    });

    console.log('✅ Pago de créditos procesado:', {
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail
    });

    return NextResponse.json({
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
      payment_method_id: paymentResponse.payment_method_id,
      transaction_amount: paymentResponse.transaction_amount
    });

  } catch (error) {
    console.error('❌ Error procesando pago de créditos:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar el pago',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
