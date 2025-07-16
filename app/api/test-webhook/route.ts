import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { cvReviewService } from '@/services/cvReviewService';

// Endpoint para probar el proceso de agregar revisiones sin MercadoPago
export async function POST(request: NextRequest) {
  try {
    const { userEmail, revisions } = await request.json();
    
    if (!userEmail || !revisions) {
      return NextResponse.json({ error: 'userEmail y revisions son requeridos' }, { status: 400 });
    }

    console.log('🧪 TEST: Intentando agregar revisiones a:', userEmail);
    
    // Buscar usuario por email
    let user;
    try {
      user = await getAuth().getUserByEmail(userEmail);
      console.log('✅ Usuario encontrado:', user.uid);
    } catch (error) {
      console.error('❌ Usuario no encontrado:', userEmail);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Intentar agregar revisiones
    await cvReviewService.addPurchasedReviews(
      { uid: user.uid, email: user.email || '' } as any,
      {
        packageId: `cv_${revisions}`,
        paymentId: `test_${Date.now()}`,
        packageName: `Test Paquete ${revisions} revisiones`,
        reviewsIncluded: parseInt(revisions),
        price: 0
      }
    );
    
    console.log(`✅ TEST EXITOSO: +${revisions} revisiones agregadas a ${userEmail}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `${revisions} revisiones agregadas exitosamente a ${userEmail}` 
    });

  } catch (error: any) {
    console.error('❌ ERROR EN TEST:', error);
    return NextResponse.json({
      error: 'Error en el test',
      details: error?.message || 'Error desconocido',
      stack: error?.stack
    }, { status: 500 });
  }
}
