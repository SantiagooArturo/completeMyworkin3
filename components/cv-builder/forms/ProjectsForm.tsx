'use client';

import React from 'react';
import { Project } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FolderOpen, Link as LinkIcon, Calendar } from 'lucide-react';
import DatePicker from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';

interface ProjectsFormProps {
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
}

export default function ProjectsForm({ projects, onUpdate }: ProjectsFormProps) {
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
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
    // Permitir comas al final y no filtrar espacios en blanco innecesariamente
    const technologies = value
      .split(',')
      .map(tech => tech.trim())
      .filter(tech => tech.length > 0);
    updateProject(index, 'technologies', technologies);
  };

  const updateHighlights = (index: number, value: string) => {
    // Permitir líneas vacías y conservar el formato
    const highlights = value
      .split('\n')
      .filter(h => h.trim().length > 0);
    updateProject(index, 'highlights', highlights);
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
                    <DatePicker
                      value={project.startDate}
                      onChange={(date) => updateProject(index, 'startDate', date)}
                      placeholder="Selecciona fecha de inicio"
                      className="mt-1"
                      maxDate={project.endDate || undefined}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Fin
                    </Label>
                    <DatePicker
                      value={project.endDate}
                      onChange={(date) => updateProject(index, 'endDate', date)}
                      placeholder="Selecciona fecha de fin"
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
                  <Label>Logros y Destacados del Proyecto</Label>
                  <Textarea
                    value={project.highlights?.join('\n') || ''}
                    onChange={(e) => updateHighlights(index, e.target.value)}
                    placeholder="• Desarrollé la interfaz de usuario que mejoró la experiencia del usuario en un 40%&#10;• Implementé un sistema de autenticación seguro&#10;• Reduje el tiempo de carga de la aplicación en un 60%"
                    rows={4}
                    className="mt-1 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lista tus principales logros y contribuciones (un logro por línea)
                  </p>
                </div>

                <div className="mt-4">
                  <Label>Descripción del Proyecto *</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    placeholder="Describe el proyecto, tu contribución, los desafíos que resolviste y los resultados obtenidos..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>

                <div className="mt-4">
                  <Label>Tecnologías Utilizadas</Label>
                  <Input
                    value={project.technologies?.join(', ') || ''}
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