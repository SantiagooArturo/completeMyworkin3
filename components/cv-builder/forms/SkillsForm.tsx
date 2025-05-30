'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Wrench, Sparkles } from 'lucide-react';
import { OpenAIService } from '@/services/openaiService';


const HarvardSkillsGuide = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
      <h4 className="font-medium text-amber-900 mb-2">🎓 Formato Harvard - Habilidades:</h4>
      <ul className="text-sm text-amber-800 space-y-1">
        <li>• Clasifica las habilidades en categorías claras y relevantes</li>
        <li>• Prioriza las habilidades más pertinentes para tu campo</li>
        <li>• Usa verbos de acción y términos específicos del sector</li>
        <li>• Demuestra progresión y dominio con niveles claros</li>
        <li>• Incluye tanto habilidades técnicas como transferibles</li>
        <li>• Mantén la objetividad en la evaluación de niveles</li>
        <li>• Relaciona las habilidades con logros concretos</li>
      </ul>
    </div>
  );
};

interface SkillsFormProps {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
}

export default function SkillsForm({ skills, onUpdate }: SkillsFormProps) {
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);

  const skillLevels = [
    { value: 'Básico', label: 'Conocimiento Básico', description: 'Comprensión fundamental de conceptos' },
    { value: 'Intermedio', label: 'Competencia Práctica', description: 'Aplicación efectiva en proyectos' },
    { value: 'Avanzado', label: 'Dominio Profesional', description: 'Experiencia sustancial y liderazgo' },
    { value: 'Experto', label: 'Experticia Reconocida', description: 'Autoridad en la materia' }
  ];

  const skillCategories = [
    { value: 'Technical', label: 'Competencias Técnicas', description: 'Habilidades específicas de la profesión' },
    { value: 'Analytical', label: 'Habilidades Analíticas', description: 'Capacidad de análisis y resolución' },
    { value: 'Leadership', label: 'Liderazgo y Gestión', description: 'Dirección y gestión de equipos' },
    { value: 'Communication', label: 'Comunicación', description: 'Habilidades interpersonales' },
    { value: 'Research', label: 'Investigación', description: 'Metodología y análisis académico' }
  ];

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: '',
      level: 'Intermedio',
      category: 'Technical',
    };
    onUpdate([...skills, newSkill]);
  };

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onUpdate(updatedSkills);
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    onUpdate(updatedSkills);
  };

  const suggestSkillsWithAI = async () => {
    try {
      setIsSuggestingSkills(true);
      const skillNames = skills.map(skill => skill.name);
      const suggestions = await OpenAIService.suggestSkills('harvard', skillNames);
      
      if (typeof suggestions === 'string') {
        const suggestedSkillNames = suggestions.split('\n')
          .map(s => s.trim())
          .filter(s => s && !skillNames.includes(s));

        const newSkills: Skill[] = suggestedSkillNames.map(name => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name,
          level: 'Intermedio',
          category: 'Technical'
        }));
        
        onUpdate([...skills, ...newSkills]);
      }
    } catch (error) {
      console.error('Error al sugerir habilidades:', error);
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#028bbf]" />
          Habilidades - Formato Harvard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay habilidades agregadas</p>
            <p className="text-sm">Agrega tus habilidades profesionales siguiendo el formato Harvard</p>
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <Input
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder="Ej: Análisis de Datos, Metodología de Investigación"
                      className="font-medium"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Categoría</Label>
                    <Select
                      value={skill.category}
                      onValueChange={(value) => updateSkill(index, 'category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div>
                              <div className="font-medium">{cat.label}</div>
                              <div className="text-xs text-gray-500">{cat.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Nivel</Label>
                    <Select
                      value={skill.level}
                      onValueChange={(value) => updateSkill(index, 'level', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs text-gray-500">{level.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={addSkill}
            variant="outline"
            className="flex-1 border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Habilidad
          </Button>
          
          <Button
            onClick={suggestSkillsWithAI}
            disabled={isSuggestingSkills}
            variant="outline"
            className="flex-1 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
          >
            {isSuggestingSkills ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700 mr-2"></div>
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isSuggestingSkills ? 'Sugiriendo...' : 'Sugerir con IA'}
          </Button>
        </div>

        <HarvardSkillsGuide />
      </CardContent>
    </Card>
  );
}
