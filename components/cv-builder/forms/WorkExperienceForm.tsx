'use client';

import React from 'react';
import { WorkExperience } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Briefcase, Calendar, MapPin, Building, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cvAIEnhancementService } from '@/services/cvAIEnhancementService';
import { useState } from 'react';

interface WorkExperienceFormProps {
  workExperience: WorkExperience[];
  onUpdate: (workExperience: WorkExperience[]) => void;
}

export default function WorkExperienceForm({ workExperience, onUpdate }: WorkExperienceFormProps) {
  const [enhancingDescription, setEnhancingDescription] = useState<number | null>(null);
  const [suggestingAchievements, setSuggestingAchievements] = useState<number | null>(null);

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
      achievements: []
    };
    onUpdate([...workExperience, newExperience]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = workExperience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
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

  const enhanceDescriptionWithAI = async (index: number) => {
    const exp = workExperience[index];
    if (!exp.description) {
      alert('Por favor, escribe una descripción inicial antes de mejorarla con IA.');
      return;
    }
    
    try {
      setEnhancingDescription(index);
      const enhancedDescription = await cvAIEnhancementService.enhanceJobDescriptions(
        exp.description,
        exp.position
      );
      
      updateWorkExperience(index, 'description', enhancedDescription);
    } catch (error) {
      console.error('Error al mejorar la descripción:', error);
      alert('No se pudo mejorar la descripción. Por favor, inténtalo más tarde.');
    } finally {
      setEnhancingDescription(null);
    }
  };

  const suggestAchievementsWithAI = async (index: number) => {
    const exp = workExperience[index];
    if (!exp.description) {
      alert('Por favor, escribe una descripción del puesto antes de sugerir logros.');
      return;
    }
    
    try {
      setSuggestingAchievements(index);
      const suggestedAchievements = await cvAIEnhancementService.suggestAchievements(
        exp.description,
        exp.position
      );
      
      const updatedExperience = workExperience.map((exp, i) => 
        i === index ? { 
          ...exp, 
          achievements: [...exp.achievements, ...suggestedAchievements] 
        } : exp
      );
      
      onUpdate(updatedExperience);
    } catch (error) {
      console.error('Error al sugerir logros:', error);
      alert('No se pudieron sugerir logros. Por favor, inténtalo más tarde.');
    } finally {
      setSuggestingAchievements(null);
    }
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de Inicio *
                      </Label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de Fin
                      </Label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                        disabled={exp.current}
                        className="mt-1"
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`current-job-${index}`}
                          checked={exp.current}
                          onCheckedChange={(checked) => {
                            updateWorkExperience(index, 'current', checked);
                            if (checked) {
                              updateWorkExperience(index, 'endDate', '');
                            }
                          }}
                        />
                        <Label htmlFor={`current-job-${index}`} className="text-sm">
                          Trabajo actual
                        </Label>
                      </div>
                    </div>

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
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <Label>Descripción del Cargo *</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => enhanceDescriptionWithAI(index)}
                        disabled={enhancingDescription === index}
                        className="flex items-center gap-1 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                      >
                        {enhancingDescription === index ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-700"></div>
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        {enhancingDescription === index ? 'Mejorando...' : 'Mejorar con IA'}
                      </Button>
                    </div>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                      placeholder="Describe tus responsabilidades principales usando verbos de acción. Ej: 'Lideré un equipo de 5 desarrolladores...'"
                      rows={3}
                      className="mt-1 resize-none"
                      required
                    />
                  </div>

                  {/* Logros Cuantificables */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <Label>Logros Cuantificables *</Label>
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
