'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Wrench, Sparkles } from 'lucide-react';
import HarvardFormatTip from '@/components/cv-builder/HarvardFormatTip';

interface SkillsFormProps {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
  cvData?: any;
}

export default function SkillsForm({ skills, onUpdate, cvData }: SkillsFormProps) {
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);

  const skillLevels = [
    { value: 'Básico', label: 'Básico' },
    { value: 'Intermedio', label: 'Intermedio' },
    { value: 'Avanzado', label: 'Avanzado' },
    { value: 'Experto', label: 'Experto' }
  ];

  const skillCategories = [
    { 
      value: 'Technical', 
      label: 'Software',
      icon: '💻'
    },
    { 
      value: 'Leadership', 
      label: 'Gestión de Proyectos',
      icon: '📋'
    },
    { 
      value: 'Language', 
      label: 'Idiomas',
      icon: '🌐'
    }
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
      
      const response = await fetch('/api/ai/suggest-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentSkills: skillNames,
          format: 'Harvard',
          role: 'Administración y Gestión',
          cvContext: {
            personalInfo: cvData?.personalInfo,
            education: cvData?.education,
            workExperience: cvData?.workExperience,
            projects: cvData?.projects,
            certifications: cvData?.certifications
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.suggestions) {
        const newSkills = processCategorizedSuggestions(data.suggestions, skillNames);
        
        if (newSkills.length > 0) {
          onUpdate([...skills, ...newSkills]);
        } else {
          alert('No se encontraron habilidades nuevas para sugerir');
        }
      }
    } catch (error) {
      console.error('Error al sugerir habilidades:', error);
      alert('Error al obtener sugerencias. Inténtalo de nuevo.');
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const processCategorizedSuggestions = (suggestions: string, existingSkills: string[]): Skill[] => {
    const newSkills: Skill[] = [];
    const sections = suggestions.split('\n\n');
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      const header = lines[0];
      
      let category: 'Technical' | 'Leadership' | 'Language' = 'Technical';
      
      if (header.includes('SOFTWARE')) {
        category = 'Technical';
      } else if (header.includes('GESTIÓN DE PROYECTOS')) {
        category = 'Leadership';
      } else if (header.includes('IDIOMAS')) {
        category = 'Language';
      }
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('- ')) {
          const skillText = line.substring(2).trim();
          
          if (!existingSkills.some(existing => 
            existing.toLowerCase().includes(skillText.toLowerCase()) ||
            skillText.toLowerCase().includes(existing.toLowerCase())
          )) {
            let skillName = skillText;
            let level = 'Intermedio';
            
            if (skillText.includes('(') && skillText.includes(')')) {
              const parts = skillText.split('(');
              skillName = parts[0].trim();
              const levelPart = parts[1].replace(')', '').trim();
              if (['Básico', 'Intermedio', 'Avanzado'].includes(levelPart)) {
                level = levelPart;
              }
            }
            
            if (category === 'Language' && skillText.includes(' - ')) {
              const parts = skillText.split(' - ');
              skillName = parts[0].trim();
              level = parts[1] ? parts[1].trim() : 'Intermedio';
            }
            
            newSkills.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              name: skillName,
              level: level as 'Básico' | 'Intermedio' | 'Avanzado',
              category: category
            });
          }
        }
      }
    });
    
    return newSkills;
  };

  const getCategoryColors = (categoryValue: string) => {
    switch (categoryValue) {
      case 'Technical':
        return 'bg-blue-100 border-blue-200';
      case 'Leadership':
        return 'bg-green-100 border-green-200';
      case 'Language':
        return 'bg-purple-100 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Agrupar habilidades por categoría
  const groupedSkills = skillCategories.reduce((acc, category) => {
    acc[category.value] = skills.filter(skill => skill.category === category.value);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#028bbf]" />
          Habilidades
          <HarvardFormatTip section="skills" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {skills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay habilidades agregadas</p>
            <p className="text-sm">Agrega las herramientas y competencias que dominas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mostrar habilidades agrupadas por categoría */}
            {skillCategories.map(categoryInfo => {
              const categorySkills = groupedSkills[categoryInfo.value] || [];
              if (categorySkills.length === 0) return null;

              return (
                <div key={categoryInfo.value} className={`border rounded-lg p-4 ${getCategoryColors(categoryInfo.value)}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span>{categoryInfo.icon}</span>
                    <h3 className="font-medium text-gray-900">{categoryInfo.label}</h3>
                    <span className="text-sm text-gray-500">({categorySkills.length})</span>
                  </div>
                  
                  <div className="space-y-3">
                    {categorySkills.map((skill) => {
                      const originalIndex = skills.findIndex(s => s.id === skill.id);
                      return (
                        <div key={skill.id} className="bg-white rounded border p-3">
                          <div className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-5">
                              <Input
                                value={skill.name}
                                onChange={(e) => updateSkill(originalIndex, 'name', e.target.value)}
                                placeholder="Ej: Excel, Power BI, Inglés"
                                className="border-0 bg-transparent focus:bg-gray-50"
                              />
                            </div>
                            
                            <div className="col-span-3">
                              <Select
                                value={skill.category}
                                onValueChange={(value) => updateSkill(originalIndex, 'category', value)}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {skillCategories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                      {cat.icon} {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="col-span-3">
                              <Select
                                value={skill.level}
                                onValueChange={(value) => updateSkill(originalIndex, 'level', value)}
                              >
                                <SelectTrigger className="text-sm">
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
                            
                            <div className="col-span-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkill(originalIndex)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

        <div className="flex gap-3">
          <Button
            onClick={addSkill}
            variant="outline"
            className="flex-1 border-dashed border-2 border-gray-300 text-gray-600 hover:border-[#028bbf] hover:text-[#028bbf]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Habilidad
          </Button>
          
          <Button
            onClick={suggestSkillsWithAI}
            disabled={isSuggestingSkills}
            variant="outline"
            className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            {isSuggestingSkills ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isSuggestingSkills ? 'Sugiriendo...' : 'Sugerir Habilidades'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
