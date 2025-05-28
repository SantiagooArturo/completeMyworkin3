'use client';

import React from 'react';
import { Skill } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Plus, Trash2, Zap } from 'lucide-react';

interface SkillsFormProps {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
}

export default function SkillsForm({ skills, onUpdate }: SkillsFormProps) {
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',      level: 'Intermedio',
      category: 'Técnica'
    };
    onUpdate([...skills, newSkill]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updatedSkills = skills.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    );
    onUpdate(updatedSkills);
  };

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onUpdate(updatedSkills);
  };

  const skillLevels = [
    { value: 'basico', label: 'Básico' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
    { value: 'experto', label: 'Experto' }
  ];

  const skillCategories = [
    { value: 'tecnica', label: 'Técnicas' },
    { value: 'blanda', label: 'Blandas' },
    { value: 'idioma', label: 'Idiomas' },
    { value: 'herramienta', label: 'Herramientas' }
  ];

  const getSkillsByCategory = (category: string) => {
    return skills.filter(skill => skill.category === category);
  };

  const renderSkillLevel = (level: string) => {
    const stars = level === 'basico' ? 1 : level === 'intermedio' ? 2 : level === 'avanzado' ? 3 : 4;
    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="text-xs text-gray-600 ml-2">{skillLevels.find(l => l.value === level)?.label}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#028bbf]" />
          Habilidades y Competencias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {skills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay habilidades agregadas</p>
            <p className="text-sm">Agrega tus competencias profesionales</p>
          </div>
        ) : (
          <div className="space-y-6">
            {skillCategories.map((category) => {
              const categorySkills = getSkillsByCategory(category.value);
              if (categorySkills.length === 0) return null;
              
              return (
                <div key={category.value} className="space-y-3">
                  <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                    {category.label}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorySkills.map((skill, globalIndex) => {
                      const actualIndex = skills.findIndex(s => s.id === skill.id);
                      return (
                        <div key={skill.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <Input
                                value={skill.name}
                                onChange={(e) => updateSkill(actualIndex, 'name', e.target.value)}
                                placeholder="Nombre de la habilidad"
                                className="font-medium"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(actualIndex)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm">Nivel</Label>
                              <Select
                                value={skill.level}
                                onValueChange={(value) => updateSkill(actualIndex, 'level', value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {skillLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Categoría</Label>
                              <Select
                                value={skill.category}
                                onValueChange={(value) => updateSkill(actualIndex, 'category', value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {skillCategories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="pt-1">
                              {renderSkillLevel(skill.level)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button
          onClick={addSkill}
          variant="outline"
          className="w-full border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Habilidad
        </Button>

        {/* Consejos específicos para habilidades en formato Harvard */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-purple-900 mb-2">⚡ Formato Harvard - Habilidades:</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Organiza las habilidades por categorías (técnicas, blandas, herramientas)</li>
            <li>• Sé honesto con tu nivel de competencia</li>
            <li>• Prioriza habilidades relevantes para el puesto</li>
            <li>• Incluye tanto habilidades técnicas como interpersonales</li>
            <li>• Considera certificaciones que respalden tus habilidades</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
