import { NextRequest, NextResponse } from 'next/server';
import { 
  uploadFileToR2, 
  generateUniqueFileName, 
  validateFileType, 
  validateFileSize,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS 
} from '@/services/cloudflareR2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'cv', 'audio', 'video', 'image'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    let allowedTypes: string[] = [];
    let maxSize: number = 10; // Default 10MB

    switch (fileType) {
      case 'cv':
        allowedTypes = ALLOWED_FILE_TYPES.CV;
        maxSize = FILE_SIZE_LIMITS.CV;
        break;
      case 'audio':
        allowedTypes = ALLOWED_FILE_TYPES.AUDIO;
        maxSize = FILE_SIZE_LIMITS.AUDIO;
        break;
      case 'video':
        allowedTypes = ALLOWED_FILE_TYPES.VIDEO;
        maxSize = FILE_SIZE_LIMITS.VIDEO;
        break;
      case 'image':
        allowedTypes = ALLOWED_FILE_TYPES.IMAGE;
        maxSize = FILE_SIZE_LIMITS.IMAGE;
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de archivo no válido' },
          { status: 400 }
        );
    }

    // Validar tipo MIME
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (!validateFileSize(file, maxSize)) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB` },
        { status: 400 }
      );
    }

    // Generar nombre único
    const uniqueFileName = generateUniqueFileName(file.name, fileType);

    // Subir archivo a R2
    const publicUrl = await uploadFileToR2(file, uniqueFileName, file.type);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al subir el archivo' },
      { status: 500 }
    );
  }
}
