'use client';

import React, { useState } from 'react';
import { Education } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GraduationCap, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import MonthPicker from '@/components/ui/month-picker';

interface EducationFormProps {
  education: Education[];
  onUpdate: (education: Education[]) => void;
}

export default function EducationForm({ education, onUpdate }: EducationFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '', // requerido por el tipo, pero no se muestra en el formulario
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      achievements: []
    };
    onUpdate([...education, newEducation]);
    setEditingIndex(education.length);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updatedEducation = education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    onUpdate(updatedEducation);
  };

  const removeEducation = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    onUpdate(updatedEducation);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const addAchievement = (index: number) => {
    const updatedEducation = education.map((edu, i) => 
      i === index ? { 
        ...edu, 
        achievements: [...(edu.achievements || []), ''] 
      } : edu
    );
    onUpdate(updatedEducation);
  };

  const updateAchievement = (eduIndex: number, achievementIndex: number, value: string) => {
    const updatedEducation = education.map((edu, i) => 
      i === eduIndex ? {
        ...edu,
        achievements: edu.achievements?.map((ach, j) => 
          j === achievementIndex ? value : ach
        ) || []
      } : edu
    );
    onUpdate(updatedEducation);
  };

  const removeAchievement = (eduIndex: number, achievementIndex: number) => {
    const updatedEducation = education.map((edu, i) => 
      i === eduIndex ? {
        ...edu,
        achievements: edu.achievements?.filter((_, j) => j !== achievementIndex) || []
      } : edu
    );
    onUpdate(updatedEducation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[#028bbf]" />
          Formación Académica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {education.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay formación académica agregada</p>
            <p className="text-sm">Agrega al menos una para tu CV</p>
          </div>
        ) : (
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">
                    {edu.institution || `Educación ${index + 1}`}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Institución *</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="Ej: Universidad Nacional de Ingeniería"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Campo de Estudio</Label>
                    <Input
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                      placeholder="Ej: Ingeniería de Software"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Inicio *
                    </Label>
                    <MonthPicker
                      value={edu.startDate}
                      onChange={(date) => updateEducation(index, 'startDate', date)}
                      placeholder="Selecciona fecha de inicio"
                      className="mt-1"
                      required
                      maxDate={edu.endDate || undefined}
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Fin
                    </Label>
                    <MonthPicker
                      value={edu.endDate}
                      onChange={(date) => updateEducation(index, 'endDate', date)}
                      placeholder="Selecciona fecha de fin"
                      disabled={edu.current}
                      className="mt-1"
                      minDate={edu.startDate || undefined}
                    />
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id={`current-${index}`}
                        checked={edu.current}
                        onCheckedChange={(checked) => {
                          updateEducation(index, 'current', checked);
                          if (checked) {
                            updateEducation(index, 'endDate', '');
                          }
                        }}
                      />
                      <Label htmlFor={`current-${index}`} className="text-sm">
                        Actualmente estudiando
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Logros y Actividades */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Logros y Actividades Relevantes</Label>
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
                  {edu.achievements?.map((achievement, achIndex) => (
                    <div key={achIndex} className="flex gap-2 mb-2">
                      <Input
                        value={achievement}
                        onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                        placeholder="Ej: Presidente del centro de estudiantes"
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
          onClick={addEducation}
          variant="outline"
          className="w-full border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Formación Académica
        </Button>

        {/* Consejos específicos para educación en formato Harvard */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-yellow-900 mb-2">📚 Formato Harvard - Educación:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Lista la educación en orden cronológico inverso (más reciente primero)</li>
            <li>• Incluye el nombre completo de la institución</li>
            <li>• Especifica el tipo de título y campo de estudio</li>
            <li>• Menciona honores académicos si los tienes</li>
            <li>• Para estudios en curso, indica "Esperado: [fecha]"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
