import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
// import { cvReviewService } from '../../../../services/cvReviewService';
// import { getUserByEmail } from '../../../../lib/firebase-admin';
// import { getAuth } from 'firebase-admin/auth';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN no está configurado');
}

const client = new MercadoPagoConfig({ 
  accessToken: MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

export async function POST(request: NextRequest) {
  try {
    const { packageData, cardToken, userEmail, userName, userId, payerData } = await request.json();

    if (!packageData || !cardToken || !userEmail || !payerData) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    console.log('💳 Procesando pago REAL con MercadoPago...');
    console.log('📦 Paquete:', packageData.name, '- Precio:', packageData.price);
    console.log('👤 Usuario:', userEmail, '- UID:', userId);
    console.log('🔑 Token de tarjeta:', cardToken);

    const payment = new Payment(client);
    
    // Preparar datos del pago REAL
    const paymentData = {
      transaction_amount: Number(packageData.price),
      token: cardToken,
      description: `${packageData.name} - Análisis de CV MyWorkIn`,
      installments: 1,
      payment_method_id: 'visa', // Se detectará automáticamente por el token
      payer: {
        email: payerData.email,
        identification: {
          type: payerData.identification.type,
          number: payerData.identification.number
        },
        first_name: payerData.first_name,
        last_name: payerData.last_name
      },
      external_reference: `cv_${userEmail}_${packageData.reviews}_${Date.now()}`,
      statement_descriptor: 'MyWorkIn CV',
      metadata: {
        package_id: packageData.id,
        user_email: userEmail,
        reviews_count: packageData.reviews
      }
    };

    // PROCESAR PAGO REAL CON MERCADOPAGO
    console.log('🚀 Enviando pago a MercadoPago...');
    const paymentResult = await payment.create({ body: paymentData });
    
    console.log('📋 Respuesta de MercadoPago:', {
      id: paymentResult.id,
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      amount: paymentResult.transaction_amount
    });

    // FIREBASE CODE COMMENTED OUT FOR TESTING
    /*
    // Si el pago es exitoso, agregar revisiones al usuario en Firebase
    if (paymentResult.status === 'approved') {
      try {
        console.log('💾 Agregando revisiones al usuario en Firebase...');
        console.log('📋 Datos recibidos:', { userId, userEmail, userName });
        
        // Buscar el usuario - intentar por UID primero, luego por email
        let user;
        try {
          if (userId) {
            // Si tenemos UID, usarlo directamente
            console.log('🔍 Buscando usuario por UID:', userId);
            user = await getAuth().getUser(userId);
            console.log('✅ Usuario encontrado por UID:', { uid: user.uid, email: user.email });
          } else {
            // Si no tenemos UID, buscar por email
            console.log('🔍 Buscando usuario por email:', userEmail);
            user = await getUserByEmail(userEmail);
            console.log('✅ Usuario encontrado por email:', { uid: user.uid, email: user.email });
          }
        } catch (error) {
          console.error('❌ Error buscando usuario:', error);
          console.error('❌ Detalles del error:', { 
            message: error instanceof Error ? error.message : 'Error desconocido',
            userId, 
            userEmail 
          });
          return NextResponse.json({ 
            error: `Usuario no encontrado en Firebase. UID: ${userId}, Email: ${userEmail}` 
          }, { status: 404 });
        }

        // Agregar revisiones usando cvReviewService
        console.log('📝 Agregando revisiones con cvReviewService...');
        await cvReviewService.addPurchasedReviews(
          { uid: user.uid, email: user.email || userEmail } as any,
          {
            packageId: packageData.id,
            paymentId: paymentResult.id,
            packageName: packageData.name,
            reviewsIncluded: packageData.reviews,
            price: packageData.price
          }
        );
        
        console.log(`✅ Usuario ${userEmail} actualizado exitosamente: +${packageData.reviews} análisis de CV`);
      } catch (error) {
        console.error('❌ Error procesando pago aprobado:', error);
        console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json({ 
          error: `Error al agregar revisiones: ${error instanceof Error ? error.message : 'Error desconocido'}` 
        }, { status: 500 });
      }
    }
    */

    if (paymentResult.status === 'approved') {
      console.log('✅ Pago REAL aprobado por MercadoPago:', paymentResult.id);
      console.log('🔥 FIREBASE CODE COMMENTED OUT - TESTING PAYMENT FLOW ONLY');
    } else {
      console.log('❌ Pago rechazado:', paymentResult.status_detail);
    }

    return NextResponse.json({
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      id: paymentResult.id,
      transaction_amount: paymentResult.transaction_amount,
      message: paymentResult.status === 'approved' 
        ? '🎉 Pago REAL exitoso con MercadoPago! (Firebase deshabilitado para pruebas)'
        : `❌ Pago rechazado: ${paymentResult.status_detail}`
    });

  } catch (error) {
    console.error('❌ Error procesando pago:', error);
    return NextResponse.json(
      { error: `Error al procesar el pago: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
} 