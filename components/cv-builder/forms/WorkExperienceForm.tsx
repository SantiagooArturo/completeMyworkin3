'use client';

import React from 'react';
import { WorkExperience } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Briefcase, Calendar, MapPin, Building, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cvAIEnhancementService } from '@/services/cvAIEnhancementService';
import { useState } from 'react';
import MonthPicker from '@/components/ui/month-picker';
import DatePicker from '@/components/ui/date-picker';

interface WorkExperienceFormProps {
  workExperience: WorkExperience[];
  onUpdate: (workExperience: WorkExperience[]) => void;
}

export default function WorkExperienceForm({ workExperience, onUpdate }: WorkExperienceFormProps) {
  const [enhancingDescription, setEnhancingDescription] = useState<number | null>(null);
  const [suggestingAchievements, setSuggestingAchievements] = useState<number | null>(null);
  const [enhancingPosition, setEnhancingPosition] = useState<number | null>(null);
  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: '',
      achievements: [],
      sections: []
    };
    onUpdate([...workExperience, newExperience]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = workExperience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    onUpdate(updated);
  };

  // ✅ NUEVA: Función para manejar el estado current de forma segura
  const updateCurrentStatus = (index: number, checked: boolean) => {
    const updated = workExperience.map((exp, i) => 
      i === index ? { 
        ...exp, 
        current: checked,
        endDate: checked ? '' : exp.endDate
      } : exp
    );
    
    console.log('🔍 Work experience current status actualizado:', { index, checked, result: updated[index] });
    onUpdate(updated);
  };

  const removeWorkExperience = (index: number) => {
    const updated = workExperience.filter((_, i) => i !== index);
    onUpdate(updated);
  };
  const addAchievement = (index: number) => {
    const updated = workExperience.map((exp, i) => 
      i === index ? { 
        ...exp, 
        achievements: [...exp.achievements, ''] 
      } : exp
    );
    onUpdate(updated);
  };

  const updateAchievement = (expIndex: number, achievementIndex: number, value: string) => {
    const updated = workExperience.map((exp, i) => 
      i === expIndex ? {
        ...exp,
        achievements: exp.achievements.map((ach, j) => 
          j === achievementIndex ? value : ach
        )
      } : exp
    );
    onUpdate(updated);
  };

  const removeAchievement = (expIndex: number, achievementIndex: number) => {
    const updated = workExperience.map((exp, i) => 
      i === expIndex ? {
        ...exp,
        achievements: exp.achievements.filter((_, j) => j !== achievementIndex)
      } : exp
    );
    onUpdate(updated);
  };

  // ✅ NUEVO: Funciones para manejar subsecciones
  const addSection = (expIndex: number) => {
    const updated = workExperience.map((exp, i) => 
      i === expIndex ? {
        ...exp,
        sections: [...(exp.sections || []), { title: '', achievements: [''] }]
      } : exp
    );
    onUpdate(updated);
  };

  const updateSectionTitle = (expIndex: number, sectionIndex: number, title: string) => {
    const updated = workExperience.map((exp, i) => 
      i === expIndex ? {
        ...exp,
        sections: exp.sections?.map((section, j) => 
          j === sectionIndex ? { ...section, title } : section
        ) || []
      } : exp
    );
    onUpdate(updated);
  };

  const addSectionAchievement = (expIndex: number, sectionIndex: number) => {
    const updated = workExperience.map((exp, i) => 
      i === expIndex ? {
        ...exp,
        sections: exp.sections?.map((section, j) => 
          j === sectionIndex ? { 
            ...section, 
            achievements: [...section.achievements, ''] 
          } : section
        ) || []
      } : exp
    );
    onUpdate(updated);
  };

  const updateSectionAchievement = (expIndex: number, sectionIndex: number, achievementIndex: number, value: string) => {
    const updated = workExperience.map((exp, i) => 
      i === expIndex ? {
        ...exp,
        sections: exp.sections?.map((section, j) => 
          j === sectionIndex ? {
            ...section,
            achievements: section.achievements.map((ach, k) => 
              k === achievementIndex ? value : ach
            )
          } : section
        ) || []
      } : exp
    );
    onUpdate(updated);
  };

  const removeSectionAchievement = (expIndex: number, sectionIndex: number, achievementIndex: number) => {
    const updated = workExperience.map((exp, i) => 
      i === expIndex ? {
        ...exp,
        sections: exp.sections?.map((section, j) => 
          j === sectionIndex ? {
            ...section,
            achievements: section.achievements.filter((_, k) => k !== achievementIndex)
          } : section
        ) || []
      } : exp
    );
    onUpdate(updated);
  };

  const removeSection = (expIndex: number, sectionIndex: number) => {
    const updated = workExperience.map((exp, i) => 
      i === expIndex ? {
        ...exp,
        sections: exp.sections?.filter((_, j) => j !== sectionIndex) || []
      } : exp
    );
    onUpdate(updated);
  };

  const enhanceDescriptionWithAI = async (index: number) => {
    const exp = workExperience[index];
    if (!exp.description || exp.description.trim().length < 5) {
      alert('Por favor, escribe una descripción inicial (mínimo 5 caracteres) antes de mejorarla con IA.');
      return;
    }
    
    try {
      setEnhancingDescription(index);
      const enhancedDescription = await cvAIEnhancementService.enhanceJobDescriptions(
        exp.description,
        exp.position || 'profesional',
        exp.company
      );
      
      updateWorkExperience(index, 'description', enhancedDescription);
    } catch (error) {
      console.error('Error al mejorar la descripción:', error);
      alert('No se pudo mejorar la descripción. Inténtalo más tarde o verifica tu conexión.');
    } finally {
      setEnhancingDescription(null);
    }
  };

  const suggestAchievementsWithAI = async (index: number) => {
    const exp = workExperience[index];
    if (!exp.description || exp.description.trim().length < 10) {
      alert('Por favor, escribe una descripción del puesto (mínimo 10 caracteres) antes de sugerir logros.');
      return;
    }
    
    try {
      setSuggestingAchievements(index);
      const suggestedAchievements = await cvAIEnhancementService.suggestAchievements(
        exp.description,
        exp.position || 'profesional',
        exp.company
      );
      
      // Filtrar logros que ya existen
      const newAchievements = suggestedAchievements.filter(suggested => 
        !exp.achievements.some(existing => 
          existing.toLowerCase().includes(suggested.toLowerCase().substring(0, 20))
        )
      );
      
      const updatedExperience = workExperience.map((exp, i) => 
        i === index ? { 
          ...exp, 
          achievements: [...exp.achievements, ...newAchievements] 
        } : exp
      );
      
      onUpdate(updatedExperience);
      
      if (newAchievements.length === 0) {
        alert('La IA no encontró nuevos logros para sugerir. Intenta ampliar la descripción del puesto.');
      }
    } catch (error) {
      console.error('Error al sugerir logros:', error);
      alert('No se pudieron sugerir logros. Inténtalo más tarde o verifica tu conexión.');
    } finally {
      setSuggestingAchievements(null);
    }
  };

  const enhancePositionWithAI = async (index: number) => {
    const exp = workExperience[index];
    if (!exp.position || exp.position.trim().length < 3) {
      alert('Por favor, escribe un título de puesto antes de mejorarlo.');
      return;
    }
    
    try {
      setEnhancingPosition(index);
      
      // Mejorar el título del puesto basado en patrones comunes
      const enhancedPosition = enhancePositionLocal(exp.position);
      updateWorkExperience(index, 'position', enhancedPosition);
    } catch (error) {
      console.error('Error al mejorar el puesto:', error);
    } finally {
      setEnhancingPosition(null);
    }
  };

  const enhancePositionLocal = (position: string): string => {
    const positionEnhancements: { [key: string]: string } = {
      'desarrollador': 'Desarrollador de Software',
      'programador': 'Desarrollador Full Stack',
      'analista': 'Analista de Sistemas',
      'diseñador': 'Diseñador UX/UI',
      'vendedor': 'Ejecutivo de Ventas',
      'asistente': 'Asistente Administrativo',
      'practicante': 'Practicante Profesional',
      'intern': 'Practicante Profesional',
      'junior': 'Desarrollador Junior',
      'senior': 'Desarrollador Senior'
    };

    const positionLower = position.toLowerCase();
    
    for (const [key, enhancement] of Object.entries(positionEnhancements)) {
      if (positionLower.includes(key)) {
        return enhancement;
      }
    }
    
    // Si no encuentra coincidencia, capitalizar correctamente
    return position.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[#028bbf]" />
          Experiencia Laboral - Formato Harvard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Harvard Format Guide */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-amber-900 mb-2">🎓 Formato Harvard - Experiencia:</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Lista las experiencias en orden cronológico inverso (más reciente primero)</li>
            <li>• Incluye el nombre completo de la empresa y tu título exacto</li>
            <li>• Usa verbos de acción en tiempo pasado (ej: "Lideré", "Desarrollé")</li>
            <li>• Cuantifica logros con métricas específicas (%, $, cantidades)</li>
            <li>• Enfatiza resultados e impacto, no solo responsabilidades</li>
          </ul>
        </div>

        <div className="space-y-4">
          {workExperience.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay experiencia laboral agregada</p>
              <p className="text-sm">Agrega tu experiencia profesional más relevante</p>
            </div>
          ) : (
            <div className="space-y-6">
              {workExperience.map((exp, index) => (
                <div key={exp.id} className="border-l-4 border-l-[#028bbf] border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">
                      {exp.position || `Experiencia ${index + 1}`}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkExperience(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Empresa *
                      </Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                        placeholder="Ej: Microsoft Corporation"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Cargo *
                      </Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                        placeholder="Ej: Software Development Engineer II"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  {/* Descripción breve de la empresa */}
                  <div className="mt-4">
                    <Label className="flex items-center gap-2">
                      <span className="font-medium">Descripción de la empresa</span>
                    </Label>
                    <Input
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                      placeholder="Ej: La Fintech más grande del Perú con más de 14 millones de usuarios."
                      className="mt-1"
                      maxLength={180}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* COLUMNA 1: Fechas - Más espacio */}
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fecha de Inicio *
                        </Label>                        <DatePicker
                          value={exp.startDate}
                          onChange={(date) => updateWorkExperience(index, 'startDate', date)}
                          placeholder="Selecciona fecha de inicio"
                          className="mt-1"
                          required
                          maxDate={exp.endDate || undefined}
                        />
                      </div>
                      
                      <div>
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fecha de Fin
                        </Label>                        <DatePicker
                          value={exp.endDate}
                          onChange={(date) => updateWorkExperience(index, 'endDate', date)}
                          placeholder="Selecciona fecha de fin"
                          disabled={exp.current}
                          className="mt-1"
                          minDate={exp.startDate || undefined}
                        />
                      </div>
                    </div>

                    {/* COLUMNA 2: Ubicación + Trabajo actual */}
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Ubicación *
                        </Label>
                        <Input
                          value={exp.location}
                          onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                          placeholder="Ej: Lima, Perú"
                          className="mt-1"
                          required
                        />
                      </div>

                      {/* Checkbox "Trabajo actual" */}
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id={`current-job-${index}`}
                          checked={exp.current}
                          onCheckedChange={(checked) => updateCurrentStatus(index, checked as boolean)}
                        />
                        <Label htmlFor={`current-job-${index}`} className="text-sm cursor-pointer">
                          Trabajo actual
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Logros y Subsecciones */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <Label>Logros y Responsabilidades *</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => suggestAchievementsWithAI(index)}
                          disabled={suggestingAchievements === index}
                          className="flex items-center gap-1 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                        >
                          {suggestingAchievements === index ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-700"></div>
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          {suggestingAchievements === index ? 'Sugiriendo...' : 'Sugerir con IA'}
                        </Button>
                      </div>
                    </div>

                    {/* Logros generales */}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-medium text-gray-700">Logros Generales</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addAchievement(index)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                        {exp.achievements.map((achievement: string, achIndex: number) => (
                          <div key={achIndex} className="flex gap-2 mb-2">
                            <Input
                              value={achievement}
                              onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                              placeholder="Ej: Aumenté las ventas en un 45% implementando una nueva estrategia de marketing digital"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAchievement(index, achIndex)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Subsecciones (ej: Recursos Humanos, Finanzas) */}
                    {exp.sections && exp.sections.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Subsecciones por Área</Label>
                        {exp.sections.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                              <Input
                                value={section.title}
                                onChange={(e) => updateSectionTitle(index, sectionIndex, e.target.value)}
                                placeholder="Ej: Recursos Humanos, Finanzas, Marketing"
                                className="font-medium bg-white"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSection(index, sectionIndex)}
                                className="text-red-600 ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              {section.achievements.map((achievement, achIndex) => (
                                <div key={achIndex} className="flex gap-2">
                                  <Input
                                    value={achievement}
                                    onChange={(e) => updateSectionAchievement(index, sectionIndex, achIndex, e.target.value)}
                                    placeholder="Logro específico de esta área..."
                                    className="flex-1 bg-white"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSectionAchievement(index, sectionIndex, achIndex)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addSectionAchievement(index, sectionIndex)}
                                className="w-full border-dashed"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar logro a {section.title || 'esta área'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botones para agregar contenido */}
                    <div className="flex gap-2">
                      {(!exp.achievements || exp.achievements.length === 0) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addAchievement(index)}
                          className="border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Logro General
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSection(index)}
                        className="border-dashed border-[#028bbf] text-[#028bbf]"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Subsección
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={addWorkExperience}
            variant="outline"
            className="w-full border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Experiencia Laboral
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
