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
    console.log('📤 === INICIO API UPLOAD ===');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'cv', 'audio', 'video', 'image'
    
    console.log('📋 Datos recibidos:', {
      file: file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : 'NULL',
      fileType: fileType
    });
    
    if (!file) {
      console.error('❌ No se proporcionó archivo');
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    console.log('🔍 Validando tipo de archivo...');
    
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
        console.error('❌ Tipo de archivo no válido:', fileType);
        return NextResponse.json(
          { error: `Tipo de archivo no válido: ${fileType}` },
          { status: 400 }
        );
    }

    console.log('🔍 Configuración para tipo:', {
      fileType,
      allowedTypes,
      maxSize: `${maxSize}MB`
    });

    // Validar tipo MIME
    if (!validateFileType(file, allowedTypes)) {
      console.error('❌ Tipo MIME no permitido:', file.type);
      return NextResponse.json(
        { error: `Tipo de archivo no permitido. Tipo recibido: ${file.type}. Tipos permitidos: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (!validateFileSize(file, maxSize)) {
      console.error('❌ Archivo demasiado grande:', `${file.size} bytes > ${maxSize}MB`);
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Tamaño actual: ${Math.round(file.size/1024/1024*100)/100}MB, máximo: ${maxSize}MB` },
        { status: 400 }
      );
    }

    console.log('✅ Validaciones pasadas, generando nombre único...');
    
    // Generar nombre único
    const uniqueFileName = generateUniqueFileName(file.name, fileType);
    console.log('📁 Nombre único generado:', uniqueFileName);

    console.log('📤 Subiendo archivo a R2...');
    
    // Subir archivo a R2
    const publicUrl = await uploadFileToR2(file, uniqueFileName, file.type);

    console.log('✅ Upload exitoso a R2:', publicUrl);
    console.log('📤 === FIN API UPLOAD ===');

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('❌ === ERROR EN API UPLOAD ===');
    console.error('❌ Error completo:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al subir el archivo',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
