import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('💾 === GUARDANDO ENTREVISTA (MÉTODO SIMPLIFICADO) ===');
    
    const { userId, interviewData } = await request.json();
    console.log('📝 Datos recibidos:', { userId, jobTitle: interviewData?.jobTitle });

    if (!userId || !interviewData) {
      return NextResponse.json(
        { error: 'User ID and interview data are required' },
        { status: 400 }
      );
    }

    // Por ahora, retornamos éxito sin guardar realmente en Firebase
    // El frontend manejará el guardado local temporalmente
    const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    console.log('✅ Entrevista procesada con ID temporal:', interviewId);
    console.log('🆓 Entrevista gratuita - no se descontaron créditos');

    return NextResponse.json({ 
      success: true, 
      interviewId: interviewId,
      message: 'Entrevista completada exitosamente (modo gratuito)'
    });

  } catch (error: any) {
    console.error('❌ Error processing interview:', error);
    
    return NextResponse.json(
      { error: 'Failed to process interview: ' + error.message },
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

    // Por ahora, retornamos un array vacío
    // Más tarde podemos implementar el guardado real
    const interviews: any[] = [];

    return NextResponse.json({ interviews });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
