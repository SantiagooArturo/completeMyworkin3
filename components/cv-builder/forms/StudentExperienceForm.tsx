'use client';

import React, { useState } from 'react';
import { WorkExperience, Project } from '@/types/cv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  FolderOpen, 
  Lightbulb, 
  Plus,
  BookOpen,
  Target
} from 'lucide-react';
import WorkExperienceForm from './WorkExperienceForm';
import ProjectsForm from './ProjectsForm';

interface StudentExperienceFormProps {
  workExperience: WorkExperience[];
  projects: Project[];
  onUpdateWorkExperience: (workExperience: WorkExperience[]) => void;
  onUpdateProjects: (projects: Project[]) => void;
}

export default function StudentExperienceForm({ 
  workExperience, 
  projects, 
  onUpdateWorkExperience, 
  onUpdateProjects 
}: StudentExperienceFormProps) {
  const [activeTab, setActiveTab] = useState('guide');

  const hasExperience = workExperience.length > 0;
  const hasProjects = projects.length > 0;
  const hasAnyExperience = hasExperience || hasProjects;

  const addSampleProject = () => {
    const sampleProject: Project = {
      id: Date.now().toString(),
      name: 'Proyecto de Tesis',
      description: 'Desarrollo de una aplicación web para la gestión de inventarios utilizando tecnologías modernas',
      technologies: ['React', 'Node.js', 'MongoDB'],
      startDate: new Date().getFullYear().toString(),
      endDate: new Date().getFullYear().toString(),
      current: false,
      highlights: [
        'Implementé una interfaz de usuario intuitiva que mejoró la experiencia del usuario en un 40%',
        'Desarrollé APIs RESTful que redujeron el tiempo de respuesta en un 50%',
        'Apliqué metodologías ágiles para la gestión del proyecto'
      ],
      role: 'Desarrollador Full Stack',
      teamSize: 1,
      methodology: 'Scrum'
    };
    onUpdateProjects([...projects, sampleProject]);
    setActiveTab('projects');
  };

  return (
    <div className="space-y-6">
      {/* Guía para estudiantes */}
      <Alert className="border-blue-200 bg-blue-50">
        <GraduationCap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p className="font-medium">💡 Guía para Estudiantes:</p>
            <p className="text-sm">
              Como estudiante, puedes crear un CV profesional usando tus proyectos académicos, 
              prácticas, trabajos de medio tiempo, voluntariados y proyectos personales.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Guía
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Proyectos
            {hasProjects && <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{projects.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Experiencia
            {hasExperience && <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{workExperience.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#028bbf]" />
                Cómo destacar sin experiencia laboral formal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">✅ Lo que SÍ puedes incluir:</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Proyectos universitarios:</strong> Tesis, trabajos de investigación, proyectos de curso</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Prácticas profesionales:</strong> Aunque sean cortas o no remuneradas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Trabajos de medio tiempo:</strong> Ventas, atención al cliente, delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Voluntariado:</strong> Organizaciones benéficas, eventos universitarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Proyectos personales:</strong> Apps, sitios web, emprendimientos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Liderazgo estudiantil:</strong> Representante de aula, organizador de eventos</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">💡 Consejos clave:</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Cuantifica resultados:</strong> "Incrementé ventas en 20%" vs "Vendí productos"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Usa verbos de acción:</strong> Desarrollé, lideré, implementé, optimicé</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Enfócate en habilidades:</strong> Trabajo en equipo, resolución de problemas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Destaca tecnologías:</strong> Software, herramientas, lenguajes de programación</span>
                    </li>
                  </ul>
                </div>
              </div>

              {!hasAnyExperience && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-blue-900">¿No tienes proyectos todavía?</h5>
                      <p className="text-sm text-blue-700 mt-1">Te ayudamos con un ejemplo para que empieces</p>
                    </div>
                    <Button 
                      onClick={addSampleProject}
                      className="bg-[#028bbf] hover:bg-[#027ba8] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Ejemplo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <FolderOpen className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-medium mb-1">🚀 Los proyectos son tu experiencia</p>
                <p className="text-sm">
                  Para estudiantes, los proyectos académicos y personales son tan valiosos como la experiencia laboral. 
                  Describe tus logros, tecnologías usadas y el impacto de tu trabajo.
                </p>
              </AlertDescription>
            </Alert>
            
            <ProjectsForm
              projects={projects}
              onUpdate={onUpdateProjects}
            />
          </div>
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <BookOpen className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <p className="font-medium mb-1">💼 Incluye cualquier experiencia laboral</p>
                <p className="text-sm">
                  Trabajos de medio tiempo, prácticas, freelancing, voluntariado - toda experiencia cuenta. 
                  Enfócate en las habilidades que desarrollaste y los resultados que lograste.
                </p>
              </AlertDescription>
            </Alert>
            
            <WorkExperienceForm
              workExperience={workExperience}
              onUpdate={onUpdateWorkExperience}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
