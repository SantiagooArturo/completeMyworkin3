'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  Video, 
  Square, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  MessageSquare,
  TrendingUp,
  Target,
  Lightbulb,
  History
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { interviewService, InterviewQuestion } from '@/services/interviewService';
import Link from 'next/link';

// Local interfaces for component state
interface Question extends InterviewQuestion {}

interface InterviewSession {
  jobTitle: string;
  questions: Question[];
  totalScore?: number;
  timestamp: string;
}

export default function InterviewSimulationPage() {
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading, refreshCredits } = useCredits(user);
  
  const [jobTitle, setJobTitle] = useState('');
  const [currentStep, setCurrentStep] = useState<'input' | 'interview' | 'completed'>('input');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if user has enough credits
  const requiredCredits = 4; // 1 credit per question
  const hasEnoughCredits = credits >= requiredCredits;
  const generateQuestions = async () => {
    if (!jobTitle.trim()) {
      setError('Por favor, ingresa un título de trabajo');
      return;
    }

    if (!hasEnoughCredits) {
      setError(`Necesitas al menos ${requiredCredits} créditos para realizar una simulación completa`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedQuestions = await interviewService.generateQuestions(jobTitle);
      const newQuestions: Question[] = generatedQuestions.map((text: string) => ({ text }));
      
      setQuestions(newQuestions);
      setCurrentStep('interview');
      setCurrentQuestionIndex(0);
    } catch (error) {
      setError('Error al generar preguntas. Inténtalo de nuevo.');
      console.error('Error generating questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      setRecordingType(type);
      const constraints = type === 'video' 
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: type === 'video' ? 'video/webm' : 'audio/webm',
        });
        await processRecording(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setError('Error al acceder al micrófono/cámara');
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };
  const processRecording = async (blob: Blob) => {
    setIsLoading(true);
    try {
      const result = await interviewService.processRecording(
        blob,
        questions[currentQuestionIndex].text,
        jobTitle,
        recordingType
      );

      // Update current question with results
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        mediaUrl: result.mediaUrl,
        transcript: result.transcript,
        evaluation: result.evaluation,
      };

      setQuestions(updatedQuestions);

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        await completeInterview(updatedQuestions);
      }
    } catch (error) {
      setError('Error al procesar la grabación');
      console.error('Error processing recording:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const completeInterview = async (finalQuestions: Question[]) => {
    try {
      const totalScore = finalQuestions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / finalQuestions.length;

      const interviewData = {
        userId: user!.uid,
        jobTitle,
        questions: finalQuestions,
        totalScore,
        timestamp: new Date().toISOString(),
        creditsUsed: finalQuestions.length,
      };

      await interviewService.saveInterviewSession(interviewData);
      await refreshCredits(); // Update credits display
      setCurrentStep('completed');
    } catch (error) {
      setError('Error al completar la entrevista');
      console.error('Error completing interview:', error);
    }
  };

  const resetSimulation = () => {
    setJobTitle('');
    setCurrentStep('input');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  if (authLoading || creditsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para acceder a la simulación de entrevistas.
            </p>
            <Link href="/login">
              <Button className="w-full">Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simulación de Entrevistas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practica tus habilidades de entrevista con IA avanzada y recibe feedback personalizado
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              Créditos disponibles: {credits}
            </Badge>
            <Link href="/historial-entrevistas">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Ver Historial
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input Step */}
        {currentStep === 'input' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Información del Puesto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del trabajo al que quieres aplicar
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej: Practicante de ventas en Coca Cola, Analista de marketing en banca"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generateQuestions()}
                    className="w-full"
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">¿Qué incluye la simulación?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 4 preguntas personalizadas para tu puesto</li>
                    <li>• Grabación de audio o video de tus respuestas</li>
                    <li>• Transcripción automática con IA</li>
                    <li>• Evaluación detallada y feedback personalizado</li>
                    <li>• Costo: {requiredCredits} créditos</li>
                  </ul>
                </div>

                {!hasEnoughCredits && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Necesitas al menos {requiredCredits} créditos para completar la simulación. 
                      <Link href="/credits" className="text-blue-600 hover:underline ml-1">
                        Comprar créditos
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={generateQuestions}
                  disabled={isLoading || !hasEnoughCredits || !jobTitle.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Generando preguntas...' : 'Comenzar Simulación'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Step */}
        {currentStep === 'interview' && currentQuestion && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                  </span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}% completado</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Pregunta {currentQuestionIndex + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-900 mb-6 p-4 bg-gray-50 rounded-lg">
                  {currentQuestion.text}
                </div>

                {!currentQuestion.evaluation && (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Graba tu respuesta usando audio o video. Tómate el tiempo necesario para dar una respuesta completa.
                    </p>
                    
                    <div className="flex gap-4 justify-center">
                      {!isRecording ? (
                        <>
                          <Button 
                            onClick={() => startRecording('audio')}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                          >
                            <Mic className="h-4 w-4" />
                            Grabar Audio
                          </Button>
                          <Button 
                            onClick={() => startRecording('video')}
                            disabled={isLoading}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Video className="h-4 w-4" />
                            Grabar Video
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={stopRecording}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <Square className="h-4 w-4" />
                          Detener Grabación
                        </Button>
                      )}
                    </div>

                    {isRecording && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 text-red-600 font-medium">
                          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                          Grabando...
                        </div>
                      </div>
                    )}

                    {isLoading && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Procesando respuesta...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Show evaluation if available */}
                {currentQuestion.evaluation && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Respuesta evaluada</span>
                    </div>

                    {/* Transcript */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Tu respuesta:</h4>
                      <p className="text-gray-700 text-sm">{currentQuestion.transcript}</p>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentQuestion.evaluation.score}/10
                        </div>
                        <div className="text-sm text-gray-600">Puntuación</div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">{currentQuestion.evaluation.summary}</p>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Fortalezas
                      </h4>
                      <ul className="space-y-1">
                        {currentQuestion.evaluation.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Áreas de mejora
                      </h4>
                      <ul className="space-y-1">
                        {currentQuestion.evaluation.improvements.map((improvement, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Recomendaciones
                      </h4>
                      <ul className="space-y-1">
                        {currentQuestion.evaluation.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {currentQuestionIndex < questions.length - 1 && (
                      <Button 
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="w-full mt-6"
                      >
                        Siguiente Pregunta
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completed Step */}
        {currentStep === 'completed' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ¡Simulación Completada!
                </h2>
                <p className="text-gray-600 mb-6">
                  Has completado exitosamente la simulación de entrevista para <strong>{jobTitle}</strong>.
                  Tu sesión ha sido guardada y puedes revisarla en cualquier momento.
                </p>
                
                {questions.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {(questions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / questions.length).toFixed(1)}/10
                    </div>
                    <div className="text-sm text-blue-800">Puntuación promedio</div>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <Button onClick={resetSimulation}>
                    Nueva Simulación
                  </Button>
                  <Link href="/historial-entrevistas">
                    <Button variant="outline">
                      Ver Historial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
