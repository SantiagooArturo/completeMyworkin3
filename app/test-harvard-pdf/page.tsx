'use client';

import React, { useState } from 'react';
import { CVPDFGeneratorHarvard } from '@/services/cvPDFGeneratorHarvard';
import { CVData } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const testCVData: CVData = {
  personalInfo: {
    fullName: 'Juan Pérez García',
    email: 'juan.perez@email.com',
    phone: '+51 987 654 321',
    address: 'Lima, Perú',
    linkedIn: 'linkedin.com/in/juanperez',
    website: 'juanperez.com',
    summary: 'Ingeniero de software con 5 años de experiencia en desarrollo full-stack, especializado en tecnologías modernas como React, Node.js y bases de datos relacionales.'
  },  education: [
    {
      id: '1',
      institution: 'Universidad Nacional de Ingeniería',
      degree: 'Ingeniero de Sistemas',
      fieldOfStudy: 'Ingeniería de Sistemas',
      startDate: '2018-03',
      endDate: '2022-12',
      current: false,
      gpa: '16.5',
      honors: 'Summa Cum Laude',
      achievements: [
        'Especialización en desarrollo de software y sistemas distribuidos',
        'Proyecto de tesis: Sistema de gestión académica basado en microservicios'
      ]
    }
  ],  workExperience: [
    {
      id: '1',
      company: 'TechCorp Solutions',
      position: 'Desarrollador Senior Full-Stack',
      location: 'Lima, Perú',
      startDate: '2022-01',
      endDate: '',
      current: true,
      description: 'Desarrollo y mantenimiento de aplicaciones web utilizando React, Node.js y PostgreSQL. Liderazgo de equipo de 3 desarrolladores junior. Implementación de arquitecturas escalables y optimización de rendimiento.',
      achievements: [
        'Redujo el tiempo de carga de la aplicación principal en un 40%',
        'Implementó sistema de autenticación JWT que mejoró la seguridad',
        'Mentoreó a 5 desarrolladores junior durante el último año'
      ]
    }
  ],  skills: [
    { id: '1', name: 'JavaScript', category: 'Technical', level: 'Experto' },
    { id: '2', name: 'React', category: 'Technical', level: 'Avanzado' },
    { id: '3', name: 'Node.js', category: 'Technical', level: 'Avanzado' },
    { id: '4', name: 'PostgreSQL', category: 'Technical', level: 'Intermedio' }
  ],
  projects: [
    {
      id: '1',
      name: 'Portal de Gestión Académica',
      description: 'Sistema web completo para gestión de estudiantes, cursos y calificaciones',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      startDate: '2023-01',
      endDate: '2023-06',
      current: false,
      url: 'https://github.com/juanperez/portal-academico',
      highlights: [
        'Desarrollé la interfaz de usuario que mejoró la experiencia del usuario en un 40%',
        'Implementé un sistema de autenticación seguro',
        'Reduje el tiempo de carga de la aplicación en un 60%'
      ]
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Developer Associate',
      issuer: 'Amazon Web Services',
      date: '2023-05',
      expiryDate: '2026-05',
      credentialId: 'AWS-DEV-2023-001'
    }
  ]
};

const TestHarvardPDFPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await CVPDFGeneratorHarvard.generatePDF(testCVData);
      setLastGenerated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Test Harvard PDF Generation</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🎓 Prueba de Generación PDF - Formato Harvard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Esta página prueba la funcionalidad de generación de PDF en formato Harvard.
            Haz clic en el botón para generar un PDF de muestra con datos predefinidos.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? '⏳ Generando PDF...' : '📄 Generar PDF Harvard'}
            </Button>
            
            {lastGenerated && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ✅ PDF generado exitosamente el: {lastGenerated}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Datos de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div><strong>Nombre:</strong> {testCVData.personalInfo.fullName}</div>
            <div><strong>Email:</strong> {testCVData.personalInfo.email}</div>
            <div><strong>Educación:</strong> {testCVData.education[0]?.degree} - {testCVData.education[0]?.institution}</div>
            <div><strong>Experiencia:</strong> {testCVData.workExperience[0]?.position} en {testCVData.workExperience[0]?.company}</div>
            <div><strong>Habilidades:</strong> {testCVData.skills.map(s => s.name).join(', ')}</div>
            <div><strong>Proyectos:</strong> {testCVData.projects[0]?.name}</div>
          </div>
        </CardContent>
      </Card>    </div>
  );
};

export default TestHarvardPDFPage;
