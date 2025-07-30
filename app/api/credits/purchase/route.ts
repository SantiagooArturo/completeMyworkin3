import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { CreditService } from '@/services/creditService';
import { CREDIT_CONFIG, CreditPackage } from '@/types/credits';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  }
});

const payment = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { packageId, userId, paymentData } = body;    // Validar que el paquete existe
    const creditPackage = CREDIT_CONFIG.CREDIT_PACKAGES.find((p: CreditPackage) => p.id === packageId);
    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Paquete de créditos no válido' },
        { status: 400 }
      );
    }    console.log('🔄 Procesando compra de créditos:', {
      packageId,
      userId,
      amount: creditPackage.price,
      credits: creditPackage.credits + (creditPackage.bonusCredits || 0)
    });

    // Crear el pago con MercadoPago
    const paymentResponse = await payment.create({
      body: {
        transaction_amount: creditPackage.price,
        token: paymentData.token,
        description: `${creditPackage.name} - ${creditPackage.credits + (creditPackage.bonusCredits || 0)} créditos`,
        installments: paymentData.installments || 1,
        payment_method_id: paymentData.payment_method_id,
        payer: paymentData.payer,
        metadata: {
          user_id: userId,
          package_id: packageId,
          credits_amount: creditPackage.credits + (creditPackage.bonusCredits || 0),
          package_name: creditPackage.name
        }
      }
    });

    console.log('✅ Pago de créditos procesado:', {
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail
    });    // Si el pago fue aprobado, agregar los créditos
    if (paymentResponse.status === 'approved') {
      try {
        const result = await CreditService.processApprovedCreditPurchase(
          userId,
          packageId,
          paymentResponse.id?.toString() || '',
          creditPackage.price
        );
        
        if (result.success) {
          console.log('✅ Créditos agregados exitosamente para usuario:', userId);
        } else {
          console.error('❌ Error agregando créditos:', result.error);
        }
      } catch (creditError) {
        console.error('❌ Error agregando créditos:', creditError);
        console.error('❌ Error de pago en MercadoPago:', paymentResponse.status_detail);

        // Aún devolvemos el resultado del pago, pero logeamos el error
        // El webhook puede manejar la adición de créditos como respaldo
      }
    }

    return NextResponse.json({
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
      payment_method_id: paymentResponse.payment_method_id,
      transaction_amount: paymentResponse.transaction_amount,
      credits_added: paymentResponse.status === 'approved' ? creditPackage.credits + (creditPackage.bonusCredits || 0) : 0
    });

  } catch (error) {
    console.error('❌ Error procesando compra de créditos:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la compra',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
