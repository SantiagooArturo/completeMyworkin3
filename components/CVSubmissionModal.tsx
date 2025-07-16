import React, { useState, useRef } from 'react';
import { X, Upload, Briefcase, FileUp } from 'lucide-react';

interface CVSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cvFile: File, puesto: string) => Promise<void>;
  interestedRoles: string[];
}

export default function CVSubmissionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  interestedRoles 
}: CVSubmissionModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPuesto, setSelectedPuesto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar archivo
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('El archivo es demasiado grande (máximo 10MB)');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor selecciona tu CV');
      return;
    }

    if (!selectedPuesto) {
      setError('Por favor selecciona el puesto que te interesa');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(selectedFile, selectedPuesto);
    } catch (error) {
      setError('Error al procesar tu solicitud. Inténtalo de nuevo.');
      console.error('Error en CVSubmissionModal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setSelectedPuesto('');
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Encuentra Prácticas Compatibles
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-8 w-8 text-[#028bbf]" />
            </div>
            <p className="text-gray-600 text-sm">
              Sube tu CV y selecciona el puesto que te interesa para encontrar prácticas compatibles con tu perfil.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu CV (PDF) <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isSubmitting}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer
                hover:border-[#028bbf] hover:bg-blue-50 transition-colors
                ${selectedFile ? 'border-[#028bbf] bg-blue-50' : ''}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileUp className="h-8 w-8 text-[#028bbf] mx-auto" />
                  <p className="text-sm font-medium text-[#028bbf]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Haz clic para seleccionar tu CV
                  </p>
                  <p className="text-xs text-gray-500">
                    Solo archivos PDF, máximo 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Puesto selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puesto que te interesa <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPuesto}
              onChange={(e) => setSelectedPuesto(e.target.value)}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent"
            >
              <option value="">Selecciona un puesto</option>
              {interestedRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile || !selectedPuesto}
              className="flex-1 px-4 py-3 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Procesando...' : 'Buscar Prácticas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
