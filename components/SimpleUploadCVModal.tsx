import { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { CVEmbeddingUnion } from '../services/matchPracticesService';

type CVEmbedding = {
  hard_skills: number[];
  soft_skills: number[];
  sector_afinnity: number[];
  general: number[];
};

interface SimpleUploadCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (cvData: { 
    fileName: string; 
    fileUrl: string; 
    fileEmbedding?: CVEmbeddingUnion;
  }) => void;
}

export default function SimpleUploadCVModal({
  isOpen,
  onClose,
  onUploadSuccess
}: SimpleUploadCVModalProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setError('Por favor selecciona un archivo PDF');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      // Subir archivo a R2
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'cv');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Error al subir el archivo');
      }

      const uploadResult = await uploadResponse.json();
      const fileUrl = uploadResult.url;

      if (!fileUrl) {
        throw new Error('Error: No se recibió la URL del archivo subido');
      }

      // Verificar si el documento del usuario existe en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Obtener la posición del usuario para el embedding
      const userData = userDoc.exists() ? userDoc.data() : null;
      const userPosition = userData?.position || null;
      
      // 🆕 OBTENER EMBEDDINGS DEL BACKEND (sin validaciones)
      let cv_embeddings: Record<string, any> | null = null;
      try {
        const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://127.0.0.1:8000/cvFileUrl_to_embedding' 
        : 'https://jobsmatch.onrender.com/cvFileUrl_to_embedding';
        
        console.log('🔍 Llamando API de embeddings:', { API_URL: API_URL, cv_url: fileUrl });
        
        const embeddingResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cv_url: fileUrl,
            desired_position: userPosition
          }),
        });
        
        if (embeddingResponse.ok) {
          const result = await embeddingResponse.json();
          console.log('✅ Respuesta del API de embedding:', { 
            hasEmbeddings: !!result.embeddings,
            keys: result.embeddings ? Object.keys(result.embeddings) : []
          });
          
          // Log detallado de la estructura de embeddings recibida
          console.log('🔍 Estructura de embeddings recibida:', {
            hasEmbeddings: !!result.embeddings,
            isObject: typeof result.embeddings === 'object',
            keys: Object.keys(result.embeddings || {}),
            sampleValue: result.embeddings ? result.embeddings.general : 'No hay embeddings'
          });
          
          if (result.embeddings && typeof result.embeddings === 'object') {
            // Asegurarse de que no haya propiedades _value anidadas
            const cleanEmbeddings: any = {};
            const aspects = ['hard_skills', 'soft_skills', 'sector_afinnity', 'general'];
            
            for (const aspect of aspects) {
              if (result.embeddings[aspect]) {
                // Si el aspecto tiene _value, extraerlo, de lo contrario usar directamente
                cleanEmbeddings[aspect] = result.embeddings[aspect]._value || result.embeddings[aspect];
                
                // Asegurarse de que sea un array
                if (!Array.isArray(cleanEmbeddings[aspect])) {
                  console.warn(`⚠️ El aspecto ${aspect} no es un array:`, cleanEmbeddings[aspect]);
                  cleanEmbeddings[aspect] = [];
                }
              } else {
                console.warn(`⚠️ Falta el aspecto requerido: ${aspect}`);
                cleanEmbeddings[aspect] = [];
              }
            }
            
            // Log de la estructura limpia
            console.log('🔄 Estructura de embeddings limpia:', {
              keys: Object.keys(cleanEmbeddings),
              sampleValue: cleanEmbeddings.general ? 
                `Array de ${cleanEmbeddings.general.length} elementos` : 'No hay datos'
            });
            
            cv_embeddings = cleanEmbeddings;
          } else {
            console.warn('⚠️ La respuesta no contiene embeddings en el formato esperado:', result);
          }
        } else {
          const errorText = await embeddingResponse.text();
          console.error('❌ Error en la API:', {
            status: embeddingResponse.status,
            error: errorText
          });
        }
      } catch (error) {
        console.error('❌ Error llamando al API de embeddings:', error);
        // Continuar con la subida aunque falle el embedding
      }

      // 🔍 DEBUG: Verificar qué se va a guardar en Firestore
      if (cv_embeddings) {
        const embeddingInfo = Array.isArray(cv_embeddings) 
          ? {
              type: 'legacy_array',
              length: cv_embeddings.length
            }
          : {
              type: 'multi_aspect_object',
              aspects: Object.keys(cv_embeddings),
              totalVectors: Object.values(cv_embeddings).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0)
            };
            
        console.log('💾 Preparando embedding para Firestore:', embeddingInfo);
      } else {
        console.log('⚠️ No hay embedding válido para guardar en Firestore');
      }

      if (!userDoc.exists()) {
        // Si el usuario no existe, crear el documento
        await setDoc(userDocRef, {
          displayName: user.displayName,
          email: user.email,
          cvFileName: selectedFile.name,
          cvFileUrl: fileUrl,
          hasCV: true,
          cvUploadedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...(cv_embeddings && { cv_embeddings: cv_embeddings }) // 🆕 Nuevo campo: cv_embeddings
        });
        
        console.log('✅ Usuario CREADO en Firestore:', {
          userId: user.uid,
          cvFileName: selectedFile.name,
          hasEmbedding: !!cv_embeddings,
          embeddingType: cv_embeddings ? (Array.isArray(cv_embeddings) ? 'legacy_array' : 'multi_aspect') : 'none',
          savedField: cv_embeddings ? 'cv_embeddings' : 'none'
        });
      } else {
        // Si el usuario ya existe, actualizar los campos correspondientes
        await updateDoc(userDocRef, {
          cvFileName: selectedFile.name,
          cvFileUrl: fileUrl,
          hasCV: true,
          cvUploadedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...(cv_embeddings && { cv_embeddings: cv_embeddings }) // 🆕 Nuevo campo: cv_embeddings
        });
        
        console.log('✅ Usuario ACTUALIZADO en Firestore:', {
          userId: user.uid,
          cvFileName: selectedFile.name,
          hasEmbedding: !!cv_embeddings,
          embeddingType: cv_embeddings ? (Array.isArray(cv_embeddings) ? 'legacy_array' : 'multi_aspect') : 'none',
          savedField: cv_embeddings ? 'cv_embeddings' : 'none'
        });
      }

      // Notificar éxito
      onUploadSuccess({
        fileName: selectedFile.name,
        fileUrl: fileUrl,
        fileEmbedding: cv_embeddings as CVEmbedding || undefined
      });

      // Cerrar modal
      resetModal();
      onClose();

    } catch (error: any) {
      console.error('Error subiendo CV:', error);
      setError(error.message || 'Error al subir el CV. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setError('');
    setIsUploading(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Subir CV
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">
              Sube tu CV para ver prácticas personalizadas
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* File Input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            {selectedFile ? (
              <div className="border-2 border-green-200 border-dashed rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-gray-300 border-dashed rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">
                  Haz clic para seleccionar tu CV
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Solo archivos PDF (máximo 10MB)
                </p>
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 px-4 py-2 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Subiendo...' : 'Subir CV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
