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
import Navbar from '@/components/navbar';
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal';
import { useToast } from '@/hooks/use-toast';

// Local interfaces for component state
interface Question extends InterviewQuestion {
    audioUrl?: string;
    transcription?: string;
    transcript?: string;
    evaluation?: {
        score: number;
        summary: string;
        strengths: string[];
        improvements: string[];
        recommendations: string[];
    };
}

interface InterviewSession {
    jobTitle: string;
    questions: Question[];
    totalScore?: number;
    timestamp: string;
}

export default function InterviewSimulationPage() {    const { user, loading: authLoading } = useAuth();
    const { 
        credits, 
        loading: creditsLoading, 
        refreshCredits, 
        consumeCredits, 
        hasEnoughCredits: hasEnoughCreditsFunc,
        reserveCredits,
        confirmReservation,
        revertReservation
    } = useCredits(user);

    const [jobTitle, setJobTitle] = useState('');
    const [currentStep, setCurrentStep] = useState<'input' | 'interview' | 'completed'>('input');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);    const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);    const [processingAudio, setProcessingAudio] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>('');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const { toast } = useToast();
    const recordedChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
      // ✅ CAMBIO: Ahora las entrevistas cuestan 1 crédito
    const requiredCredits = 1;
    const hasEnoughCredits = hasEnoughCreditsFunc('interview-simulation');

    // useEffect para conectar stream al video preview
    useEffect(() => {
        if (isRecording && recordingType === 'video' && streamRef.current && videoPreviewRef.current) {
            console.log('🎥 Conectando stream al video preview...');
            
            // Pequeño delay para asegurar que el video element esté listo
            setTimeout(() => {
                if (videoPreviewRef.current && streamRef.current) {
                    videoPreviewRef.current.srcObject = streamRef.current;
                    
                    // Forzar la reproducción del video
                    videoPreviewRef.current.play().catch(error => {
                        console.warn('Error auto-playing video preview:', error);
                    });
                    
                    console.log('✅ Stream conectado al video preview');
                }
            }, 100);
        }
    }, [isRecording, recordingType]);const generateQuestions = async () => {
        if (!jobTitle.trim()) {
            setError('Por favor, ingresa un título de trabajo');
            return;
        }        // ✅ Verificar créditos antes de continuar
        if (!hasEnoughCredits) {
            setShowInsufficientCreditsModal(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        let reservationId: string | null = null;

        try {
            // ✅ NUEVO: Reservar créditos antes de generar preguntas
            console.log("💳 Reservando créditos para simulación de entrevista...");
            const reserveResult = await reserveCredits('interview-simulation', `Simulación de entrevista para ${jobTitle}`);
            
            if (!reserveResult.success) {
                toast({
                    title: "Créditos insuficientes",
                    description: "No tienes suficientes créditos para realizar la simulación.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }
            
            reservationId = reserveResult.reservationId;
            console.log(`✅ Créditos reservados con ID: ${reservationId}`);            // Generar preguntas
            const generatedQuestions = await interviewService.generateQuestions(jobTitle);
            const newQuestions: Question[] = generatedQuestions.map((text: string) => ({ text }));

            setQuestions(newQuestions);
            setCurrentStep('interview');
            setCurrentQuestionIndex(0);
            
            // ✅ IMPORTANTE: Guardar reservationId en el estado para usarlo después
            sessionStorage.setItem('interviewReservationId', reservationId);
            
        } catch (error: any) {
            console.error('❌ Error generando preguntas:', error);
            
            // ✅ Revertir reserva de créditos en caso de error
            if (reservationId) {
                try {
                    console.log("🔄 Revirtiendo reserva de créditos...");
                    const revertResult = await revertReservation(reservationId, 'interview-simulation', `Error: ${error.message}`);
                    
                    if (revertResult) {
                        console.log("✅ Reserva revertida exitosamente");
                    } else {
                        console.warn("⚠️ No se pudo revertir la reserva de créditos");
                    }
                } catch (revertError) {
                    console.error("❌ Error revirtiendo reserva:", revertError);
                }
            }
            
            toast({
                title: "Error al generar preguntas",
                description: "No se pudieron generar las preguntas para la entrevista. Por favor, inténtalo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async (type: 'audio' | 'video') => {
        try {
            console.log(`🎬 Iniciando grabación de ${type}...`);
            setRecordingType(type);
            const constraints = type === 'video'
                ? { video: true, audio: true }
                : { audio: true };

            console.log('📱 Solicitando permisos de cámara/micrófono...');
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            
            console.log('✅ Stream obtenido:', {
                videoTracks: stream.getVideoTracks().length,
                audioTracks: stream.getAudioTracks().length
            });

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
            toast({
                title: "Error de grabación",
                description: `Error al acceder al ${type === 'video' ? 'micrófono y cámara' : 'micrófono'}. Asegúrate de tener los permisos habilitados.`,
                variant: "destructive",
            });
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Limpiar video preview
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = null;
            }

            // Stop all tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    };    const processRecording = async (blob: Blob) => {
        try {
            const isVideo = blob.type.includes('video');
            console.log('🎬 Procesando grabación:', {
                size: blob.size,
                type: blob.type,
                isVideo: isVideo
            });

            if (blob.size === 0) {
                throw new Error('La grabación está vacía');
            }

            setProcessingAudio(true);
            
            // Paso 1: Subiendo archivo
            setProcessingStep('Subiendo archivo...');
            console.log(`📤 Subiendo archivo de ${isVideo ? 'video' : 'audio'}...`);
            const filename = `interview_${Date.now()}_${currentQuestionIndex}.webm`;
            const audioUrl = await interviewService.uploadMedia(blob, filename);
            
            console.log('✅ Archivo subido:', audioUrl);

            // Paso 2: Transcribiendo audio (extrae audio del video si es necesario)
            setProcessingStep('Transcribiendo tu respuesta...');
            console.log(`🎤 Iniciando transcripción ${isVideo ? 'de video' : 'de audio'} via API...`);
            const transcription = await interviewService.transcribeAudio(audioUrl);
            
            if (!transcription || transcription.trim() === '') {
                throw new Error('La transcripción está vacía');
            }

            console.log('✅ Transcripción completada:', transcription);

            // Paso 3: Evaluando respuesta
            setProcessingStep('Evaluando tu respuesta con IA...');
            console.log('🤖 Iniciando evaluación...');
            const evaluation = await interviewService.evaluateAnswer(
                questions[currentQuestionIndex].text,
                transcription,
                jobTitle
            );

            console.log('✅ Evaluación completada');

            // Actualizar pregunta
            const updatedQuestions = [...questions];
            updatedQuestions[currentQuestionIndex] = {
                ...updatedQuestions[currentQuestionIndex],
                audioUrl,
                transcription,
                transcript: transcription, // Para compatibilidad
                evaluation,
            };            setQuestions(updatedQuestions);
            setShowAnalysis(true);
            
            console.log('🔍 Debug análisis pregunta:', {
                questionIndex: currentQuestionIndex,
                totalQuestions: questions.length,
                isLastQuestion: currentQuestionIndex === questions.length - 1,
                showAnalysis: true,
                evaluation: evaluation
            });
            
            // Si es la última pregunta, NO completar automáticamente
            // Permitir que el usuario vea el análisis primero
            if (currentQuestionIndex === questions.length - 1) {
                console.log('✅ Última pregunta completada, análisis listo para mostrar');
                // No completar automáticamente, dejar que el usuario vea el análisis
            }

        } catch (error: any) {
            console.error('❌ Error procesando grabación:', error);
            toast({
                title: "Error al procesar la grabación",
                description: error.message || "Ocurrió un error inesperado. Por favor, intenta grabar de nuevo.",
                variant: "destructive",
            });
        } finally {
            setProcessingAudio(false);
            setProcessingStep('');
        }
    };    const completeInterview = async (finalQuestions: Question[]) => {
        try {
            const totalScore = finalQuestions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / finalQuestions.length;

            // ✅ NUEVO: Confirmar el consumo de créditos al completar la entrevista
            const reservationId = sessionStorage.getItem('interviewReservationId');
            
            if (reservationId) {
                console.log("💳 Confirmando consumo de créditos...");
                const confirmResult = await confirmReservation(reservationId, 'interview-simulation', 'Simulación de entrevista completada');
                
                if (!confirmResult) {
                    console.warn("⚠️ No se pudo confirmar el consumo de créditos, pero la entrevista fue exitosa");
                } else {
                    console.log("✅ Créditos confirmados y consumidos");
                }
                
                // Limpiar la reserva del sessionStorage
                sessionStorage.removeItem('interviewReservationId');
            }

            const interviewData = {
                userId: user!.uid,
                jobTitle,
                questions: finalQuestions,
                totalScore,
                timestamp: new Date().toISOString(),
                creditsUsed: 1, // ✅ CAMBIO: Ahora registra 1 crédito usado
            };

            await interviewService.saveInterviewSession(interviewData);
            await refreshCredits(); // Update credits display
            setCurrentStep('completed');
        } catch (error) {
            toast({
                title: "Error al completar la entrevista",
                description: "No se pudo guardar la sesión de la entrevista. Por favor, contacta a soporte.",
                variant: "destructive",
            });
            console.error('Error completing interview:', error);
        }
    };    const resetSimulation = () => {
        // ✅ NUEVO: Limpiar cualquier reserva de créditos pendiente
        const reservationId = sessionStorage.getItem('interviewReservationId');
        if (reservationId) {
            sessionStorage.removeItem('interviewReservationId');
            // Nota: No revertimos aquí porque el usuario simplemente está reseteando
            // La reserva expirará automáticamente si no se confirma
        }
        
        setJobTitle('');
        setCurrentStep('input');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setError(null);
        setShowAnalysis(false);
        setProcessingStep('');
    };

    const goToNextQuestion = () => {
        setShowAnalysis(false);
        setCurrentQuestionIndex(prev => prev + 1);
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
            <Navbar />
            <div className="h-[52px]"></div>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Simulación de Entrevistas
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <Badge variant="outline" className="text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            Créditos disponibles: {credits}
                        </Badge>
                        {/* <Link href="/historial-entrevistas">
                            <Button variant="outline" size="sm">
                                <History className="h-4 w-4 mr-2" />
                                Ver Historial
                            </Button>
                        </Link> */}
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
                                </div>                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-blue-900 mb-2">¿Qué incluye la simulación?</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• 4 preguntas personalizadas para tu puesto</li>
                                        <li>• Grabación de audio o video de tus respuestas</li>
                                        <li>• Transcripción automática con IA</li>
                                        <li>• Evaluación detallada y feedback personalizado</li>
                                        <li>• <strong>Costo: {requiredCredits} crédito</strong></li>
                                    </ul>
                                </div>

                                {/* ✅ Mostrar balance actual de créditos */}
                                <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between">
                                    <span className="text-sm text-green-800">Balance actual:</span>
                                    <span className="font-semibold text-green-900">{credits} créditos</span>
                                </div>{/* ✅ RESTAURAR: Alerta de créditos insuficientes */}
                                {!hasEnoughCredits && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Necesitas al menos {requiredCredits} crédito para completar la simulación.
                                            <Link href="/credits" className="text-blue-600 hover:underline ml-1">
                                                Comprar créditos
                                            </Link>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    onClick={generateQuestions}
                                    disabled={isLoading || !jobTitle.trim() || !hasEnoughCredits}
                                    className="w-full"
                                >
                                    {isLoading ? 'Generando preguntas...' : 'Comenzar Simulación de Entrevista'}
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
                                </div>                                {!currentQuestion.evaluation && !showAnalysis && (
                                    <div className="space-y-4">
                                        <p className="text-gray-600">
                                            Graba tu respuesta usando audio o video. Tómate el tiempo necesario para dar una respuesta completa.
                                        </p>

                                        <div className="flex gap-4 justify-center">
                                            {!isRecording ? (
                                                <>                                                    <Button
                                                        onClick={() => startRecording('audio')}
                                                        disabled={processingAudio}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Mic className="h-4 w-4" />
                                                        Grabar Audio
                                                    </Button>
                                                    <Button
                                                        onClick={() => startRecording('video')}
                                                        disabled={processingAudio}
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

                                        {/* Video Preview - Solo cuando se graba video */}
                                        {isRecording && recordingType === 'video' && (
                                            <div className="flex justify-center mt-4 mb-4">
                                                <div className="relative">
                                                    <video
                                                        ref={videoPreviewRef}
                                                        autoPlay
                                                        muted
                                                        playsInline
                                                        onLoadedMetadata={(e) => {
                                                            const video = e.target as HTMLVideoElement;
                                                            video.play().catch(console.warn);
                                                        }}
                                                        className="w-80 h-60 sm:w-96 sm:h-72 rounded-lg border-2 border-gray-300 shadow-lg bg-gray-900"
                                                    />
                                                    {/* Indicador REC en el video */}
                                                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                        REC
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {isRecording && (
                                            <div className="text-center">
                                                <div className="inline-flex items-center gap-2 text-red-600 font-medium">
                                                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                                                    Grabando {recordingType === 'video' ? 'video' : 'audio'}...
                                                </div>
                                            </div>
                                        )}

                                        {processingAudio && (
                                            <div className="text-center py-6">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                <div className="space-y-2">
                                                    <p className="text-gray-900 font-medium">Procesando tu respuesta...</p>
                                                    <p className="text-gray-600 text-sm">{processingStep}</p>
                                                </div>
                                                <div className="mt-4 max-w-md mx-auto">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <div className={`w-2 h-2 rounded-full ${processingStep.includes('Subiendo') ? 'bg-blue-500 animate-pulse' : processingStep.includes('archivo') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                        <span>Subiendo</span>
                                                        <div className={`w-2 h-2 rounded-full ${processingStep.includes('Transcribiendo') ? 'bg-blue-500 animate-pulse' : processingStep.includes('Evaluando') || processingStep.includes('Guardando') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                        <span>Transcribiendo</span>
                                                        <div className={`w-2 h-2 rounded-full ${processingStep.includes('Evaluando') ? 'bg-blue-500 animate-pulse' : processingStep.includes('Guardando') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                        <span>Evaluando</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}                                {/* Show analysis immediately after processing */}
                                {(() => {
                                    console.log('🔍 Verificando condición análisis:', {
                                        hasEvaluation: !!currentQuestion.evaluation,
                                        showAnalysis,
                                        questionIndex: currentQuestionIndex,
                                        evaluation: currentQuestion.evaluation
                                    });
                                    return null;
                                })()}
                                {(currentQuestion.evaluation && showAnalysis) && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-green-600 mb-4">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-medium">¡Respuesta procesada y evaluada!</span>
                                        </div>

                                        {/* Individual Analysis Card */}
                                        <Card className="border-green-200 bg-green-50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-green-800">
                                                    <TrendingUp className="h-5 w-5" />
                                                    Análisis de tu Respuesta
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Score Display */}
                                                <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold text-blue-600">
                                                            {currentQuestion.evaluation.score}/10
                                                        </div>
                                                        <div className="text-sm text-gray-600">Puntuación</div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                                            <div
                                                                className={`h-3 rounded-full transition-all duration-500 ${
                                                                    currentQuestion.evaluation.score >= 8 ? 'bg-green-500' :
                                                                    currentQuestion.evaluation.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                                style={{ width: `${(currentQuestion.evaluation.score / 10) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-gray-700 mt-2">{currentQuestion.evaluation.summary}</p>
                                                    </div>
                                                </div>

                                                {/* Transcript */}
                                                <div className="bg-white p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4" />
                                                        Tu respuesta transcrita:
                                                    </h4>
                                                    <p className="text-gray-700 text-sm italic leading-relaxed">"{currentQuestion.transcript}"</p>
                                                </div>

                                                {/* Strengths */}
                                                <div className="bg-white p-4 rounded-lg">
                                                    <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4" />
                                                        ✅ Fortalezas identificadas
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {currentQuestion.evaluation.strengths.map((strength, index) => (
                                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                <span>{strength}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Improvements */}
                                                <div className="bg-white p-4 rounded-lg">
                                                    <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                                                        <Target className="h-4 w-4" />
                                                        🎯 Áreas de mejora
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {currentQuestion.evaluation.improvements.map((improvement, index) => (
                                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                                                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                <span>{improvement}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Recommendations */}
                                                <div className="bg-white p-4 rounded-lg">
                                                    <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                                                        <Lightbulb className="h-4 w-4" />
                                                        💡 Recomendaciones personalizadas
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {currentQuestion.evaluation.recommendations.map((recommendation, index) => (
                                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                <span>{recommendation}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                        </Card>                                        {/* Continue Button */}
                                        <div className="text-center pt-4">
                                            {currentQuestionIndex < questions.length - 1 ? (
                                                <Button
                                                    onClick={goToNextQuestion}
                                                    className="w-full sm:w-auto px-8"
                                                    size="lg"
                                                >
                                                    Continuar con la siguiente pregunta →
                                                </Button>
                                            ) : (
                                                <div className="space-y-4">
                                                    <p className="text-gray-600 font-medium">¡Has completado todas las preguntas!</p>
                                                    <Button
                                                        onClick={async () => {
                                                            setProcessingStep('Guardando resultados...');
                                                            await completeInterview(questions);
                                                        }}
                                                        className="w-full sm:w-auto px-8"
                                                        size="lg"
                                                        disabled={processingAudio}
                                                    >
                                                        {processingStep ? processingStep : 'Finalizar Entrevista y Ver Resultados'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Legacy evaluation display (for compatibility) */}
                                {currentQuestion.evaluation && !showAnalysis && (
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
                                    {/* <Link href="/historial-entrevistas">
                                        <Button variant="outline">
                                            Ver Historial
                                        </Button>
                                    </Link> */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>                )}
            </div>

            {/* Insufficient Credits Modal */}
            {user && (
                <InsufficientCreditsModal
                    isOpen={showInsufficientCreditsModal}
                    onClose={() => setShowInsufficientCreditsModal(false)}
                    user={user}
                    toolType="interview-simulation"
                    requiredCredits={requiredCredits}
                    currentCredits={credits}
                />
            )}
        </div>
    );
}
