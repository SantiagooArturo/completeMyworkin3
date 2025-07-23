import React, { useState } from 'react';
import { X, Building2, MapPin, DollarSign, Users, Briefcase, TrendingUp, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  SalarioContributionFormData,
  MODALIDAD_TRABAJO_OPTIONS,
  INDUSTRIA_OPTIONS,
  TAMANO_EMPRESA_OPTIONS
} from '../types/salarios';
import { SalarioContributionService } from '../services/salarioContributionService';

interface SalarioContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function SalarioContributionModal({ 
  isOpen, 
  onClose, 
  user 
}: SalarioContributionModalProps) {
  const [formData, setFormData] = useState<SalarioContributionFormData>({
    empresa: '',
    modalidadTrabajo: '',
    lugar: '',
    subvencionEconomica: '',
    industria: '',
    tamanoEmpresa: '',
    salarioContratado: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: keyof SalarioContributionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.empresa.trim()) {
      setError('El nombre de la empresa es requerido');
      return false;
    }
    if (!formData.modalidadTrabajo) {
      setError('La modalidad de trabajo es requerida');
      return false;
    }
    if (!formData.lugar.trim()) {
      setError('La ubicación es requerida');
      return false;
    }
    if (!formData.subvencionEconomica.trim()) {
      setError('La subvención económica es requerida');
      return false;
    }
    if (!formData.industria) {
      setError('La industria es requerida');
      return false;
    }
    if (!formData.tamanoEmpresa) {
      setError('El tamaño de la empresa es requerido');
      return false;
    }
    if (!formData.salarioContratado.trim()) {
      setError('El salario como contratado es requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await SalarioContributionService.saveContribution(user, formData);
      setIsSuccess(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          empresa: '',
          modalidadTrabajo: '',
          lugar: '',
          subvencionEconomica: '',
          industria: '',
          tamanoEmpresa: '',
          salarioContratado: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error enviando contribución:', error);
      setError(error instanceof Error ? error.message : 'Error al enviar la contribución');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setFormData({
      empresa: '',
      modalidadTrabajo: '',
      lugar: '',
      subvencionEconomica: '',
      industria: '',
      tamanoEmpresa: '',
      salarioContratado: ''
    });
    setError('');
    setIsSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-[#028bbf] p-2 rounded-lg text-white mr-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Contribuir con Datos</h2>
              <p className="text-sm text-gray-600">Ayúdanos a mantener actualizada nuestra base de datos</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="p-6 text-center">
            <div className="bg-green-50 rounded-2xl p-8">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">¡Contribución enviada!</h3>
              <p className="text-green-700">
                Gracias por ayudarnos a mantener actualizada nuestra base de datos de salarios.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Empresa */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 mr-1" />
                Empresa
              </label>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) => handleInputChange('empresa', e.target.value)}
                placeholder="Ej: Repsol Perú"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Modalidad de trabajo */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Briefcase className="h-4 w-4 mr-1" />
                Modalidad de trabajo
              </label>
              <select
                value={formData.modalidadTrabajo}
                onChange={(e) => handleInputChange('modalidadTrabajo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Selecciona una modalidad</option>
                {MODALIDAD_TRABAJO_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Lugar */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 mr-1" />
                Lugar
              </label>
              <input
                type="text"
                value={formData.lugar}
                onChange={(e) => handleInputChange('lugar', e.target.value)}
                placeholder="Ej: Lima"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Subvención Económica */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign className="h-4 w-4 mr-1" />
                Subvención Económica
              </label>
              <input
                type="text"
                value={formData.subvencionEconomica}
                onChange={(e) => handleInputChange('subvencionEconomica', e.target.value)}
                placeholder="Ej: S/ 1400"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Industria */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <TrendingUp className="h-4 w-4 mr-1" />
                Industria
              </label>
              <select
                value={formData.industria}
                onChange={(e) => handleInputChange('industria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Selecciona una industria</option>
                {INDUSTRIA_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Tamaño de la empresa */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Users className="h-4 w-4 mr-1" />
                Tamaño de la empresa
              </label>
              <select
                value={formData.tamanoEmpresa}
                onChange={(e) => handleInputChange('tamanoEmpresa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Selecciona el tamaño</option>
                {TAMANO_EMPRESA_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Salario como contratado */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign className="h-4 w-4 mr-1" />
                Salario como contratado (entry-level)
              </label>
              <input
                type="text"
                value={formData.salarioContratado}
                onChange={(e) => handleInputChange('salarioContratado', e.target.value)}
                placeholder="Ej: S/ 5,000 - S/ 7,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Contribuir
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 