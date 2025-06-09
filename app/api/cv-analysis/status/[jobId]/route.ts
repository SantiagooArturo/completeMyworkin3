import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { jobId } = resolvedParams;

    if (!jobId) {
      return NextResponse.json(
        { error: 'ID de trabajo requerido' },
        { status: 400 }
      );
    }

    // Obtener el trabajo de Firestore
    const jobDoc = await getDoc(doc(db, 'cv_analysis_jobs', jobId));

    if (!jobDoc.exists()) {
      return NextResponse.json(
        { error: 'Trabajo no encontrado' },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();

    // Convertir timestamps para serialización
    const responseData = {
      ...jobData,
      createdAt: jobData.createdAt?.toDate?.()?.toISOString() || jobData.createdAt,
      startedAt: jobData.startedAt?.toDate?.()?.toISOString() || jobData.startedAt,
      completedAt: jobData.completedAt?.toDate?.()?.toISOString() || jobData.completedAt,
    };

    return NextResponse.json({
      success: true,
      job: responseData
    });

  } catch (error) {
    console.error('Error obteniendo estado del trabajo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
