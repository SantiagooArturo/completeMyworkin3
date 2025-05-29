import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { CV_PACKAGES } from '../../../../config/mercadopago';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, increment, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebase/config';

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

    // Si el pago es exitoso, agregar revisiones al usuario en Firebase
    if (paymentResult.status === 'approved') {
      try {
        console.log('💾 Agregando revisiones al usuario en Firebase...');
        console.log('📋 Datos recibidos:', { userId, userEmail, userName });
        
        // Usar directamente Firestore en lugar de Firebase Admin Auth
        if (!userId) {
          console.error('❌ userId es requerido para agregar revisiones');
          return NextResponse.json({ 
            error: 'userId es requerido para procesar la compra' 
          }, { status: 400 });
        }

        // Agregar revisiones directamente usando Firestore
        console.log('📝 Agregando revisiones directamente a Firestore...');
        
        // Buscar el paquete seleccionado
        const selectedPackage = CV_PACKAGES.find(pkg => pkg.id === packageData.id);
        if (!selectedPackage) {
          console.error('❌ Paquete no encontrado:', packageData.id);
          return NextResponse.json({ 
            error: 'Paquete no encontrado' 
          }, { status: 400 });
        }

        // Crear referencia al perfil del usuario
        const userProfileRef = doc(db, 'userCVProfiles', userId);
        
        // Obtener perfil actual del usuario
        let profile;
        try {
          const profileDoc = await getDoc(userProfileRef);
          if (profileDoc.exists()) {
            profile = profileDoc.data();
          } else {
            // Crear perfil inicial si no existe
            profile = {
              userId: userId,
              email: userEmail,
              freeReviewUsed: false,
              totalReviews: 0,
              remainingReviews: 0,
              purchasedPackages: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userProfileRef, profile);
          }
        } catch (error) {
          console.error('❌ Error obteniendo perfil del usuario:', error);
          return NextResponse.json({ 
            error: 'Error accediendo al perfil del usuario' 
          }, { status: 500 });
        }

        // Crear registro de compra
        const newPurchase = {
          id: paymentResult.id?.toString() || '',
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          reviewsIncluded: selectedPackage.reviews,
          reviewsUsed: 0,
          reviewsRemaining: selectedPackage.reviews,
          price: selectedPackage.price,
          paymentId: paymentResult.id?.toString() || '',
          status: 'approved',
          purchasedAt: Timestamp.now() // Usar Timestamp.now() en lugar de serverTimestamp() dentro de arrays
        };

        // Actualizar el perfil del usuario
        const updatedPackages = [...(profile.purchasedPackages || []), newPurchase];
        
        await updateDoc(userProfileRef, {
          remainingReviews: increment(selectedPackage.reviews),
          totalReviews: increment(selectedPackage.reviews),
          purchasedPackages: updatedPackages,
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ Usuario ${userEmail} actualizado exitosamente: +${packageData.reviews} análisis de CV`);
      } catch (error) {
        console.error('❌ Error procesando pago aprobado:', error);
        console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json({ 
          error: `Error al agregar revisiones: ${error instanceof Error ? error.message : 'Error desconocido'}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      id: paymentResult.id,
      transaction_amount: paymentResult.transaction_amount,
      message: paymentResult.status === 'approved' 
        ? '🎉 Pago exitoso! Se han agregado las revisiones a tu cuenta.'
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