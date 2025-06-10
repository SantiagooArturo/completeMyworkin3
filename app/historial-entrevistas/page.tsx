'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  Calendar, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
  Star,
  PlayCircle,
  MessageSquare,
  BarChart,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInterviews } from '@/hooks/useInterviews';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InterviewHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { interviews, stats, loading: interviewsLoading, error, refreshInterviews } = useInterviews();
  const [expandedInterview, setExpandedInterview] = useState<string | null>(null);

  const toggleExpanded = (interviewId: string) => {
    setExpandedInterview(
      expandedInterview === interviewId ? null : interviewId
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  if (authLoading || interviewsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <History className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para ver tu historial de entrevistas.
            </p>
            <Link href="/login">
              <Button className="w-full">Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <History className="inline-block h-10 w-10 mr-3 text-blue-600" />
            Historial de Entrevistas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Revisa tus simulaciones anteriores y observa tu progreso
          </p>
        </div>

        {error && (
          <Alert className="mb-6 max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button onClick={refreshInterviews} variant="outline" size="sm">
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</div>
              <div className="text-sm text-gray-600">Entrevistas Realizadas</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageScore}/10</div>
              <div className="text-sm text-gray-600">Puntuación Promedio</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.bestScore}/10</div>
              <div className="text-sm text-gray-600">Mejor Puntuación</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className={`h-8 w-8 ${stats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className={`text-2xl font-bold ${stats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend}
              </div>
              <div className="text-sm text-gray-600">Tendencia</div>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        <div className="max-w-4xl mx-auto">
          {interviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay entrevistas registradas
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza tu primera simulación de entrevista para ver tu progreso aquí.
                </p>
                <Link href="/interview-simulation">
                  <Button>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Realizar Primera Entrevista
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Card key={interview.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(interview.id || '')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {interview.jobTitle}
                        </CardTitle>                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(interview.createdAt?.toDate() || interview.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {interview.questions.length} preguntas
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={getScoreBadgeVariant(interview.totalScore || 0)}
                          className="text-sm"
                        >
                          {interview.totalScore?.toFixed(1) || 'N/A'}/10
                        </Badge>
                        {expandedInterview === interview.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {expandedInterview === interview.id && (
                    <CardContent className="border-t border-gray-200">
                      <div className="space-y-6 pt-6">
                        {interview.questions.map((question, qIndex) => (
                          <div key={qIndex} className="border rounded-lg p-4 bg-gray-50">
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Pregunta {qIndex + 1}
                              </h4>
                              <p className="text-gray-700 text-sm bg-white p-3 rounded border">
                                {question.text}
                              </p>
                            </div>

                            {question.evaluation && (
                              <div className="space-y-4">
                                {/* Score and Summary */}
                                <div className="flex items-start gap-4">
                                  <div className="text-center">
                                    <div className={`text-xl font-bold ${getScoreColor(question.evaluation.score)}`}>
                                      {question.evaluation.score}/10
                                    </div>
                                    <div className="text-xs text-gray-600">Puntuación</div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700">{question.evaluation.summary}</p>
                                  </div>
                                </div>

                                {/* Transcript */}
                                {question.transcript && (
                                  <div className="bg-white p-3 rounded border">
                                    <h5 className="font-medium text-gray-900 mb-2 text-sm">Tu respuesta:</h5>
                                    <p className="text-sm text-gray-700">{question.transcript}</p>
                                  </div>
                                )}

                                {/* Feedback */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  {/* Strengths */}
                                  <div>
                                    <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3" />
                                      Fortalezas
                                    </h5>
                                    <ul className="space-y-1">
                                      {question.evaluation.strengths.map((strength, sIndex) => (
                                        <li key={sIndex} className="text-gray-700 flex items-start gap-2">
                                          <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <span className="text-xs">{strength}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Improvements */}
                                  <div>
                                    <h5 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      Mejoras
                                    </h5>
                                    <ul className="space-y-1">
                                      {question.evaluation.improvements.map((improvement, iIndex) => (
                                        <li key={iIndex} className="text-gray-700 flex items-start gap-2">
                                          <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <span className="text-xs">{improvement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Recommendations */}
                                  <div>
                                    <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                                      <Lightbulb className="h-3 w-3" />
                                      Recomendaciones
                                    </h5>
                                    <ul className="space-y-1">
                                      {question.evaluation.recommendations.map((recommendation, rIndex) => (
                                        <li key={rIndex} className="text-gray-700 flex items-start gap-2">
                                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <span className="text-xs">{recommendation}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/interview-simulation">
            <Button>
              <PlayCircle className="h-4 w-4 mr-2" />
              Nueva Simulación
            </Button>
          </Link>
          <Button onClick={refreshInterviews} variant="outline">
            <History className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  );
}
