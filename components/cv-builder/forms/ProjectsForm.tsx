'use client';

import React, { useState } from 'react';
import { Project } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FolderOpen, Link as LinkIcon, Calendar, Sparkles, Loader2 } from 'lucide-react';
import MonthPicker from '@/components/ui/month-picker';
import { cvAIEnhancementService } from '@/services/cvAIEnhancementService';
import { Checkbox } from '@/components/ui/checkbox';

interface ProjectsFormProps {
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
}

export default function ProjectsForm({ projects, onUpdate }: ProjectsFormProps) {
  const [optimizingIndex, setOptimizingIndex] = useState<number | null>(null);
  const [suggestingHighlightsIndex, setSuggestingHighlightsIndex] = useState<number | null>(null);

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: '',
      startDate: '',
      endDate: '',
      current: false,
      url: '',
      highlights: []
    };
    onUpdate([...projects, newProject]);
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[] | boolean) => {
    const updatedProjects = projects.map((project, i) => {
      if (i === index) {
        if (field === 'current') {
          return { ...project, [field]: Boolean(value) };
        }
        return { ...project, [field]: value };
      }
      return project;
    });
    onUpdate(updatedProjects);
  };

  // ✅ Nueva función para manejar el estado current de forma segura
  const updateCurrentStatus = (index: number, checked: boolean) => {
    const updatedProjects = projects.map((project, i) => 
      i === index ? { 
        ...project, 
        current: checked,
        endDate: checked ? '' : project.endDate
      } : project
    );
    
    console.log('🔍 Project current status actualizado:', { index, checked, result: updatedProjects[index] });
    onUpdate(updatedProjects);
  };

  const removeProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    onUpdate(updatedProjects);
  };

  const updateTechnologies = (index: number, value: string) => {
    updateProject(index, 'technologies', value);
  };

  const updateHighlights = (index: number, highlightIndex: number, value: string) => {
    const updatedProjects = projects.map((project, i) => {
      if (i === index) {
        const updatedHighlights = [...(project.highlights || [])];
        updatedHighlights[highlightIndex] = value;
        return { ...project, highlights: updatedHighlights };
      }
      return project;
    });
    onUpdate(updatedProjects);
  };

  const addHighlight = (index: number) => {
    const updatedProjects = projects.map((project, i) => {
      if (i === index) {
        return { 
          ...project, 
          highlights: [...(project.highlights || []), ''] 
        };
      }
      return project;
    });
    onUpdate(updatedProjects);
  };

  const removeHighlight = (index: number, highlightIndex: number) => {
    const updatedProjects = projects.map((project, i) => {
      if (i === index) {
        const updatedHighlights = (project.highlights || []).filter((_, hi) => hi !== highlightIndex);
        return { ...project, highlights: updatedHighlights };
      }
      return project;
    });
    onUpdate(updatedProjects);
  };

  // Nueva función para sugerir logros con IA usando el servicio
  const suggestHighlightsWithAI = async (index: number) => {
    const project = projects[index];
    if (!project.name || !project.description || project.description.length < 10) {
      alert('Completa el nombre y una descripción detallada del proyecto antes de sugerir logros con IA.');
      return;
    }

    setSuggestingHighlightsIndex(index);
    
    try {
      console.log('🎯 Sugiriendo logros para proyecto:', project.name);
      
      // Usar el servicio de AI Enhancement para consistencia
      const suggestedHighlights = await cvAIEnhancementService.suggestProjectHighlights(
        project.name,
        project.description,
        project.technologies || ''
      );

      if (suggestedHighlights.length > 0) {
        // Agregar los logros sugeridos a los existentes, evitando duplicados
        const updatedProjects = projects.map((proj, i) => {
          if (i === index) {
            const currentHighlights = proj.highlights || [];
            
            // Filtrar logros duplicados de manera más inteligente
            const newHighlights = suggestedHighlights.filter((highlight: string) => 
              !currentHighlights.some(existing => {
                const existingWords = existing.toLowerCase().split(' ');
                const highlightWords = highlight.toLowerCase().split(' ');
                
                // Si hay más del 60% de palabras en común, considerar duplicado
                const commonWords = existingWords.filter(word => 
                  word.length > 3 && highlightWords.includes(word)
                );
                
                return commonWords.length > Math.min(existingWords.length, highlightWords.length) * 0.6;
              })
            );

            console.log(`✅ Agregando ${newHighlights.length} nuevos logros únicos`);
            
            return { 
              ...proj, 
              highlights: [...currentHighlights, ...newHighlights]
            };
          }
          return proj;
        });
        onUpdate(updatedProjects);
      } else {
        console.warn('⚠️ No se recibieron logros sugeridos');
        alert('No se pudieron generar logros específicos para este proyecto. Intenta con una descripción más detallada.');
      }
      
    } catch (error) {
      console.error('❌ Error al sugerir logros:', error);
      alert(`No se pudieron sugerir logros: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSuggestingHighlightsIndex(null);
    }
  };

  // Función mejorada para optimizar proyecto completo con IA (descripción + logros)
  const optimizeProjectWithAI = async (index: number) => {
    const project = projects[index];
    if (!project.name || !project.description || project.description.length < 5) {
      alert('Completa el nombre y una descripción inicial antes de optimizar con IA.');
      return;
    }

    setOptimizingIndex(index);
    
    try {
      console.log('🚀 Iniciando optimización completa del proyecto:', project.name);
      
      // 1. Optimizar descripción primero usando streaming
      console.log('📝 Optimizando descripción...');
      const descriptionResponse = await fetch('/api/cv/optimize-project-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: project.description,
          projectName: project.name,
          technologies: project.technologies || ''
        })
      });

      if (!descriptionResponse.ok) {
        const errorData = await descriptionResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${descriptionResponse.status}: ${descriptionResponse.statusText}`);
      }

      // Manejar respuesta de descripción (streaming)
      let optimizedDescription = '';
      const contentType = descriptionResponse.headers.get('content-type');
      
      if (contentType?.includes('text/plain') && descriptionResponse.body) {
        // Manejar streaming response de Vercel AI
        const reader = descriptionResponse.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              if (line.startsWith('0:')) {
                try {
                  const content = line.slice(2);
                  const parsed = JSON.parse(content);
                  optimizedDescription += parsed;
                  
                  // Actualizar en tiempo real para mostrar progreso
                  updateProject(index, 'description', optimizedDescription);
                } catch (parseError) {
                  const content = line.slice(2).replace(/^"|"$/g, '');
                  optimizedDescription += content;
                  updateProject(index, 'description', optimizedDescription);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        // Respuesta JSON normal (fallback)
        const data = await descriptionResponse.json();
        optimizedDescription = data.description || data.text || project.description;
        updateProject(index, 'description', optimizedDescription);
      }

      console.log('✅ Descripción optimizada exitosamente');

      // 2. Sugerir logros basados en la descripción optimizada
      console.log('🎯 Sugiriendo logros...');
      const highlightsResponse = await fetch('/api/cv/suggest-project-highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: optimizedDescription || project.description,
          projectName: project.name,
          technologies: project.technologies || ''
        })
      });

      let suggestedHighlights: string[] = [];
      if (highlightsResponse.ok) {
        const highlightsData = await highlightsResponse.json();
        suggestedHighlights = highlightsData.highlights || [];
        console.log('✅ Logros sugeridos:', suggestedHighlights.length);
      } else {
        console.warn('⚠️ No se pudieron obtener sugerencias de logros, pero la descripción se optimizó');
      }

      // 3. Actualizar el proyecto con descripción optimizada y logros sugeridos
      const updatedProjects = projects.map((proj, i) => {
        if (i === index) {
          const currentHighlights = proj.highlights || [];
          
          // Filtrar logros duplicados
          const newHighlights = suggestedHighlights.filter(highlight => 
            !currentHighlights.some(existing => 
              existing.toLowerCase().includes(highlight.toLowerCase().substring(0, 20)) ||
              highlight.toLowerCase().includes(existing.toLowerCase().substring(0, 20))
            )
          );

          console.log(`💡 Agregando ${newHighlights.length} nuevos logros`);

          return { 
            ...proj, 
            description: optimizedDescription.trim() || proj.description,
            highlights: [...currentHighlights, ...newHighlights]
          };
        }
        return proj;
      });
      
      onUpdate(updatedProjects);
      console.log('🎉 Optimización completa del proyecto finalizada');
      
    } catch (error) {
      console.error('❌ Error al optimizar proyecto:', error);
      alert(`No se pudo optimizar el proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setOptimizingIndex(null);
    }
  };

  // Nueva función para optimizar descripción con IA usando streaming
  const optimizeDescriptionWithAI = async (index: number) => {
    const project = projects[index];
    if (!project.name || !project.description || project.description.length < 5) {
      alert('Completa el nombre y una descripción inicial antes de optimizar con IA.');
      return;
    }

    setOptimizingIndex(index);
    
    try {
      const response = await fetch('/api/cv/optimize-project-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: project.description,
          projectName: project.name,
          technologies: project.technologies || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Verificar si la respuesta es streaming
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/plain')) {
        // Si no es streaming, tratar como respuesta JSON normal
        const data = await response.json();
        updateProject(index, 'description', data.description || data.text || '');
        return;
      }

      // Manejar streaming response usando ReadableStream API
      if (!response.body) {
        throw new Error('No se recibió el stream de respuesta');
      }

      let result = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Procesar el chunk del stream de Vercel AI
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Formato de stream de Vercel AI: "0:"texto""
              try {
                const content = line.slice(2); // Remover "0:"
                const parsed = JSON.parse(content);
                result += parsed;
                
                // Actualizar la descripción en tiempo real
                updateProject(index, 'description', result);
              } catch (parseError) {
                // Si no se puede parsear, agregar directamente
                const content = line.slice(2).replace(/^"|"$/g, '');
                result += content;
                updateProject(index, 'description', result);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Asegurar que tenemos el resultado final limpio
      if (result.trim()) {
        const finalResult = result.trim().replace(/^"|"$/g, ''); // Limpiar comillas
        updateProject(index, 'description', finalResult);
      }
      
    } catch (error) {
      console.error('❌ Error al optimizar descripción:', error);
      alert(`No se pudo optimizar la descripción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setOptimizingIndex(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-[#028bbf]" />
          Proyectos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay proyectos agregados</p>
            <p className="text-sm">Muestra tus proyectos más relevantes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">
                    {project.name || `Proyecto ${index + 1}`}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Nombre del Proyecto *
                    </Label>
                    <Input
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      placeholder="Ej: Sistema de Gestión de Inventarios"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      URL del Proyecto (Opcional)
                    </Label>
                    <Input
                      value={project.url}
                      onChange={(e) => updateProject(index, 'url', e.target.value)}
                      placeholder="https://github.com/usuario/proyecto"
                      className="mt-1"
                    />
                  </div>
                </div>                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Inicio
                    </Label>
                    <MonthPicker
                      value={project.startDate}
                      onChange={(date) => updateProject(index, 'startDate', date)}
                      placeholder="Selecciona mes y año"
                      className="mt-1"
                      maxDate={project.endDate || undefined}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Fin
                    </Label>
                    <MonthPicker
                      value={project.endDate}
                      onChange={(date) => updateProject(index, 'endDate', date)}
                      placeholder="Selecciona mes y año"
                      disabled={project.current}
                      className="mt-1"
                      minDate={project.startDate || undefined}
                    />
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id={`current-project-${index}`}
                        checked={Boolean(project.current)}
                        onCheckedChange={(checked) => updateCurrentStatus(index, checked as boolean)}
                      />
                      <Label htmlFor={`current-project-${index}`} className="text-sm cursor-pointer">
                        Proyecto en curso
                      </Label>
                    </div>
                  </div>
                  
                </div>
                


                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Descripción del Proyecto *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100 hover:text-purple-800"
                        onClick={() => optimizeProjectWithAI(index)}
                        disabled={optimizingIndex === index}
                      >
                        {optimizingIndex === index ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        {optimizingIndex === index ? 'Optimizando proyecto...' : 'Optimizar proyecto con IA'}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    placeholder="Describe el proyecto, tu contribución, los desafíos que resolviste y los resultados obtenidos..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 La optimización con IA mejorará tanto la descripción como sugerirá logros relevantes
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Logros y Destacados del Proyecto</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => suggestHighlightsWithAI(index)}
                        disabled={suggestingHighlightsIndex === index}
                        className="flex items-center gap-1 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                      >
                        {suggestingHighlightsIndex === index ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        {suggestingHighlightsIndex === index ? 'Sugiriendo...' : 'Sugerir con IA'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addHighlight(index)}
                        className="text-[#028bbf] hover:text-[#027ba8] h-6 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar logro
                      </Button>
                    </div>
                  </div>
                  
                  {(project.highlights || []).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg mt-2">
                      <p className="text-sm mb-2">No hay logros agregados</p>
                      <div className="flex justify-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => suggestHighlightsWithAI(index)}
                          disabled={suggestingHighlightsIndex === index}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          Sugerir logros con IA
                        </Button>
                        <span className="text-gray-300">o</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addHighlight(index)}
                          className="text-[#028bbf] hover:text-[#027ba8]"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar manualmente
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {(project.highlights || []).map((highlight, highlightIndex) => (
                        <div key={highlightIndex} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 font-medium min-w-[20px]">
                            {highlightIndex + 1}.
                          </span>
                          <Input
                            value={highlight}
                            onChange={(e) => updateHighlights(index, highlightIndex, e.target.value)}
                            placeholder="Ej: Desarrollé la interfaz que mejoró la experiencia del usuario en un 40%"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHighlight(index, highlightIndex)}
                            className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Los logros con métricas específicas son más impactantes (ej: "mejoré el rendimiento en 30%")
                  </p>
                </div>
                <div className="mt-4">
                  <Label>Herramientas Utilizadas</Label>
                  <Input
                    value={project.technologies}
                    onChange={(e) => updateTechnologies(index, e.target.value)}
                    placeholder="Ej: React, Node.js, MongoDB, AWS (separadas por comas)"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lista las principales tecnologías, lenguajes o herramientas que utilizaste
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={addProject}
          variant="outline"
          className="w-full border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Proyecto
        </Button>

        {/* Consejos específicos para proyectos en formato Harvard */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-orange-900 mb-2">📁 Formato Harvard - Proyectos:</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Incluye proyectos relevantes para el puesto al que aplicas</li>
            <li>• Describe claramente tu rol y contribución específica</li>
            <li>• Menciona los resultados o impacto del proyecto</li>
            <li>• Incluye enlaces a repositorios o demos cuando sea posible</li>
            <li>• Prioriza proyectos recientes y de mayor envergadura</li>
            <li>• Usa verbos de acción para describir tu participación</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}