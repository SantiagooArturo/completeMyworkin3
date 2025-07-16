import { useState, useCallback } from 'react';

interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  originalName?: string;
  size?: number;
  type?: string;
  error?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: UploadResult | null;
}

type FileType = 'cv' | 'audio' | 'video' | 'image';

export const useFileUpload = () => {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const uploadFile = useCallback(async (file: File, fileType: FileType): Promise<UploadResult> => {
    setState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setState(prev => ({ ...prev, progress: 50 }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el archivo');
      }

      const result = await response.json();
      
      setState({
        isUploading: false,
        progress: 100,
        error: null,
        result,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        result: null,
      });

      throw error;
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    resetState,
  };
};
