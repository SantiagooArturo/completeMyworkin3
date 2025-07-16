'use client';

import { useState } from 'react';
import { X, User, Phone, MapPin, Briefcase, GraduationCap, Code, Globe, CheckCircle2, AlertTriangle, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { MappingResult, ConflictInfo, NewDataInfo, CVProfileMappingService } from '@/services/cvProfileMappingService';
import { User as FirebaseUser } from 'firebase/auth';

interface CVProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mappingResult: MappingResult | null;
  user: FirebaseUser | null;
  onApplyChanges: () => void;
}

export default function CVProfilePreviewModal({
  isOpen,
  onClose,
  mappingResult,
  user,
  onApplyChanges
}: CVProfilePreviewModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [conflictResolutions, setConflictResolutions] = useState<{ [field: string]: 'keep_current' | 'use_new' }>({});
  const [showPreview, setShowPreview] = useState(true);

  if (!isOpen || !mappingResult) return null;

  const { conflicts, newData, summary } = mappingResult;

  // Inicializar resoluciones de conflictos con las recomendaciones
  if (Object.keys(conflictResolutions).length === 0 && conflicts.length > 0) {
    const initialResolutions: { [field: string]: 'keep_current' | 'use_new' } = {};
    conflicts.forEach(conflict => {
      initialResolutions[conflict.field] = conflict.recommendation === 'use_new' ? 'use_new' : 'keep_current';
    });
    setConflictResolutions(initialResolutions);
  }

  const handleApply = async () => {
    if (!user || !mappingResult) return;
    
    setIsApplying(true);
    try {
      await CVProfileMappingService.applyProfileUpdates(
        user,
        mappingResult.profileUpdates,
        conflicts,
        conflictResolutions
      );
      
      onApplyChanges();
      onClose();
    } catch (error) {
      console.error('Error aplicando cambios:', error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsApplying(false);
    }
  };

  const toggleConflictResolution = (field: string) => {
    setConflictResolutions(prev => ({
      ...prev,
      [field]: prev[field] === 'use_new' ? 'keep_current' : 'use_new'
    }));
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'position': return <Briefcase className="h-4 w-4" />;
      case 'university': return <GraduationCap className="h-4 w-4" />;
      case 'bio': return <User className="h-4 w-4" />;
      case 'skills': return <Code className="h-4 w-4" />;
      case 'languages': return <Globe className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      phone: 'Teléfono',
      location: 'Ubicación',
      position: 'Posición actual',
      university: 'Universidad',
      bio: 'Biografía',
      skills: 'Habilidades',
      languages: 'Idiomas',
      linkedin: 'LinkedIn',
      portfolio: 'Portfolio'
    };
    return labels[field] || field;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Datos Extraídos del CV</h2>
              <p className="text-blue-100">Revisa y confirma los datos antes de aplicar al perfil</p>
            </div>
          </div>

          {/* Resumen estadístico */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{summary.newFields}</div>
              <div className="text-sm text-blue-100">Campos nuevos</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{summary.conflicts}</div>
              <div className="text-sm text-blue-100">Conflictos</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{summary.experienceEntries + summary.educationEntries}</div>
              <div className="text-sm text-blue-100">Timeline datos</div>
            </div>
          </div>
        </div>

        {/* Toggle Preview */}
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPreview ? 'Ocultar detalles' : 'Mostrar detalles'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto">
          
          {/* Resumen amigable */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              Resumen de Cambios
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {CVProfileMappingService.generateUserFriendlySummary(mappingResult)}
            </div>
          </div>

          {showPreview && (
            <>
              {/* Conflictos */}
              {conflicts.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                    Conflictos Detectados ({conflicts.length})
                  </h3>
                  <div className="space-y-4">
                    {conflicts.map((conflict, index) => (
                      <div key={index} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getFieldIcon(conflict.field)}
                              <span className="font-medium text-gray-900">
                                {getFieldLabel(conflict.field)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600 mb-1">Valor actual:</div>
                                <div className="bg-white p-2 rounded border">
                                  {String(conflict.currentValue)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600 mb-1">Valor del CV:</div>
                                <div className="bg-white p-2 rounded border">
                                  {String(conflict.newValue)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-600">
                              💡 {conflict.reason}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <button
                              onClick={() => toggleConflictResolution(conflict.field)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                conflictResolutions[conflict.field] === 'use_new'
                                  ? 'bg-[#028bbf] text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {conflictResolutions[conflict.field] === 'use_new' ? 'Usar nuevo' : 'Mantener actual'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nuevos datos */}
              {newData.length > 0 && (
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Nuevos Datos a Agregar ({newData.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newData.map((item, index) => (
                      <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 rounded-full p-2">
                            {getFieldIcon(item.field)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">
                              {getFieldLabel(item.field)}
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              {Array.isArray(item.value) 
                                ? item.value.join(', ') 
                                : String(item.value)
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {summary.autoApplied} cambios se aplicarán automáticamente
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="flex items-center space-x-2 bg-[#028bbf] hover:bg-[#027ba8] text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Aplicando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Aplicar Cambios</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 