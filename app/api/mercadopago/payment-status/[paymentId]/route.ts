import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const payment = new Payment(client);

// ✅ Cambiar la función para Next.js 15
export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    // ✅ Await params en Next.js 15
    const { paymentId } = params;
    
    console.log('🔍 Consultando estado del pago:', paymentId);
    
    const paymentResponse = await payment.get({
      id: paymentId
    });
    
    console.log('📊 Estado del pago:', {
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail
    });
    
    return NextResponse.json({
      success: true,
      payment: {
        id: paymentResponse.id,
        status: paymentResponse.status,
        status_detail: paymentResponse.status_detail,
        transaction_amount: paymentResponse.transaction_amount,
        currency_id: paymentResponse.currency_id,
        payment_method_id: paymentResponse.payment_method_id,
        date_created: paymentResponse.date_created,
        date_approved: paymentResponse.date_approved
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error consultando pago:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error consultando el estado del pago',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
