'use client';

import React from 'react';
import { PersonalInfo } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Linkedin, Sparkles } from 'lucide-react';
import { cvAIEnhancementService } from '@/services/cvAIEnhancementService';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onUpdate: (personalInfo: PersonalInfo) => void;
}

export default function PersonalInfoForm({ personalInfo, onUpdate }: PersonalInfoFormProps) {
  const [isEnhancingProfile, setIsEnhancingProfile] = useState(false);
  
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onUpdate({
      ...personalInfo,
      [field]: value
    });
  };

  const enhanceProfileWithAI = async () => {
    if (!personalInfo.summary) {
      alert('Por favor, escribe un resumen inicial antes de mejorarlo con IA.');
      return;
    }
    
    try {
      setIsEnhancingProfile(true);
      const enhancedSummary = await cvAIEnhancementService.enhanceSummary(
        personalInfo.summary,
        'harvard'
      );
      handleChange('summary', enhancedSummary);
    } catch (error) {
      console.error('Error al mejorar el perfil:', error);
      alert('No se pudo mejorar el perfil. Por favor, inténtalo más tarde.');
    } finally {
      setIsEnhancingProfile(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-[#028bbf]" />
          Información Personal - Formato Harvard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nombre y Contacto */}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div>
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación *
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

        {/* LinkedIn */}
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

        {/* Resumen Profesional */}
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="summary">
              Resumen Profesional *
            </Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={enhanceProfileWithAI}
              disabled={isEnhancingProfile}
              className="flex items-center gap-1 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
            >
              {isEnhancingProfile ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-700"></div>
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {isEnhancingProfile ? 'Mejorando...' : 'Mejorar con IA'}
            </Button>
          </div>
          <Textarea
            id="summary"
            value={personalInfo.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="Breve resumen (2-3 oraciones) destacando tu experiencia profesional más relevante y objetivos profesionales específicos."
            rows={4}
            className="resize-none mt-1"
            required
          />
        </div>

        {/* Guía de Formato Harvard */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-blue-900 mb-2">📝 Formato Harvard - Información Personal:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El nombre debe ir en un formato claro y formal</li>
            <li>• La información de contacto debe ser profesional y actual</li>
            <li>• El resumen debe ser breve y enfocado en logros relevantes</li>
            <li>• Usa un tono profesional y directo</li>
            <li>• Adapta el resumen al puesto específico que buscas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
