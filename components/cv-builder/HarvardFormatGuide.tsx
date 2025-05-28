'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CheckCircle } from 'lucide-react';

export default function HarvardFormatGuide() {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          Guía del Formato Harvard para CV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Características del formato Harvard */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Características Principales
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Encabezado centrado:</strong> Nombre e información de contacto al centro</li>
              <li>• <strong>Secciones claramente definidas:</strong> Con títulos en mayúsculas y líneas divisorias</li>
              <li>• <strong>Orden cronológico inverso:</strong> Experiencias más recientes primero</li>
              <li>• <strong>Educación detallada:</strong> Incluye GPA, honores y cursos relevantes</li>
              <li>• <strong>Formato profesional:</strong> Espaciado consistente y tipografía clara</li>
              <li>• <strong>Referencias:</strong> Incluidas o "Disponibles bajo solicitud"</li>
            </ul>
          </div>

          {/* Orden recomendado de secciones */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Orden de Secciones Recomendado
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li><strong>1.</strong> Información Personal (centrada)</li>
              <li><strong>2.</strong> Perfil Profesional / Objetivo</li>
              <li><strong>3.</strong> Educación (para recién graduados)</li>
              <li><strong>4.</strong> Experiencia Profesional</li>
              <li><strong>5.</strong> Proyectos Destacados</li>
              <li><strong>6.</strong> Competencias y Habilidades</li>
              <li><strong>7.</strong> Certificaciones</li>
              <li><strong>8.</strong> Idiomas</li>
              <li><strong>9.</strong> Referencias</li>
            </ol>
          </div>
        </div>

        {/* Consejos específicos */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Consejos para el Formato Harvard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">✅ Qué hacer:</h4>
              <ul className="space-y-1">
                <li>• Usar márgenes uniformes (2.5 cm)</li>
                <li>• Mantener espaciado consistente</li>
                <li>• Incluir GPA si es 3.5 o superior</li>
                <li>• Usar verbos de acción en tiempo pasado</li>
                <li>• Cuantificar logros cuando sea posible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">❌ Qué evitar:</h4>
              <ul className="space-y-1">
                <li>• Fuentes decorativas o muy pequeñas</li>
                <li>• Colores llamativos o gráficos excesivos</li>
                <li>• Información personal innecesaria</li>
                <li>• Errores ortográficos o gramaticales</li>
                <li>• Más de 2 páginas (para principiantes)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ejemplo de estructura */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">📋 Ejemplo de Estructura</h3>
          <div className="text-xs font-mono bg-gray-50 p-3 rounded border space-y-1">
            <div className="text-center font-bold">JUAN CARLOS PÉREZ GARCÍA</div>
            <div className="text-center">Lima, Perú • +51 999 888 777 • juan.perez@email.com</div>
            <div className="text-center">linkedin.com/in/juan-perez • www.juanperez.com</div>
            <div className="border-b border-gray-300 my-2"></div>
            <div className="font-bold">PERFIL PROFESIONAL</div>
            <div className="text-gray-600">Ingeniero de sistemas con 3 años de experiencia...</div>
            <div className="font-bold mt-2">EDUCACIÓN</div>
            <div className="font-medium">Licenciatura en Ingeniería de Sistemas</div>
            <div className="italic">Universidad Nacional Mayor de San Marcos</div>
            <div className="text-right text-gray-600">2019 - 2023</div>
            <div className="text-sm">GPA: 16.8/20 • Tercio Superior</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
