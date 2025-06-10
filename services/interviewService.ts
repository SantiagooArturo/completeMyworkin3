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
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch('/api/interview/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error transcribing audio');
    }

    const data = await response.json();
    return data.transcript;
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
      const mediaUrl = await this.uploadMedia(audioBlob, filename);

      // Transcribe audio
      const transcript = await this.transcribeAudio(audioBlob);

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
