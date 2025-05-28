'use client';

import React from 'react';
import { PersonalInfo } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onUpdate: (personalInfo: PersonalInfo) => void;
}

export default function PersonalInfoForm({ personalInfo, onUpdate }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onUpdate({
      ...personalInfo,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-[#028bbf]" />
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre Completo *
            </Label>
            <Input
              id="fullName"
              value={personalInfo.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Ej: Juan Carlos Pérez García"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo Electrónico *
            </Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Ej: juan.perez@email.com"
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono *
            </Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Ej: +51 999 888 777"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección *
            </Label>
            <Input
              id="address"
              value={personalInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ej: Lima, Perú"
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedIn" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn (Opcional)
            </Label>
            <Input
              id="linkedIn"
              value={personalInfo.linkedIn || ''}
              onChange={(e) => handleChange('linkedIn', e.target.value)}
              placeholder="Ej: linkedin.com/in/juan-perez"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Sitio Web (Opcional)
            </Label>
            <Input
              id="website"
              value={personalInfo.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="Ej: www.juanperez.com"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="summary">
            Resumen Profesional *
          </Label>
          <Textarea
            id="summary"
            value={personalInfo.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="Describe brevemente tu perfil profesional, experiencia y objetivos (2-3 párrafos)"
            rows={6}
            className="resize-none mt-1"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            <strong>Formato Harvard:</strong> Este resumen aparecerá al inicio de tu CV y debe ser claro, 
            conciso y destacar tus principales fortalezas profesionales.
          </p>
        </div>

        {/* Consejos para el formato Harvard */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para el Formato Harvard:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Mantén un orden cronológico inverso en experiencia y educación</li>
            <li>• Usa un lenguaje formal y profesional</li>
            <li>• Sé específico con fechas, lugares y logros</li>
            <li>• Incluye palabras clave relevantes para tu área profesional</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
