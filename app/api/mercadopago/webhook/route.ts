import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin
if (!getApps().length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log('✅ Firebase Admin inicializado');
    }
  } catch (error) {
    console.error('❌ Error Firebase Admin:', error);
  }
}

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

export async function GET() {
  console.log('✅ Webhook GET - endpoint funcionando');
  return NextResponse.json({
    status: 'Webhook funcionando',
    timestamp: new Date().toISOString(),
    mp_token_configured: !!MP_ACCESS_TOKEN,
    mp_token_preview: MP_ACCESS_TOKEN ? MP_ACCESS_TOKEN.substring(0, 20) + '...' : 'No configurado',
    firebase_apps: getApps().length
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log('🚀 WEBHOOK RECIBIDO:', timestamp);
  console.log('🔑 MP_ACCESS_TOKEN:', MP_ACCESS_TOKEN ? 'Configurado ✅' : 'No configurado ❌');
  
  // ✅ SIEMPRE DEVOLVER 200 - Wrapper principal
  try {
    // Validaciones básicas
    if (!MP_ACCESS_TOKEN) {
      console.error('❌ MP_ACCESS_TOKEN no configurado');
      return NextResponse.json({ 
        success: false,
        error: 'MP_ACCESS_TOKEN faltante',
        timestamp 
      }, { status: 200 }); // ✅ SIEMPRE 200
    }    // Parsear body
    let body;
    try {
      body = await request.json();
      console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      return NextResponse.json({ 
        success: false,
        error: 'JSON inválido',
        timestamp 
      }, { status: 200 }); // ✅ SIEMPRE 200
    }

    // Solo procesar pagos
    if (body.type !== 'payment') {
      console.log(`ℹ️ Tipo ${body.type} ignorado`);
      return NextResponse.json({ 
        success: true,
        received: true, 
        action: 'ignored',
        type: body.type,
        timestamp 
      }, { status: 200 }); // ✅ SIEMPRE 200
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error('❌ Payment ID faltante');
      return NextResponse.json({ 
        success: false,
        error: 'Payment ID faltante',
        timestamp 
      }, { status: 200 }); // ✅ SIEMPRE 200
    }

    console.log('💳 Procesando payment:', paymentId);

    // Obtener datos del pago con mejor manejo de errores
    let paymentData;
    try {
      const apiUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
      console.log('🌐 Consultando:', apiUrl);
      console.log('🔑 Token preview:', MP_ACCESS_TOKEN.substring(0, 30) + '...');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Portal-WorkIn-Webhook/1.0'
        },
        signal: AbortSignal.timeout(15000) // 15 segundos
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response statusText:', response.statusText);      if (response.status === 404) {
        console.log(`⚠️ Payment ${paymentId} no encontrado (404) - Posiblemente pago de prueba o expirado`);
        return NextResponse.json({ 
          success: true, // ✅ Éxito porque se recibió
          received: true,
          warning: 'Payment not found',
          paymentId,
          status: 404,
          message: 'El pago no existe o es de prueba',
          timestamp 
        }, { status: 200 }); // ✅ SIEMPRE 200
      }

      if (response.status === 401) {
        console.error('❌ Token de MercadoPago inválido (401)');
        return NextResponse.json({ 
          success: false,
          received: true,
          error: 'Invalid MP token',
          status: 401,
          timestamp 
        }, { status: 200 }); // ✅ SIEMPRE 200
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error MercadoPago API:');
        console.error('  Status:', response.status);
        console.error('  StatusText:', response.statusText);
        console.error('  Body:', errorText);
        
        return NextResponse.json({ 
          success: false,
          received: true,
          error: 'Error MercadoPago API',
          status: response.status,
          statusText: response.statusText,
          errorDetails: errorText,
          paymentId,
          timestamp 
        }, { status: 200 }); // ✅ SIEMPRE 200
      }

      paymentData = await response.json();
      console.log('💳 Pago obtenido exitosamente:', {
        id: paymentData.id,
        status: paymentData.status,
        external_reference: paymentData.external_reference,
        amount: paymentData.transaction_amount,
        payer_email: paymentData.payer?.email,
        date_created: paymentData.date_created
      });    } catch (fetchError) {
      console.error('❌ Error fetch MercadoPago:', fetchError);
      return NextResponse.json({ 
        success: false,
        received: true,
        error: 'Error conectando con MercadoPago',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown',
        paymentId,
        timestamp 
      }, { status: 200 }); // ✅ SIEMPRE 200
    }

    // Solo procesar pagos aprobados
    if (paymentData.status !== 'approved') {
      console.log(`⚠️ Pago ${paymentId} no aprobado - status: ${paymentData.status}`);
      return NextResponse.json({ 
        success: true, // ✅ Éxito porque se recibió
        received: true, 
        status: paymentData.status, 
        action: 'not_processed',
        paymentId,
        timestamp 
      }, { status: 200 }); // ✅ SIEMPRE 200
    }

    // Procesar pago aprobado
    console.log('✅ Pago aprobado - procesando...');
    const result = await procesarPagoAprobado(paymentData);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ WEBHOOK EXITOSO en ${processingTime}ms`);
    
    return NextResponse.json({
      success: true, // ✅ Éxito total
      received: true,
      status: 'processed',
      user: result.userEmail,
      revisionsAdded: result.revisionsAdded,
      processingTime,
      timestamp
    }, { status: 200 }); // ✅ SIEMPRE 200

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ ERROR WEBHOOK:', error);
    
    // ✅ SIEMPRE devolver 200 para evitar reintentos de MercadoPago
    return NextResponse.json({
      success: false,
      received: true, // ✅ Siempre confirmamos recepción
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp,
      processingTime
    }, { status: 200 }); // ✅ SIEMPRE 200
  }
}

async function procesarPagoAprobado(paymentData: any) {
  const externalReference = paymentData.external_reference || '';
  console.log('🔗 Procesando external_reference:', externalReference);

  if (!externalReference) {
    throw new Error('External reference vacío en los datos del pago');
  }

  // Parsing mejorado del external_reference
  let userId: string;
  let revisions: string;
  let timestamp: string;

  try {
    const parts = externalReference.split('_');
    if (parts.length < 3) {
      throw new Error(`External reference mal formateado (${parts.length} partes): ${externalReference}`);
    }

    timestamp = parts.pop()!;
    revisions = parts.pop()!;
    userId = parts.join('_');

    console.log('📊 Datos parseados:', { 
      userId, 
      revisions, 
      timestamp,
      totalParts: parts.length + 2 
    });

    // Validar que no estén vacíos
    if (!userId || !revisions || !timestamp) {
      throw new Error(`Datos incompletos después del parsing: userId="${userId}", revisions="${revisions}", timestamp="${timestamp}"`);
    }

  } catch (parseError) {
    console.error('❌ Error parsing external_reference:', parseError);
    throw new Error(`Error parsing external_reference: ${parseError instanceof Error ? parseError.message : 'Unknown'}`);
  }

  const revisionsToAdd = parseInt(revisions);
  if (isNaN(revisionsToAdd) || revisionsToAdd <= 0) {
    throw new Error(`Número de revisiones inválido: ${revisions}`);
  }

  // Buscar usuario en Firebase Auth
  const auth = getAuth();
  let user;
  
  try {
    console.log('👤 Buscando usuario:', userId);
    if (userId.includes('@')) {
      user = await auth.getUserByEmail(userId);
      console.log('✅ Usuario encontrado por email:', user.uid);
    } else {
      user = await auth.getUser(userId);
      console.log('✅ Usuario encontrado por UID:', user.uid);
    }
  } catch (userError) {
    console.error('❌ Usuario no encontrado:', userId, userError);
    throw new Error(`Usuario no encontrado en Firebase Auth: ${userId}`);
  }

  // Actualizar Firestore
  const db = getFirestore();
  const userProfileRef = db.collection('userCVProfiles').doc(user.uid);
  
  try {
    console.log('💾 Actualizando perfil en Firestore...');
    const profileDoc = await userProfileRef.get();
    
    const newPackage = {
      id: paymentData.id.toString(),
      packageId: `cv_${revisions}`,
      packageName: `${revisions} Revisión${parseInt(revisions) > 1 ? 'es' : ''}`,
      reviewsIncluded: revisionsToAdd,
      reviewsUsed: 0,
      reviewsRemaining: revisionsToAdd,
      price: paymentData.transaction_amount,
      paymentId: paymentData.id.toString(),
      status: 'approved',
      purchasedAt: new Date(),
      externalReference
    };

    if (!profileDoc.exists) {
      console.log('📝 Creando perfil nuevo...');
      await userProfileRef.set({
        userId: user.uid,
        email: user.email || '',
        freeReviewUsed: false,
        totalReviews: 0,
        remainingReviews: revisionsToAdd,
        purchasedPackages: [newPackage],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Perfil creado exitosamente');
    } else {
      console.log('📝 Actualizando perfil existente...');
      const currentData = profileDoc.data();
      const currentPackages = currentData?.purchasedPackages || [];
      
      // Verificar si ya se procesó este pago
      const existingPayment = currentPackages.find((pkg: any) => pkg.paymentId === paymentData.id.toString());
      if (existingPayment) {
        console.log('⚠️ Pago ya procesado anteriormente, saltando...');
        return { userEmail: user.email, revisionsAdded: 0 };
      }
      
      const newRemainingReviews = (currentData?.remainingReviews || 0) + revisionsToAdd;
      
      await userProfileRef.update({
        remainingReviews: newRemainingReviews,
        purchasedPackages: [...currentPackages, newPackage],
        updatedAt: new Date()
      });
      console.log(`✅ Perfil actualizado - nuevas revisiones: ${newRemainingReviews}`);
    }

    console.log(`✅✅ ÉXITO: +${revisionsToAdd} revisiones agregadas a ${user.email}`);
    
    return {
      userEmail: user.email,
      revisionsAdded: revisionsToAdd
    };

  } catch (firebaseError) {
    console.error('❌ Error crítico actualizando Firestore:', firebaseError);
    throw new Error(`Error de base de datos: ${firebaseError instanceof Error ? firebaseError.message : 'Unknown'}`);
  }
}

export async function OPTIONS(request: NextRequest) {
  console.log('🔧 OPTIONS request recibido');
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}