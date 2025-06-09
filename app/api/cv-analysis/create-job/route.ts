import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Función simple para generar UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface CVAnalysisJob {
  id: string;
  userId: string;
  userEmail: string;
  pdfUrl: string;
  position: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: any;
  startedAt?: any;
  completedAt?: any;
  progress: number;
  result?: any;
  error?: string;
  estimatedTimeRemaining?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, pdfUrl, position } = body;

    if (!userId || !userEmail || !pdfUrl || !position) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: userId, userEmail, pdfUrl, position' },
        { status: 400 }
      );
    }    // Generar ID único para el trabajo
    const jobId = generateUUID();
    
    // Crear el trabajo en Firestore
    const jobData: CVAnalysisJob = {
      id: jobId,
      userId,
      userEmail,
      pdfUrl,
      position,
      status: 'pending',
      createdAt: serverTimestamp(),
      progress: 0
    };

    await setDoc(doc(db, 'cv_analysis_jobs', jobId), jobData);

    // Iniciar el procesamiento asíncrono
    await startAsyncAnalysis(jobId, pdfUrl, position);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Trabajo de análisis creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando trabajo de análisis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}

async function startAsyncAnalysis(jobId: string, pdfUrl: string, position: string) {
  try {
    // Actualizar estado a processing
    await setDoc(doc(db, 'cv_analysis_jobs', jobId), {
      status: 'processing',
      startedAt: serverTimestamp(),
      progress: 10,
      estimatedTimeRemaining: 60 // 60 segundos estimados
    }, { merge: true });

    // Realizar la llamada al API externo en segundo plano
    const apiUrl = `https://myworkin-cv.onrender.com/analizar-cv?pdf_url=${encodeURIComponent(pdfUrl)}&puesto_postular=${encodeURIComponent(position)}`;
    
    // Configurar timeout más largo para procesamiento en background
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos

    try {
      // Actualizar progreso
      await setDoc(doc(db, 'cv_analysis_jobs', jobId), {
        progress: 30,
        estimatedTimeRemaining: 45
      }, { merge: true });

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      // Actualizar progreso
      await setDoc(doc(db, 'cv_analysis_jobs', jobId), {
        progress: 80,
        estimatedTimeRemaining: 10
      }, { merge: true });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch {
        result = { rawResponse: text };
      }

      // Completar el trabajo exitosamente
      await setDoc(doc(db, 'cv_analysis_jobs', jobId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        progress: 100,
        result,
        estimatedTimeRemaining: 0
      }, { merge: true });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Marcar como fallido
      await setDoc(doc(db, 'cv_analysis_jobs', jobId), {
        status: 'failed',
        completedAt: serverTimestamp(),
        progress: 0,
        error: String(fetchError),
        estimatedTimeRemaining: 0
      }, { merge: true });
    }

  } catch (error) {
    console.error('Error en procesamiento asíncrono:', error);
    
    // Marcar como fallido
    await setDoc(doc(db, 'cv_analysis_jobs', jobId), {
      status: 'failed',
      completedAt: serverTimestamp(),
      progress: 0,
      error: String(error),
      estimatedTimeRemaining: 0
    }, { merge: true });
  }
}
