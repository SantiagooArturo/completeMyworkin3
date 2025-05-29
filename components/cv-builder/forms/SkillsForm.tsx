'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Plus, Trash2, ChevronDown, ChevronUp, Info, Wrench, Sparkles } from 'lucide-react';
import { cvAIEnhancementService } from '@/services/cvAIEnhancementService';


const HarvardSkillsGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Info className="h-5 w-5 text-amber-700 mr-2" />
          <h4 className="font-medium text-amber-900">⚡ Formato Harvard - Habilidades</h4>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-amber-700" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-700" />
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-3">
          <ul className="text-sm text-amber-800 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Organiza las habilidades por categorías (técnicas, blandas, herramientas)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Sé honesto con tu nivel de competencia</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Prioriza habilidades relevantes para el puesto</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Incluye tanto habilidades técnicas como interpersonales</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Considera certificaciones que respalden tus habilidades</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

interface SkillsFormProps {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
}

export default function SkillsForm({ skills, onUpdate }: SkillsFormProps) {
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'Intermedio',
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
    { value: 'Básico', label: 'Básico', stars: 1 },
    { value: 'Intermedio', label: 'Intermedio', stars: 2 },
    { value: 'Avanzado', label: 'Avanzado', stars: 3 },
    { value: 'Experto', label: 'Experto', stars: 4 }
  ];

  const skillCategories = [
    { value: 'Técnica', label: 'Técnicas' },
    { value: 'Blanda', label: 'Blandas' }
  ];

  const renderSkillLevel = (level: string) => {
    const stars = skillLevels.find(l => l.value === level)?.stars || 2;
    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="text-xs text-gray-600 ml-2">{level}</span>
      </div>
    );
  };

  const suggestSkillsWithAI = async () => {
    if (skills.length === 0) {
      alert('Por favor, agrega al menos una habilidad antes de usar la IA.');
      return;
    }
    
    try {
      setIsSuggestingSkills(true);
      const skillNames = skills.map(skill => skill.name);
      const role = 'profesional'; // Puedes personalizar esto basado en el perfil del usuario
      
      const enhancedSkills = await cvAIEnhancementService.enhanceSkills(skillNames, role);
      
      // Añadir las habilidades sugeridas
      const newSkills : Skill[] = enhancedSkills.suggested.map(name => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name,
        level: 'Intermedio',
        category: 'Técnica'
      }));
      
      onUpdate([...skills, ...newSkills]);
    } catch (error) {
      console.error('Error al sugerir habilidades:', error);
      alert('No se pudieron sugerir habilidades. Por favor, inténtalo más tarde.');
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#028bbf]" />
          Habilidades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay habilidades agregadas</p>
            <p className="text-sm">Agrega tus habilidades técnicas y blandas</p>
          </div>
        ) : (
          skills.map((skill, index) => (
            <div key={skill.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder="Nombre de la habilidad"
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
              
              <div className="space-y-2">
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
                    onValueChange={(value) => updateSkill(index, 'category', value)}
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
          ))
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
