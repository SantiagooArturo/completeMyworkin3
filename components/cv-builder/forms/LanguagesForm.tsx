'use client';

import React from 'react';
import { Language } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Globe } from 'lucide-react';
import HarvardFormatTip from '@/components/cv-builder/HarvardFormatTip';

interface LanguagesFormProps {
  languages: Language[];
  onUpdate: (languages: Language[]) => void;
}

export default function LanguagesForm({ languages, onUpdate }: LanguagesFormProps) {  const addLanguage = () => {
    const newLanguage: Language = {
      id: Date.now().toString(),
      language: '',
      proficiency: 'Intermedio'
    };
    onUpdate([...languages, newLanguage]);
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const updatedLanguages = languages.map((lang, i) => 
      i === index ? { ...lang, [field]: value } : lang
    );
    onUpdate(updatedLanguages);
  };

  const removeLanguage = (index: number) => {
    const updatedLanguages = languages.filter((_, i) => i !== index);
    onUpdate(updatedLanguages);
  };
  const languageLevels = [
    { value: 'Básico', label: 'Básico (A1-A2)', description: 'Comprensión y expresión para tareas simples.' },
    { value: 'Intermedio', label: 'Intermedio (B1)', description: 'Capacidad para desenvolverse en la mayoría de situaciones.' },
    { value: 'Intermedio-Avanzado', label: 'Intermedio-Avanzado (B2)', description: 'Comunicación fluida sobre temas concretos y técnicos.' },
    { value: 'Avanzado', label: 'Avanzado (C1)', description: 'Dominio operativo eficaz y profesional del idioma.' },
    { value: 'Proficiente', label: 'Proficiente (C2)', description: 'Dominio completo y preciso, casi nivel nativo.' },
    { value: 'Nativo', label: 'Nativo', description: 'Hablante nativo del idioma por nacimiento o inmersión total.' }
  ];

  const commonLanguages = [
    'Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 
    'Chino Mandarín', 'Japonés', 'Coreano', 'Árabe', 'Ruso', 'Holandés',
    'Sueco', 'Noruego', 'Danés', 'Finlandés', 'Polaco', 'Checo',
    'Húngaro', 'Griego', 'Turco', 'Hindi', 'Bengalí', 'Tamil',
    'Tailandés', 'Vietnamita', 'Indonesio', 'Malayo', 'Tagalo',
    'Hebreo', 'Persa', 'Urdu', 'Swahili', 'Quechua', 'Guaraní'
  ];

  const getLevelDescription = (level: string) => {
    return languageLevels.find(l => l.value === level)?.description || '';
  };
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Básico': return 'bg-yellow-100 text-yellow-800';
      case 'Intermedio': return 'bg-sky-100 text-sky-800';
      case 'Intermedio-Avanzado': return 'bg-blue-100 text-blue-800';
      case 'Avanzado': return 'bg-green-100 text-green-800';
      case 'Proficiente': return 'bg-indigo-100 text-indigo-800';
      case 'Nativo': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-[#028bbf]" />
          Idiomas
          <HarvardFormatTip section="languages" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {languages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay idiomas agregados</p>
            <p className="text-sm">Agrega los idiomas que dominas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {languages.map((language, index) => (
              <div key={language.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">
                      {language.language || `Idioma ${index + 1}`}
                    </h4>
                    {language.proficiency && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(language.proficiency)}`}>
                        {languageLevels.find(l => l.value === language.proficiency)?.label}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Idioma *
                    </Label>
                    <Select
                      value={language.language}
                      onValueChange={(value) => updateLanguage(index, 'language', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona un idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Nivel de Dominio *</Label>                    <Select
                      value={language.proficiency}
                      onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona el nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs text-gray-500">{level.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>                </div>

                {/* Descripción del nivel */}
                {language.proficiency && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Nivel {languageLevels.find(l => l.value === language.proficiency)?.label}:</strong>{' '}
                      {getLevelDescription(language.proficiency)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={addLanguage}
          variant="outline"
          className="w-full border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Idioma
        </Button>
      </CardContent>
    </Card>
  );
}
