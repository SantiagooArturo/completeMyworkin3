import { auth } from '@/firebase/config';
import { User } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface InterviewQuestion {
  text: string;
  mediaUrl?: string;
  transcript?: string;
  evaluation?: {
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}

export interface InterviewSession {
  id?: string;
  userId: string;
  jobTitle: string;
  questions: InterviewQuestion[];
  totalScore?: number;
  timestamp: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  creditsUsed: number;
  status?: 'completed' | 'in-progress' | 'cancelled';
}

// Interfaz para entrevistas guardadas, siguiendo el patrón de SavedCV
export interface SavedInterview {
  id: string;
  userId: string;
  jobTitle: string;
  questions: InterviewQuestion[];
  totalScore?: number;
  creditsUsed: number;
  status: 'completed' | 'in-progress' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  deleted?: boolean;
  deletedAt?: any;
}

class InterviewService {
  
  // Generate interview questions using OpenAI
  async generateQuestions(jobTitle: string): Promise<string[]> {
    const response = await fetch('/api/interview/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobTitle }),
    });

    if (!response.ok) {
      throw new Error('Error generating questions');
    }

    const data = await response.json();
    return data.questions;
  }

  // Upload media file directly to Cloudflare R2 using presigned URLs
  async uploadMedia(file: Blob, filename: string): Promise<string> {
    try {
      console.log('📤 === INICIO UPLOAD MEDIA (DIRECT R2) ===');
      console.log('📁 Archivo:', {
        size: file.size,
        type: file.type,
        filename: filename
      });

      // Validaciones iniciales
      if (!file || file.size === 0) {
        throw new Error('Archivo vacío o inválido');
      }

      // Validar tamaño máximo para R2 directo (100MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('Archivo demasiado grande (máximo 100MB)');
      }

      // Paso 1: Obtener presigned URL
      console.log('🔐 Obteniendo presigned URL...');
      const response = await fetch('/api/upload-presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          contentType: file.type || 'application/octet-stream'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obteniendo presigned URL: ${response.status} - ${errorText}`);
      }

      const { uploadUrl, publicUrl } = await response.json();
      console.log('✅ Presigned URL obtenida');

      // Paso 2: Subir directamente a R2
      console.log('📤 Subiendo archivo directamente a R2...');
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Error subiendo archivo a R2: ${uploadResponse.status} - ${errorText}`);
      }

      console.log('✅ Upload exitoso con presigned URLs');
      console.log('🔗 URL pública:', publicUrl);
      console.log('📤 === FIN UPLOAD MEDIA (DIRECT R2) ===');
      
      return publicUrl;
      
    } catch (error: any) {
      console.error('❌ === ERROR EN UPLOAD MEDIA (DIRECT R2) ===');
      console.error('❌ Tipo:', error.constructor.name);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Stack:', error.stack);
      
      // Si falla el método directo, intentar con legacy como respaldo
      if (file.size <= 10 * 1024 * 1024) { // Solo si el archivo es menor a 10MB
        console.warn('⚠️ Intentando método legacy como respaldo...');
        try {
          return await this.uploadMediaLegacy(file, filename);
        } catch (legacyError: any) {
          console.error('❌ También falló el método legacy:', legacyError.message);
          throw new Error(`Upload failed: ${error.message}`);
        }
      }
      
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // Método de respaldo: Upload media usando la ruta anterior (para compatibilidad)
  async uploadMediaLegacy(file: Blob, filename: string): Promise<string> {
    try {
      console.log('📤 === INICIO UPLOAD MEDIA (LEGACY) ===');
      console.log('📁 Archivo:', {
        size: file.size,
        type: file.type,
        filename: filename
      });

      // Validaciones iniciales
      if (!file || file.size === 0) {
        throw new Error('Archivo vacío o inválido');
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB límite
        throw new Error('Archivo demasiado grande (máximo 100MB)');
      }

      const formData = new FormData();
      
      // Crear File object con nombre correcto
      const fileWithName = new File([file], filename, { type: file.type });
      formData.append('file', fileWithName);
      
      // Determinar el tipo de archivo basado primero en el MIME type, luego en la extensión
      const extension = filename.split('.').pop()?.toLowerCase();
      let fileType = 'audio'; // Default
      
      // Primero revisar el MIME type del archivo
      if (file.type.startsWith('video/')) {
        fileType = 'video';
      } else if (file.type.startsWith('audio/')) {
        fileType = 'audio';
      } else {
        // Si no hay MIME type o es genérico, basarse en la extensión
        if (['mp4', 'avi', 'mov', 'mkv', 'wmv'].includes(extension || '')) {
          fileType = 'video';
        } else if (['mp3', 'wav', 'm4a', 'aac', 'flac'].includes(extension || '')) {
          fileType = 'audio';
        } else if (extension === 'webm' || extension === 'ogg') {
          // ✅ FIX: Para archivos de entrevista webm, usar 'video' para ser más permisivo
          fileType = 'video';
        }
      }
      
      formData.append('type', fileType);

      console.log('📋 FormData preparado:', {
        fileType,
        extension,
        fileSize: file.size
      });

      // Debug FormData
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      console.log('📤 Enviando a /api/upload...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en upload:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(`Upload failed: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('✅ Upload exitoso:', data);

      if (!data.success || !data.url) {
        throw new Error('Invalid upload response from R2');
      }

      console.log('✅ URL obtenida:', data.url);
      console.log('📤 === FIN UPLOAD MEDIA (LEGACY) ===');
      
      return data.url;
    } catch (error: any) {
      console.error('❌ === ERROR EN UPLOAD MEDIA (LEGACY) ===');
      console.error('❌ Tipo:', error.constructor.name);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Stack:', error.stack);
      throw new Error(`Error uploading media to R2: ${error.message}`);
    }
  }

  // Transcribe audio using Whisper
  async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      console.log('🎤 Iniciando transcripción de audio:', audioUrl);
      
      // Validar que la URL no esté vacía o sea inválida
      if (!audioUrl || audioUrl.trim() === '') {
        throw new Error('URL de audio vacía o inválida');
      }

      // Validar formato de URL
      try {
        new URL(audioUrl);
      } catch (urlError) {
        throw new Error(`URL de audio inválida: ${audioUrl}`);
      }

      const response = await fetch('/api/interview/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          audioUrl: audioUrl.trim() 
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en transcripción - Status:', response.status);
        console.error('❌ Error en transcripción - Text:', errorText);
        
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Transcripción exitosa:', data.transcription);
      return data.transcription;
    } catch (error: any) {
      console.error('❌ Error en transcribeAudio:', error);
      throw new Error(`Error transcribing audio: ${error.message}`);
    }
  }
  // Transcribe audio directly with OpenAI (without intermediate API)
  async transcribeAudioDirect(blob: Blob): Promise<string> {
    try {
      console.log('🎤 === INICIO TRANSCRIPCIÓN DIRECTA ===');
      console.log('📄 Archivo recibido:', {
        size: blob.size,
        type: blob.type
      });

      // Validaciones iniciales
      if (blob.size === 0) {
        throw new Error('El archivo de audio está vacío');
      }

      if (blob.size > 25 * 1024 * 1024) { // 25MB límite de OpenAI
        throw new Error('El archivo es demasiado grande (máximo 25MB)');
      }

      // Verificar API key
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      console.log('🔑 API Key configurada:', apiKey ? 'SÍ' : 'NO');
      console.log('🔑 API Key preview:', apiKey ? `${apiKey.substring(0, 7)}...` : 'UNDEFINED');

      if (!apiKey) {
        throw new Error('Clave API de OpenAI no configurada. Verifica NEXT_PUBLIC_OPENAI_API_KEY en .env.local');
      }

      // Crear File object con el formato correcto
      const file = new File([blob], 'respuesta.webm', { 
        type: blob.type || 'audio/webm' 
      });
      
      console.log('📁 File object creado:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      // Debug FormData
      console.log('📋 FormData preparado:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      console.log('📤 Enviando a OpenAI directamente...');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error OpenAI completo:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers),
          body: errorText
        });

        let errorMessage = `OpenAI API error: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Error data parsed:', errorData);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          console.error('❌ No se pudo parsear error:', errorText);
          errorMessage = errorText || errorMessage;
        }

        // Errores específicos
        if (response.status === 401) {
          throw new Error('Clave API de OpenAI inválida. Verifica tu API key.');
        } else if (response.status === 429) {
          throw new Error('Límite de uso de OpenAI excedido. Verifica tu cuota.');
        } else if (response.status === 400) {
          throw new Error('Archivo de audio inválido o formato no soportado.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      console.log('✅ Respuesta OpenAI exitosa:', data);
      
      if (!data.text) {
        throw new Error('No se recibió transcripción de OpenAI');
      }

      console.log('✅ Transcripción directa completada:', data.text);
      console.log('🎤 === FIN TRANSCRIPCIÓN DIRECTA ===');
      
      return data.text;
    } catch (error: any) {
      console.error('❌ === ERROR EN TRANSCRIPCIÓN DIRECTA ===');
      console.error('❌ Tipo:', error.constructor.name);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Stack:', error.stack);
      throw new Error(`Error transcribing audio: ${error.message}`);
    }
  }

  // Evaluate answer using OpenAI
  async evaluateAnswer(question: string, transcript: string, jobTitle: string) {
    const response = await fetch('/api/interview/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        transcript,
        jobTitle,
      }),
    });

    if (!response.ok) {
      throw new Error('Error evaluating answer');
    }

    return await response.json();
  }

  // Save interview session
  async saveInterviewSession(interviewData: Omit<InterviewSession, 'id'>): Promise<string> {
    const response = await fetch('/api/interview/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: interviewData.userId,
        interviewData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error saving interview');
    }    const data = await response.json();
    return data.interviewId;
  }

  // Guardar entrevista (siguiendo el patrón de CVBuilderService)
  async saveInterview(user: User, interviewData: {
    jobTitle: string;
    questions: InterviewQuestion[];
    totalScore?: number;
    creditsUsed?: number;
  }): Promise<string> {
    try {
      if (!user || !user.uid) {
        throw new Error('Usuario no autenticado');
      }

      const interviewDoc: Omit<SavedInterview, 'id'> = {
        userId: user.uid,
        jobTitle: interviewData.jobTitle,
        questions: interviewData.questions,
        totalScore: interviewData.totalScore || 0,
        creditsUsed: interviewData.creditsUsed || 0,
        status: 'completed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'userInterviews'), interviewDoc);
      console.log('✅ Entrevista guardada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error guardando entrevista:', error);
      throw new Error('Error al guardar la entrevista');
    }
  }

  // Get user's interview history
  async getUserInterviews(userId: string): Promise<InterviewSession[]> {
    try {
      const q = query(
        collection(db, 'interviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const interviews: InterviewSession[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interviews.push({
          id: doc.id,
          userId: data.userId,
          jobTitle: data.jobTitle,
          questions: data.questions || [],
          totalScore: data.totalScore,
          timestamp: data.timestamp,
          createdAt: data.createdAt,
          creditsUsed: data.creditsUsed || data.questions?.length || 4,
        });
      });

      return interviews;
    } catch (error) {
      console.error('Error fetching user interviews:', error);
      throw new Error('Error fetching interview history');
    }
  }

  // Obtener entrevistas del usuario (siguiendo el patrón de CVBuilderService)
  async getUserInterviewsFromFirebase(user: User): Promise<SavedInterview[]> {
    try {
      if (!user || !user.uid) {
        throw new Error('Usuario no autenticado');
      }

      const interviewsQuery = query(
        collection(db, 'userInterviews'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const interviewsSnapshot = await getDocs(interviewsQuery);
      const interviews = interviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedInterview[];

      // Filtrar entrevistas no eliminadas
      const activeInterviews = interviews.filter(interview => !interview.deleted);

      // Ordenar por fecha de actualización más reciente
      return activeInterviews.sort((a, b) => {
        const dateA = a.updatedAt?.toDate() || new Date(0);
        const dateB = b.updatedAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error obteniendo entrevistas del usuario:', error);
      throw new Error('Error al cargar las entrevistas');
    }
  }

  // Obtener una entrevista específica
  async getInterview(interviewId: string): Promise<SavedInterview | null> {
    try {
      const interviewRef = doc(db, 'userInterviews', interviewId);
      const interviewDoc = await getDoc(interviewRef);

      if (interviewDoc.exists()) {
        return {
          id: interviewDoc.id,
          ...interviewDoc.data()
        } as SavedInterview;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo entrevista:', error);
      throw new Error('Error al cargar la entrevista');
    }
  }

  // Actualizar entrevista existente
  async updateInterview(interviewId: string, interviewData: Partial<SavedInterview>): Promise<void> {
    try {
      const interviewRef = doc(db, 'userInterviews', interviewId);
      const updateData: any = {
        ...interviewData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updateData);
    } catch (error) {
      console.error('Error actualizando entrevista:', error);
      throw new Error('Error al actualizar la entrevista');
    }
  }

  // Eliminar entrevista (soft delete, siguiendo el patrón de CVs)
  async deleteInterview(interviewId: string): Promise<void> {
    try {
      const interviewRef = doc(db, 'userInterviews', interviewId);
      await updateDoc(interviewRef, {
        deleted: true,
        deletedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error eliminando entrevista:', error);
      throw new Error('Error al eliminar la entrevista');
    }
  }

  // Process complete recording (upload + transcribe + evaluate)
  async processRecording(
    audioBlob: Blob, 
    question: string, 
    jobTitle: string,
    recordingType: 'audio' | 'video' = 'audio'
  ) {
    try {
      // Upload media
      const filename = `interview_${Date.now()}.${recordingType === 'video' ? 'webm' : 'webm'}`;
      // const mediaUrl = await this.uploadMedia(audioBlob, filename);
      const mediaUrl = 'https://example.com/path/to/uploaded/file.webm'; // Placeholder for actual upload logic
      // Transcribe audio
      const transcript = await this.transcribeAudio(mediaUrl);

      // Evaluate answer
      const evaluation = await this.evaluateAnswer(question, transcript, jobTitle);      return {
        mediaUrl,
        transcript,
        evaluation,
      };
    } catch (error) {
      console.error('Error processing recording:', error);
      throw error;
    }
  }

  // Obtener estadísticas del usuario
  async getUserInterviewStats(userId: string) {
    try {
      const interviews = await this.getUserInterviews(userId);
      
      const totalInterviews = interviews.length;
      const totalCreditsUsed = interviews.reduce((sum, interview) => sum + interview.creditsUsed, 0);
      
      let averageScore = 0;
      let bestScore = 0;
      let lastInterviewDate = null;
      
      if (interviews.length > 0) {
        const scores = interviews
          .filter(interview => interview.totalScore !== undefined)
          .map(interview => interview.totalScore!);
        
        if (scores.length > 0) {
          averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          bestScore = Math.max(...scores);
        }
        
        // Obtener fecha de la última entrevista
        const sortedInterviews = interviews.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        if (sortedInterviews.length > 0) {
          lastInterviewDate = sortedInterviews[0].createdAt?.toDate() || null;
        }
      }

      // Calcular tendencia de mejora (diferencia entre últimas 2 entrevistas)
      let improvementTrend = 0;
      if (interviews.length >= 2) {
        const recent = interviews.slice(0, 2);
        if (recent[0].totalScore && recent[1].totalScore) {
          improvementTrend = recent[0].totalScore - recent[1].totalScore;
        }
      }

      return {
        totalInterviews,
        averageScore: Math.round(averageScore * 10) / 10,
        totalCreditsUsed,
        lastInterviewDate,
        bestScore: Math.round(bestScore * 10) / 10,
        improvementTrend: Math.round(improvementTrend * 10) / 10,
      };
    } catch (error) {
      console.error('Error getting user interview stats:', error);
      return {
        totalInterviews: 0,
        averageScore: 0,
        totalCreditsUsed: 0,
        lastInterviewDate: null,
        bestScore: 0,
        improvementTrend: 0,
      };
    }
  }
}

export const interviewService = new InterviewService();
