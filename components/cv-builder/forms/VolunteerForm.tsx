'use client';

import React from 'react';
import { Volunteer } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Heart, X, MapPin } from 'lucide-react';
import HarvardFormatTip from '@/components/cv-builder/HarvardFormatTip';

interface VolunteerFormProps {
  volunteer: Volunteer[];
  onUpdate: (volunteer: Volunteer[]) => void;
}

export default function VolunteerForm({ volunteer, onUpdate }: VolunteerFormProps) {
  const addVolunteer = () => {
    const newVolunteer: Volunteer = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      organization: '',
      position: '',
      startDate: '',
      endDate: '',
      currentlyVolunteering: false,
      description: '',
      skills: [],
      impact: '',
      location: ''
    };
    onUpdate([...volunteer, newVolunteer]);
  };

  const removeVolunteer = (index: number) => {
    const updatedVolunteer = volunteer.filter((_, i) => i !== index);
    onUpdate(updatedVolunteer);
  };

  const updateVolunteer = (index: number, field: keyof Volunteer, value: any) => {
    const updatedVolunteer = [...volunteer];
    updatedVolunteer[index] = { ...updatedVolunteer[index], [field]: value };
    onUpdate(updatedVolunteer);
  };

  const addSkill = (volunteerIndex: number, skill: string) => {
    if (!skill.trim()) return;
    
    const updatedVolunteer = [...volunteer];
    const currentSkills = updatedVolunteer[volunteerIndex].skills || [];
    
    if (!currentSkills.includes(skill.trim())) {
      updatedVolunteer[volunteerIndex].skills = [...currentSkills, skill.trim()];
      onUpdate(updatedVolunteer);
    }
  };

  const removeSkill = (volunteerIndex: number, skillIndex: number) => {
    const updatedVolunteer = [...volunteer];
    updatedVolunteer[volunteerIndex].skills = updatedVolunteer[volunteerIndex].skills.filter((_, i) => i !== skillIndex);
    onUpdate(updatedVolunteer);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-green-600" />
          Experiencia de Voluntariado
          <HarvardFormatTip section="volunteer" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {volunteer.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay experiencias de voluntariado agregadas</p>
            <p className="text-sm">El voluntariado demuestra compromiso social y liderazgo</p>
          </div>
        ) : (
          <div className="space-y-6">
            {volunteer.map((vol, index) => (
              <div key={vol.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-green-900">Voluntariado #{index + 1}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVolunteer(index)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`organization-${vol.id}`}>Organización *</Label>
                    <Input
                      id={`organization-${vol.id}`}
                      value={vol.organization}
                      onChange={(e) => updateVolunteer(index, 'organization', e.target.value)}
                      placeholder="Ej: Cruz Roja, ONG Educación, Fundación..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`position-${vol.id}`}>Rol/Posición *</Label>
                    <Input
                      id={`position-${vol.id}`}
                      value={vol.position}
                      onChange={(e) => updateVolunteer(index, 'position', e.target.value)}
                      placeholder="Ej: Coordinador de eventos, Tutor, Líder de equipo"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`location-${vol.id}`}>Ubicación</Label>
                    <div className="relative">
                      <Input
                        id={`location-${vol.id}`}
                        value={vol.location || ''}
                        onChange={(e) => updateVolunteer(index, 'location', e.target.value)}
                        placeholder="Ciudad, País"
                        className="mt-1 pl-8"
                      />
                      <MapPin className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`startDate-${vol.id}`}>Fecha de inicio *</Label>
                      <Input
                        id={`startDate-${vol.id}`}
                        type="month"
                        value={vol.startDate}
                        onChange={(e) => updateVolunteer(index, 'startDate', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`endDate-${vol.id}`}>
                        {vol.currentlyVolunteering ? 'Fecha de fin (opcional)' : 'Fecha de fin *'}
                      </Label>
                      <Input
                        id={`endDate-${vol.id}`}
                        type="month"
                        value={vol.endDate}
                        onChange={(e) => updateVolunteer(index, 'endDate', e.target.value)}
                        disabled={vol.currentlyVolunteering}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id={`currentlyVolunteering-${vol.id}`}
                    checked={vol.currentlyVolunteering}
                    onCheckedChange={(checked) => {
                      updateVolunteer(index, 'currentlyVolunteering', checked);
                      if (checked) {
                        updateVolunteer(index, 'endDate', '');
                      }
                    }}
                  />
                  <Label htmlFor={`currentlyVolunteering-${vol.id}`} className="text-sm font-medium">
                    Actualmente colaborando como voluntario
                  </Label>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`description-${vol.id}`}>Descripción de actividades *</Label>
                    <Textarea
                      id={`description-${vol.id}`}
                      value={vol.description}
                      onChange={(e) => updateVolunteer(index, 'description', e.target.value)}
                      placeholder="Describe tus responsabilidades y actividades principales como voluntario..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`impact-${vol.id}`}>Impacto y logros</Label>
                    <Textarea
                      id={`impact-${vol.id}`}
                      value={vol.impact || ''}
                      onChange={(e) => updateVolunteer(index, 'impact', e.target.value)}
                      placeholder="Ej: Coordiné eventos que recaudaron $5,000 para educación, capacité a 50 jóvenes..."
                      rows={2}
                      className="mt-1"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      💡 Incluye números específicos cuando sea posible
                    </p>
                  </div>

                  {/* Habilidades desarrolladas */}
                  <div>
                    <Label>Habilidades desarrolladas/aplicadas</Label>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(vol.skills || []).map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="bg-green-100 text-green-800">
                            {skill}
                            <button
                              onClick={() => removeSkill(index, skillIndex)}
                              className="ml-1 hover:text-green-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Agregar habilidad (presiona Enter)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill(index, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Presiona Enter para agregar cada habilidad
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={addVolunteer}
          variant="outline"
          className="w-full border-dashed border-2 border-green-300 text-green-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Experiencia de Voluntariado
        </Button>
      </CardContent>
    </Card>
  );
}