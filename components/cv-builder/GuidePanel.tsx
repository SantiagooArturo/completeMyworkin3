'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, BookOpen, Check, AlertTriangle } from 'lucide-react';

interface GuidePanelProps {
  onClose: () => void;
}

const GuideSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h4 className="text-md font-semibold text-gray-800 mb-2">{title}</h4>
    <div className="text-sm text-gray-600 space-y-2">{children}</div>
  </div>
);

const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 p-2 bg-green-50 border-l-4 border-green-400 rounded-r-md">
    <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

const Warning = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 p-2 bg-red-50 border-l-4 border-red-400 rounded-r-md">
    <AlertTriangle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

export default function GuidePanel({ onClose }: GuidePanelProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white shadow-2xl rounded-lg flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center border-b p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#028bbf]" />
            <CardTitle className="text-lg font-bold text-gray-900">Guía Rápida - Formato Harvard</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto">
          <GuideSection title="Resumen Profesional">
            <Tip>Debe ser un párrafo de 3-5 líneas que resuma tu carrera, habilidades clave y objetivo profesional.</Tip>
            <Warning>Evita clichés como "trabajador y motivado". Sé específico sobre tu valor.</Warning>
          </GuideSection>

          <GuideSection title="Experiencia Laboral">
            <Tip>Usa verbos de acción fuertes (ej: "Lideré", "Desarrollé") y cuantifica tus logros (ej: "Aumenté ventas en 20%").</Tip>
            <Tip>Ordena la experiencia en cronología inversa (lo más reciente primero).</Tip>
            <Warning>No listes solo responsabilidades. Enfócate en el impacto y los resultados que generaste.</Warning>
          </GuideSection>

          <GuideSection title="Educación">
            <Tip>Incluye el nombre de la institución, el título obtenido y el año de graduación.</Tip>
            <Warning>No es necesario incluir el colegio si tienes educación universitaria.</Warning>
          </GuideSection>

          <GuideSection title="Habilidades">
            <Tip>Divide las habilidades en categorías (ej: Técnicas, Idiomas, Blandas) para mayor claridad.</Tip>
            <Warning>Sé honesto. No incluyas habilidades que no puedas demostrar en una entrevista.</Warning>
          </GuideSection>

          <GuideSection title="Consejos Generales">
            <Tip>Mantén tu CV en una sola página, especialmente si tienes menos de 10 años de experiencia.</Tip>
            <Tip>Usa una fuente profesional y legible (ej: Calibri, Arial, Times New Roman) en tamaño 10-12pt.</Tip>
            <Warning>Revisa la ortografía y gramática varias veces. Un error puede descartarte.</Warning>
          </GuideSection>
        </CardContent>
        <div className="p-4 border-t flex justify-end">
            <Button onClick={onClose} className="bg-[#028bbf] hover:bg-[#027ba8] text-white">
                Entendido
            </Button>
        </div>
      </Card>
    </div>
  );
}
