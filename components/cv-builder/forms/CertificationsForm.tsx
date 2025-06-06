'use client';

import React from 'react';
import { Certification } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Award, Calendar, Building } from 'lucide-react';
import DatePicker from '@/components/ui/date-picker';

interface CertificationsFormProps {
  certifications: Certification[];
  onUpdate: (certifications: Certification[]) => void;
}

export default function CertificationsForm({ certifications, onUpdate }: CertificationsFormProps) {
  const addCertification = () => {
    const newCertification: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: ''
    };
    onUpdate([...certifications, newCertification]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updatedCertifications = certifications.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    );
    onUpdate(updatedCertifications);
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    onUpdate(updatedCertifications);
  };  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // Si el formato es YYYY-MM-DD, formatear en dd/mm/yyyy
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      // Si es YYYY-MM, formatear en mm/yyyy
      if (/^\d{4}-\d{2}$/.test(dateString)) {
        const [year, month] = dateString.split('-');
        return `${month}/${year}`;
      }
      
      // Para otros formatos, agregar día ficticio
      let safeDate = dateString;
      if (/^\d{4}-\d{2}$/.test(dateString)) {
        safeDate += '-01';
      }
      
      const date = new Date(safeDate);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('es-ES', {
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };
  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    
    try {
      let safeDate = expiryDate;
      if (/^\d{4}-\d{2}$/.test(expiryDate)) {
        safeDate += '-01';
      }
      return new Date(safeDate) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-[#028bbf]" />
          Certificaciones y Licencias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {certifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay certificaciones agregadas</p>
            <p className="text-sm">Agrega tus certificaciones profesionales</p>
          </div>
        ) : (
          <div className="space-y-6">
            {certifications.map((cert, index) => (
              <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {cert.name || `Certificación ${index + 1}`}
                    </h4>
                    {cert.expiryDate && isExpired(cert.expiryDate) && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Expirada
                      </span>
                    )}
                    {cert.expiryDate && !isExpired(cert.expiryDate) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Vigente
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Nombre de la Certificación *
                    </Label>
                    <Input
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      placeholder="Ej: AWS Certified Solutions Architect"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Organización Emisora *
                    </Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      placeholder="Ej: Amazon Web Services"
                      className="mt-1"
                    />
                  </div>
                </div>                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Obtención *
                    </Label>
                    <DatePicker
                      value={cert.date}
                      onChange={(date) => updateCertification(index, 'date', date)}
                      placeholder="Selecciona fecha de obtención"
                      className="mt-1"
                      required
                      maxDate={cert.expiryDate || undefined}
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Vencimiento (Opcional)
                    </Label>
                    <DatePicker
                      value={cert.expiryDate || ''}
                      onChange={(date) => updateCertification(index, 'expiryDate', date)}
                      placeholder="Selecciona fecha de vencimiento"
                      className="mt-1"
                      minDate={cert.date || undefined}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Solo si la certificación tiene fecha de vencimiento
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>ID de Credencial (Opcional)</Label>
                  <Input
                    value={cert.credentialId}
                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                    placeholder="Ej: AWS-SAA-12345678"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número de credencial para verificación
                  </p>
                </div>

                {/* Información adicional */}
                {cert.date && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">                    <p className="text-sm text-gray-600">
                      <strong>Obtenida:</strong> {formatDate(cert.date)}
                      {cert.expiryDate && (
                        <>
                          {' • '}
                          <strong>
                            {isExpired(cert.expiryDate) ? 'Expiró' : 'Expira'}:
                          </strong>{' '}
                          {formatDate(cert.expiryDate)}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={addCertification}
          variant="outline"
          className="w-full border-dashed border-2 border-[#028bbf] text-[#028bbf] hover:bg-[#028bbf] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Certificación
        </Button>

        {/* Consejos específicos para certificaciones en formato Harvard */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-indigo-900 mb-2">🏆 Formato Harvard - Certificaciones:</h4>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• Lista certificaciones en orden cronológico inverso</li>
            <li>• Incluye solo certificaciones relevantes para tu campo</li>
            <li>• Verifica que las certificaciones estén vigentes</li>
            <li>• Menciona el nombre completo y oficial de la certificación</li>
            <li>• Incluye la organización emisora reconocida</li>
            <li>• Agrega ID de credencial si está disponible para verificación</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
