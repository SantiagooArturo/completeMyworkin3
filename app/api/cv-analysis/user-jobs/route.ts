import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limitCount = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Consultar trabajos del usuario ordenados por fecha de creación
    const jobsQuery = query(
      collection(db, 'cv_analysis_jobs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(jobsQuery);
    const jobs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        startedAt: data.startedAt?.toDate?.()?.toISOString() || data.startedAt,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt,
      };
    });

    return NextResponse.json({
      success: true,
      jobs
    });

  } catch (error) {
    console.error('Error obteniendo trabajos del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
