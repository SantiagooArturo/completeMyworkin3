import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('💾 === GUARDANDO ENTREVISTA EN FIREBASE ===');
    
    const { userId, interviewData } = await request.json();
    console.log('📝 Datos recibidos:', { userId, jobTitle: interviewData?.jobTitle });

    if (!userId || !interviewData) {
      return NextResponse.json(
        { error: 'User ID and interview data are required' },
        { status: 400 }
      );
    }

    // Preparar documento para Firebase siguiendo el mismo patrón que CVs
    const interviewDoc = {
      userId,
      jobTitle: interviewData.jobTitle,
      questions: interviewData.questions || [],
      totalScore: interviewData.totalScore || 0,
      creditsUsed: 0, // Actualmente gratuito
      status: 'completed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Guardar en Firebase usando la misma estructura que CVs
    const docRef = await addDoc(collection(db, 'userInterviews'), interviewDoc);
    
    console.log('✅ Entrevista guardada en Firebase con ID:', docRef.id);
    console.log('🆓 Entrevista gratuita - no se descontaron créditos');

    return NextResponse.json({ 
      success: true, 
      interviewId: docRef.id,
      message: 'Entrevista completada y guardada exitosamente (modo gratuito)'
    });

  } catch (error: any) {
    console.error('❌ Error saving interview:', error);
    
    return NextResponse.json(
      { error: 'Failed to save interview: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Obtener entrevistas del usuario desde Firebase, mismo patrón que CVs
    const { 
      collection, 
      query, 
      where, 
      orderBy, 
      getDocs 
    } = await import('firebase/firestore');

    const interviewsQuery = query(
      collection(db, 'userInterviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const interviewsSnapshot = await getDocs(interviewsQuery);
    const interviews = interviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir Timestamp a Date para serialización
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));

    console.log(`📊 Encontradas ${interviews.length} entrevistas para usuario ${userId}`);

    return NextResponse.json({ interviews });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
