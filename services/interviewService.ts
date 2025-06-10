import { auth } from '@/firebase/config';
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
  Timestamp 
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
  creditsUsed: number;
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

  // Upload media file to storage
  async uploadMedia(file: Blob, filename: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file, filename);

    const response = await fetch('https://worky-bot.onrender.com/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error uploading media');
    }

    const data = await response.json();
    if (!data.success || !data.url) {
      throw new Error('Invalid upload response');
    }

    return data.url;
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
    }

    const data = await response.json();
    return data.interviewId;
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

  // Get interview statistics
  async getUserInterviewStats(userId: string) {
    try {
      const interviews = await this.getUserInterviews(userId);
      
      if (interviews.length === 0) {
        return {
          totalInterviews: 0,
          averageScore: 0,
          totalCreditsUsed: 0,
          lastInterviewDate: null,
          bestScore: 0,
          improvementTrend: 0,
        };
      }

      const totalScore = interviews.reduce((sum, interview) => sum + (interview.totalScore || 0), 0);
      const averageScore = totalScore / interviews.length;
      const totalCreditsUsed = interviews.reduce((sum, interview) => sum + interview.creditsUsed, 0);
      const bestScore = Math.max(...interviews.map(i => i.totalScore || 0));
      
      // Calculate improvement trend (last 3 vs previous 3)
      let improvementTrend = 0;
      if (interviews.length >= 6) {
        const recent3 = interviews.slice(0, 3);
        const previous3 = interviews.slice(3, 6);
        const recentAvg = recent3.reduce((sum, i) => sum + (i.totalScore || 0), 0) / 3;
        const previousAvg = previous3.reduce((sum, i) => sum + (i.totalScore || 0), 0) / 3;
        improvementTrend = recentAvg - previousAvg;
      }

      return {
        totalInterviews: interviews.length,
        averageScore: Number(averageScore.toFixed(1)),
        totalCreditsUsed,
        lastInterviewDate: interviews[0]?.createdAt?.toDate() || null,
        bestScore: Number(bestScore.toFixed(1)),
        improvementTrend: Number(improvementTrend.toFixed(1)),
      };
    } catch (error) {
      console.error('Error calculating interview stats:', error);
      throw new Error('Error calculating statistics');
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
      const evaluation = await this.evaluateAnswer(question, transcript, jobTitle);

      return {
        mediaUrl,
        transcript,
        evaluation,
      };
    } catch (error) {
      console.error('Error processing recording:', error);
      throw error;
    }
  }
}

export const interviewService = new InterviewService();
