'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Heart,
  Lightbulb,
  X
} from 'lucide-react';
import HarvardFormatTip from '@/components/cv-builder/HarvardFormatTip';

interface HobbiesFormProps {
  hobbies: string[];
  onUpdate: (hobbies: string[]) => void;
}

export default function HobbiesForm({ hobbies, onUpdate }: HobbiesFormProps) {
  const [newHobby, setNewHobby] = useState('');

  // Hobbies sugeridos para estudiantes
  const suggestedHobbies = [
    'Jugar fútbol', 'Tenis', 'Natación', 'Ciclismo', 'Correr', 'Golf',
    'Leer libros', 'Ver películas', 'Escuchar podcasts', 'Videojuegos',
    'Viajar', 'Fotografía', 'Cocinar', 'Tocar guitarra', 'Pintar',
    'Voluntariado', 'Baile', 'Yoga', 'Meditación', 'Senderismo',
    'Programación', 'Diseño gráfico', 'Escritura', 'Jardinería'
  ];

  const addHobby = (hobby?: string) => {
    const hobbyToAdd = hobby || newHobby.trim();
    if (hobbyToAdd && !hobbies.includes(hobbyToAdd)) {
      onUpdate([...hobbies, hobbyToAdd]);
      setNewHobby('');
    }
  };

  const removeHobby = (index: number) => {
    const updated = hobbies.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const updateHobby = (index: number, value: string) => {
    const updated = hobbies.map((hobby, i) => 
      i === index ? value : hobby
    );
    onUpdate(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#028bbf]" />
          Hobbies e Intereses
          <HarvardFormatTip section="hobbies" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hobbies sugeridos */}
        {hobbies.length < 3 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Selecciona algunos que te representen:</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedHobbies
                .filter(hobby => !hobbies.includes(hobby))
                .slice(0, 12)
                .map((hobby) => (
                  <Button
                    key={hobby}
                    variant="outline"
                    size="sm"
                    onClick={() => addHobby(hobby)}
                    className="text-xs hover:bg-[#028bbf] hover:text-white hover:border-[#028bbf]"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {hobby}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Lista de hobbies actuales */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Tus hobbies e intereses:</Label>
          
          {hobbies.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aún no has agregado hobbies</p>
              <p className="text-xs text-gray-400">Selecciona algunos de arriba o agrega los tuyos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {hobbies.map((hobby, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white border rounded-lg group hover:shadow-sm">
                  <Input
                    value={hobby}
                    onChange={(e) => updateHobby(index, e.target.value)}
                    className="border-none bg-transparent focus:ring-0 focus:border-none flex-1"
                    placeholder="Describe tu hobby..."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHobby(index)}
                    className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agregar hobby personalizado */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">O agrega uno personalizado:</Label>
          <div className="flex gap-2">
            <Input
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              placeholder="Ej: Tocar piano, Escritura creativa, Ajedrez..."
              onKeyPress={(e) => e.key === 'Enter' && addHobby()}
              className="flex-1"
            />
            <Button 
              onClick={() => addHobby()}
              disabled={!newHobby.trim() || hobbies.includes(newHobby.trim())}
              className="bg-[#028bbf] hover:bg-[#027ba8]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Consejos */}
        {hobbies.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Heart className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-1">
                <p className="font-medium text-sm">✅ Consejos:</p>
                <ul className="text-xs space-y-1">
                  <li>• Mantén entre 3-5 hobbies relevantes</li>
                  <li>• Evita hobbies controvertidos o muy personales</li>
                  <li>• Si practicas deportes, menciona nivel (amateur, competitivo)</li>
                  <li>• Los hobbies que demuestran liderazgo o trabajo en equipo son valiosos</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
