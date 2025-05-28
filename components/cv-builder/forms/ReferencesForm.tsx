'use client';

import React from 'react';
import { Reference } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Users, Phone, Mail, Building } from 'lucide-react';

interface ReferencesFormProps {
  references: Reference[];
  onUpdate: (references: Reference[]) => void;
}

export default function ReferencesForm({ references, onUpdate }: ReferencesFormProps) {
  const addReference = () => {
    const newReference: Reference = {
      id: Date.now().toString(),
      name: '',
      position: '',
      company: '',
      phone: '',
      email: '',
      relationship: ''
    };
    onUpdate([...references, newReference]);
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const updatedReferences = references.map((ref, i) => 
      i === index ? { ...ref, [field]: value } : ref
    );
    onUpdate(updatedReferences);
  };

  const removeReference = (index: number) => {
    const updatedReferences = references.filter((_, i) => i !== index);
    onUpdate(updatedReferences);
  };

  const relationshipTypes = [
    'Supervisor directo',
    'Gerente/Director',
    'Colega de trabajo',
    'Cliente',
    'Profesor universitario',
    'Mentor profesional',
    'Compañero de proyecto',
    'Otro'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#028bbf]" />
          Referencias Profesionales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {references.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay referencias agregadas</p>
            <p className="text-sm">Agrega contactos profesionales que puedan recomendarte</p>
          </div>
        ) : (
          <div className="space-y-6">
            {references.map((reference, index) => (
              <div key={reference.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">
                    {reference.name || `Referencia ${index + 1}`}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReference(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Nombre Completo *
                    </Label>
                    <Input
                      value={reference.name}
                      onChange={(e) => updateReference(index, 'name', e.target.value)}
                      placeholder="Ej: María García López"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Cargo/Posición *</Label>
                    <Input
                      value={reference.position}
                      onChange={(e) => updateReference(index, 'position', e.target.value)}
                      placeholder="Ej: Gerente de Recursos Humanos"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Empresa/Organización *
                    </Label>
                    <Input
                      value={reference.company}
                      onChange={(e) => updateReference(index, 'company', e.target.value)}
                      placeholder="Ej: TechCorp Solutions"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Relación Profesional</Label>
                    <Input
                      value={reference.relationship}
                      onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                      placeholder="Ej: Supervisor directo"
                      className="mt-1"
                      list={`relationships-${index}`}
                    />
                    <datalist id={`relationships-${index}`}>
                      {relationshipTypes.map((type) => (
                        <option key={type} value={type} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono *
                    </Label>
                    <Input
                      value={reference.phone}
                      onChange={(e) => updateReference(index, 'phone', e.target.value)}
                      placeholder="Ej: +51 999 888 777"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Correo Electrónico *
                    </Label>
                    <Input
                      type="email"
                      value={reference.email}
                      onChange={(e) => updateReference(index, 'email', e.target.value)}
                      placeholder="maria.garcia@techcorp.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Información de contacto resumida */}
                {(reference.name || reference.position || reference.company) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-900">
                      <div className="font-medium">
                        {reference.name}
                        {reference.position && ` - ${reference.position}`}
                      </div>
                      {reference.company && (
                        <div className="text-blue-700">{reference.company}</div>
                      )}
                      {reference.relationship && (
                        <div className="text-blue-600 text-xs mt-1">
                          Relación: {reference.relationship}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={addReference}
          variant="outline"
          className="w-full border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Referencia
        </Button>

        {/* Consejos específicos para referencias en formato Harvard */}
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-pink-900 mb-2">👥 Formato Harvard - Referencias:</h4>
          <ul className="text-sm text-pink-800 space-y-1">
            <li>• Incluye 2-3 referencias profesionales relevantes</li>
            <li>• Contacta previamente a tus referencias para solicitar permiso</li>
            <li>• Elige personas que puedan hablar específicamente de tu trabajo</li>
            <li>• Incluye información de contacto actualizada y verificada</li>
            <li>• Prioriza supervisores directos o colegas de nivel senior</li>
            <li>• Evita referencias familiares o amigos personales</li>
            <li>• Opcional: "Referencias disponibles bajo solicitud"</li>
          </ul>
        </div>

        {/* Nota sobre disponibilidad */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Nota:</strong> Asegúrate de haber obtenido permiso de tus referencias antes de incluir su información de contacto. 
            Muchos empleadores verifican referencias solo en las etapas finales del proceso de selección.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
