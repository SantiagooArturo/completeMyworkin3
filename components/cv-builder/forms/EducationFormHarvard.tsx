'use client';

import React, { useState } from 'react';
import { Education } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GraduationCap, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface EducationFormHarvardProps {
  education: Education[];
  onUpdate: (education: Education[]) => void;
}

export default function EducationFormHarvard({ education, onUpdate }: EducationFormHarvardProps) {
  const [achievements, setAchievements] = useState<{ [key: string]: string }>({});
  const [courses, setCourses] = useState<{ [key: string]: string }>({});

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      achievements: [],
      honors: '',
      relevantCourses: []
    };
    onUpdate([...education, newEducation]);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    const updated = education.map(edu => 
      edu.id === id ? { ...edu, ...updates } : edu
    );
    onUpdate(updated);
  };

  const removeEducation = (id: string) => {
    onUpdate(education.filter(edu => edu.id !== id));
  };

  const addAchievement = (eduId: string) => {
    const achievementText = achievements[eduId]?.trim();
    if (!achievementText) return;

    const edu = education.find(e => e.id === eduId);
    if (edu) {
      const updatedAchievements = [...(edu.achievements || []), achievementText];
      updateEducation(eduId, { achievements: updatedAchievements });
      setAchievements({ ...achievements, [eduId]: '' });
    }
  };

  const removeAchievement = (eduId: string, index: number) => {
    const edu = education.find(e => e.id === eduId);
    if (edu) {
      const updatedAchievements = edu.achievements?.filter((_, i) => i !== index) || [];
      updateEducation(eduId, { achievements: updatedAchievements });
    }
  };

  const addCourse = (eduId: string) => {
    const courseText = courses[eduId]?.trim();
    if (!courseText) return;

    const edu = education.find(e => e.id === eduId);
    if (edu) {
      const updatedCourses = [...(edu.relevantCourses || []), courseText];
      updateEducation(eduId, { relevantCourses: updatedCourses });
      setCourses({ ...courses, [eduId]: '' });
    }
  };

  const removeCourse = (eduId: string, index: number) => {
    const edu = education.find(e => e.id === eduId);
    if (edu) {
      const updatedCourses = edu.relevantCourses?.filter((_, i) => i !== index) || [];
      updateEducation(eduId, { relevantCourses: updatedCourses });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[#028bbf]" />
          Formación Académica - Formato Harvard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.map((edu) => (
          <Card key={edu.id} className="border-l-4 border-l-[#028bbf]">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">Educación #{education.indexOf(edu) + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(edu.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`institution-${edu.id}`}>Institución *</Label>
                  <Input
                    id={`institution-${edu.id}`}
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    placeholder="Ej: Universidad Nacional Mayor de San Marcos"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`degree-${edu.id}`}>Título/Grado *</Label>
                  <Input
                    id={`degree-${edu.id}`}
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    placeholder="Ej: Licenciatura en Ingeniería de Sistemas"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`fieldOfStudy-${edu.id}`}>Campo de Estudio</Label>
                <Input
                  id={`fieldOfStudy-${edu.id}`}
                  value={edu.fieldOfStudy}
                  onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                  placeholder="Ej: Ingeniería de Sistemas e Informática"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`startDate-${edu.id}`} className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Fecha Inicio *
                  </Label>
                  <Input
                    id={`startDate-${edu.id}`}
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`endDate-${edu.id}`} className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Fecha Fin
                  </Label>
                  <Input
                    id={`endDate-${edu.id}`}
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                    disabled={edu.current}
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id={`current-${edu.id}`}
                    checked={edu.current}
                    onCheckedChange={(checked) => {
                      updateEducation(edu.id, { 
                        current: checked as boolean,
                        endDate: checked ? '' : edu.endDate
                      });
                    }}
                  />
                  <Label htmlFor={`current-${edu.id}`} className="text-sm">
                    En curso
                  </Label>
                </div>
              </div>

              {/* Campos específicos del formato Harvard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`gpa-${edu.id}`}>GPA / Promedio</Label>
                  <Input
                    id={`gpa-${edu.id}`}
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                    placeholder="Ej: 3.8/4.0 o 16.5/20"
                  />
                </div>

                <div>
                  <Label htmlFor={`honors-${edu.id}`}>Honores / Distinciones</Label>
                  <Input
                    id={`honors-${edu.id}`}
                    value={edu.honors || ''}
                    onChange={(e) => updateEducation(edu.id, { honors: e.target.value })}
                    placeholder="Ej: Magna Cum Laude, Tercio Superior"
                  />
                </div>
              </div>

              {/* Logros Académicos */}
              <div>
                <Label>Logros Académicos</Label>
                <div className="space-y-2">
                  {edu.achievements && edu.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1 text-sm">{achievement}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAchievement(edu.id, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={achievements[edu.id] || ''}
                      onChange={(e) => setAchievements({ ...achievements, [edu.id]: e.target.value })}
                      placeholder="Ej: Beca de excelencia académica, Mejor estudiante de la promoción"
                      onKeyPress={(e) => e.key === 'Enter' && addAchievement(edu.id)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAchievement(edu.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cursos Relevantes */}
              <div>
                <Label>Cursos Relevantes</Label>
                <div className="space-y-2">
                  {edu.relevantCourses && edu.relevantCourses.map((course, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1 text-sm">{course}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCourse(edu.id, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={courses[edu.id] || ''}
                      onChange={(e) => setCourses({ ...courses, [edu.id]: e.target.value })}
                      placeholder="Ej: Algoritmos y Estructuras de Datos, Base de Datos Avanzada"
                      onKeyPress={(e) => e.key === 'Enter' && addCourse(edu.id)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCourse(edu.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEducation}
          className="w-full border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Formación Académica
        </Button>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Formato Harvard:</strong> Incluye detalles académicos específicos como GPA, 
                honores, cursos relevantes y logros académicos para destacar tu excelencia educativa.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
