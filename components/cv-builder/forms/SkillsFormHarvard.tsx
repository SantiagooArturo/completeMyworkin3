'use client';

import React, { useState } from 'react';
import { SkillCategory, Skill } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Wrench, 
  Star,
  Lightbulb,
  Code,
  Users,
  BarChart3,
  MessageSquare,
  Search
} from 'lucide-react';

interface SkillsFormHarvardProps {
  skills: Skill[];
  skillCategories: SkillCategory[];
  onUpdateSkills: (skills: Skill[]) => void;
  onUpdateSkillCategories: (skillCategories: SkillCategory[]) => void;
}

export default function SkillsFormHarvard({ 
  skills, 
  skillCategories, 
  onUpdateSkills, 
  onUpdateSkillCategories 
}: SkillsFormHarvardProps) {
  const [activeTab, setActiveTab] = useState('harvard');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Categorías predefinidas comunes para estudiantes
  const commonCategories = [
    { name: 'Software', icon: Code, description: 'Microsoft Office, herramientas de diseño, software especializado' },
    { name: 'Gestión de proyectos', icon: BarChart3, description: 'Trello, Notion, Microsoft Project, metodologías ágiles' },
    { name: 'Programación', icon: Code, description: 'Lenguajes de programación, frameworks, bases de datos' },
    { name: 'Análisis de datos', icon: BarChart3, description: 'Excel avanzado, SQL, Power BI, Tableau' },
    { name: 'Comunicación', icon: MessageSquare, description: 'Presentaciones, redacción, marketing digital' },
    { name: 'Certificaciones', icon: Star, description: 'Certificaciones profesionales y técnicas' }
  ];

  const addSkillCategory = (categoryName?: string) => {
    const name = categoryName || newCategoryName;
    if (!name.trim()) return;

    const newCategory: SkillCategory = {
      id: Date.now().toString(),
      category: name,
      skills: []
    };
    
    onUpdateSkillCategories([...skillCategories, newCategory]);
    setNewCategoryName('');
  };

  const updateCategoryName = (categoryId: string, newName: string) => {
    const updated = skillCategories.map(cat => 
      cat.id === categoryId ? { ...cat, category: newName } : cat
    );
    onUpdateSkillCategories(updated);
  };

  const removeSkillCategory = (categoryId: string) => {
    const updated = skillCategories.filter(cat => cat.id !== categoryId);
    onUpdateSkillCategories(updated);
  };

  const addSkillToCategory = (categoryId: string) => {
    const updated = skillCategories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, skills: [...cat.skills, { name: '', level: '' }] }
        : cat
    );
    onUpdateSkillCategories(updated);
  };

  const updateSkillInCategory = (categoryId: string, skillIndex: number, field: 'name' | 'level', value: string) => {
    const updated = skillCategories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            skills: cat.skills.map((skill, index) => 
              index === skillIndex 
                ? { ...skill, [field]: value }
                : skill
            )
          }
        : cat
    );
    onUpdateSkillCategories(updated);
  };

  const removeSkillFromCategory = (categoryId: string, skillIndex: number) => {
    const updated = skillCategories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, skills: cat.skills.filter((_, index) => index !== skillIndex) }
        : cat
    );
    onUpdateSkillCategories(updated);
  };

  // Funciones para manejo de skills tradicionales (retrocompatibilidad)
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'Intermedio',
      category: 'Technical'
    };
    onUpdateSkills([...skills, newSkill]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const updated = skills.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    );
    onUpdateSkills(updated);
  };

  const removeSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    onUpdateSkills(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#028bbf]" />
          Habilidades y Competencias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="harvard" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Formato Harvard
            </TabsTrigger>
            <TabsTrigger value="traditional" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Formato Tradicional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="harvard" className="space-y-6 mt-6">
            {/* Guía de formato Harvard */}
            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-medium">🎓 Formato Harvard - Habilidades:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Agrupa habilidades por categorías relevantes</li>
                    <li>• Especifica nivel de competencia entre paréntesis</li>
                    <li>• Prioriza habilidades relevantes para el puesto</li>
                    <li>• Ejemplo: "Excel (Avanzado), PowerPoint (Intermedio)"</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Categorías predefinidas */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Categorías sugeridas para estudiantes:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {commonCategories.map((category) => {
                  const Icon = category.icon;
                  const exists = skillCategories.some(cat => cat.category === category.name);
                  
                  return (
                    <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-[#028bbf] mt-1" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={exists ? "secondary" : "default"}
                        onClick={() => !exists && addSkillCategory(category.name)}
                        disabled={exists}
                        className={exists ? "text-gray-500" : "bg-[#028bbf] hover:bg-[#027ba8] text-white"}
                      >
                        {exists ? "✓" : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Categorías existentes */}
            <div className="space-y-4">
              {skillCategories.length > 0 && (
                <h4 className="font-medium text-gray-900">Tus categorías de habilidades:</h4>
              )}
              
              {skillCategories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <Input
                      value={category.category}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      className="font-medium text-lg border-none bg-transparent p-0 focus:ring-0"
                      placeholder="Nombre de la categoría"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkillCategory(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center gap-2">
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkillInCategory(category.id, skillIndex, 'name', e.target.value)}
                          placeholder="Nombre de la habilidad"
                          className="flex-1"
                        />
                        <Input
                          value={skill.level || ''}
                          onChange={(e) => updateSkillInCategory(category.id, skillIndex, 'level', e.target.value)}
                          placeholder="(Nivel)"
                          className="w-32"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkillFromCategory(category.id, skillIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSkillToCategory(category.id)}
                      className="w-full mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar habilidad
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Agregar nueva categoría */}
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nueva categoría (ej: Idiomas, Certificaciones)"
                onKeyPress={(e) => e.key === 'Enter' && addSkillCategory()}
              />
              <Button onClick={() => addSkillCategory()} className="bg-[#028bbf] hover:bg-[#027ba8]">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="traditional" className="space-y-6 mt-6">
            <Alert className="border-amber-200 bg-amber-50">
              <Wrench className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <p className="font-medium mb-1">📋 Formato Tradicional</p>
                <p className="text-sm">Lista individual de habilidades con niveles de competencia.</p>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {skills.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay habilidades agregadas</p>
                  <p className="text-sm">Agrega tus competencias técnicas y blandas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <div key={skill.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(index, 'name', e.target.value)}
                          placeholder="Nombre de la habilidad"
                        />
                      </div>
                      <div className="w-32">
                        <Select
                          value={skill.level}
                          onValueChange={(value) => updateSkill(index, 'level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Básico">Básico</SelectItem>
                            <SelectItem value="Intermedio">Intermedio</SelectItem>
                            <SelectItem value="Avanzado">Avanzado</SelectItem>
                            <SelectItem value="Experto">Experto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-40">
                        <Select
                          value={skill.category}
                          onValueChange={(value) => updateSkill(index, 'category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technical">Técnica</SelectItem>
                            <SelectItem value="Analytical">Analítica</SelectItem>
                            <SelectItem value="Leadership">Liderazgo</SelectItem>
                            <SelectItem value="Communication">Comunicación</SelectItem>
                            <SelectItem value="Research">Investigación</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <Button onClick={addSkill} className="w-full bg-[#028bbf] hover:bg-[#027ba8]">
                <Plus className="h-4 w-4 mr-2" />
                Agregar habilidad
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
