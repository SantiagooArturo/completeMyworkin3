import { NextRequest, NextResponse } from 'next/server';
import { adminDb, isAdminInitialized } from '@/firebase/admin-config';

// Verificar si Firebase Admin está inicializado
if (!isAdminInitialized()) {
  console.error('❌ Firebase Admin no está inicializado');
}

export async function GET(request: NextRequest) {
  try {
    // Verificar que Firebase Admin esté inicializado
    if (!isAdminInitialized()) {
      return NextResponse.json(
        { error: 'Firebase Admin no está configurado' },
        { status: 500 }
      );
    }

    // Obtener estadísticas básicas del sistema
    const usersSnapshot = await adminDb.collection('users').count().get();
    const reviewsSnapshot = await adminDb.collection('cv-reviews').count().get();

    return NextResponse.json({
      message: 'Firebase Admin funciona correctamente',
      stats: {
        totalUsers: usersSnapshot.data().count,
        totalReviews: reviewsSnapshot.data().count,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en Firebase Admin API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!isAdminInitialized()) {
      return NextResponse.json(
        { error: 'Firebase Admin no está configurado' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'test-write':
        // Prueba de escritura
        const testDoc = await adminDb.collection('admin-tests').add({
          message: 'Test desde Firebase Admin',
          timestamp: new Date(),
          data: data || {}
        });
        
        return NextResponse.json({
          success: true,
          message: 'Escritura exitosa',
          docId: testDoc.id
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error en Firebase Admin POST:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
