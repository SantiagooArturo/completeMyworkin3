import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración del cliente S3 para Cloudflare R2
const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

console.log('🔧 Configuración R2:', {
  endpoint: r2Endpoint ? 'CONFIGURADO' : 'FALTANTE',
  accessKeyId: r2AccessKeyId ? 'CONFIGURADO' : 'FALTANTE',
  secretAccessKey: r2SecretAccessKey ? 'CONFIGURADO' : 'FALTANTE',
  endpointPreview: r2Endpoint ? `${r2Endpoint.substring(0, 30)}...` : 'UNDEFINED'
});

if (!r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey) {
  console.error('❌ Variables de entorno R2 faltantes:', {
    R2_ENDPOINT: !!r2Endpoint,
    R2_ACCESS_KEY_ID: !!r2AccessKeyId,
    R2_SECRET_ACCESS_KEY: !!r2SecretAccessKey
  });
}

const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 usa 'auto' como región
  endpoint: r2Endpoint || '',
  credentials: {
    accessKeyId: r2AccessKeyId || '',
    secretAccessKey: r2SecretAccessKey || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'myworkin-uploads';
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

console.log('🔧 Variables adicionales R2:', {
  BUCKET_NAME,
  PUBLIC_URL: PUBLIC_URL ? 'CONFIGURADO' : 'FALTANTE',
  PUBLIC_URL_preview: PUBLIC_URL ? `${PUBLIC_URL.substring(0, 30)}...` : 'UNDEFINED'
});

if (!PUBLIC_URL) {
  console.error('❌ NEXT_PUBLIC_R2_PUBLIC_URL no está configurada');
}

/**
 * Subir un archivo a Cloudflare R2
 * @param file - Archivo a subir (File o Buffer)
 * @param fileName - Nombre del archivo en el bucket
 * @param contentType - Tipo de contenido (opcional)
 * @returns URL pública del archivo subido
 */
export async function uploadFileToR2(
  file: File | Buffer,
  fileName: string,
  contentType?: string
): Promise<string> {
  try {
    console.log('📤 === INICIO UPLOAD R2 ===');
    console.log('📁 Archivo a subir:', {
      fileName,
      contentType,
      fileType: file instanceof File ? 'File' : 'Buffer',
      size: file instanceof File ? file.size : file.length
    });

    // Validar configuración
    if (!BUCKET_NAME) {
      throw new Error('R2_BUCKET_NAME no configurado');
    }

    if (!PUBLIC_URL) {
      throw new Error('NEXT_PUBLIC_R2_PUBLIC_URL no configurado');
    }

    if (!r2Endpoint) {
      throw new Error('R2_ENDPOINT no configurado');
    }

    if (!r2AccessKeyId || !r2SecretAccessKey) {
      throw new Error('Credenciales R2 no configuradas');
    }

    console.log('✅ Configuración R2 válida');

    let buffer: Buffer;
    let mimeType: string;

    // Convertir File a Buffer si es necesario
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mimeType = file.type || contentType || 'application/octet-stream';
    } else {
      buffer = file;
      mimeType = contentType || 'application/octet-stream';
    }

    console.log('📋 Datos preparados:', {
      bufferSize: buffer.length,
      mimeType,
      bucketName: BUCKET_NAME,
      fileName
    });

    // Crear comando de subida
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
      // Hacer el archivo público para lectura
      ACL: 'public-read',
    });

    console.log('📤 Enviando a R2...');

    // Ejecutar la subida
    const result = await r2Client.send(command);
    
    console.log('✅ Upload exitoso a R2:', {
      ETag: result.ETag,
      VersionId: result.VersionId
    });

    // Retornar la URL pública
    const publicUrl = `${PUBLIC_URL}/${fileName}`;
    
    console.log('🔗 URL pública generada:', publicUrl);
    console.log('� Variables usadas:', {
      PUBLIC_URL,
      fileName,
      PUBLIC_URL_length: PUBLIC_URL.length,
      fileName_length: fileName.length
    });
    console.log('�📤 === FIN UPLOAD R2 ===');
    
    if (!publicUrl || publicUrl === `/${fileName}`) {
      console.error('❌ URL pública inválida generada');
      throw new Error('Error generando URL pública: PUBLIC_URL no configurada');
    }
    
    return publicUrl;
  } catch (error) {
    console.error('❌ === ERROR UPLOAD R2 ===');
    console.error('❌ Error completo:', error);
    
    if (error instanceof Error) {
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Stack:', error.stack);
      
      // Errores específicos de AWS/R2
      if ('$metadata' in error) {
        console.error('❌ AWS Metadata:', (error as any).$metadata);
      }
      
      if ('Code' in error) {
        console.error('❌ AWS Error Code:', (error as any).Code);
      }
    }
    
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generar una URL firmada para acceso temporal a un archivo privado
 * @param fileName - Nombre del archivo en el bucket
 * @param expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
 * @returns URL firmada para acceso temporal
 */
export async function getSignedUrlFromR2(
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generar un nombre de archivo único con timestamp
 * @param originalName - Nombre original del archivo
 * @param prefix - Prefijo opcional (ej: 'cv', 'interview-audio')
 * @returns Nombre de archivo único
 */
export function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  
  const baseName = originalName.replace(/\.[^/.]+$/, ''); // Quitar extensión
  const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_'); // Caracteres seguros
  
  const prefixPart = prefix ? `${prefix}_` : '';
  return `${prefixPart}${safeName}_${timestamp}_${randomSuffix}.${extension}`;
}

/**
 * Validar tipos de archivo permitidos
 * @param file - Archivo a validar
 * @param allowedTypes - Tipos MIME permitidos
 * @returns true si el archivo es válido
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  console.log('🔍 Validando tipo de archivo:', {
    fileName: file.name,
    fileType: file.type,
    allowedTypes
  });

  // Validación principal por MIME type
  if (allowedTypes.includes(file.type)) {
    console.log('✅ Tipo MIME válido:', file.type);
    return true;
  }

  // Para archivos de audio/video, ser más permisivo con MIME types vacíos o genéricos
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!file.type || file.type === 'application/octet-stream') {
    console.log('⚠️ MIME type vacío o genérico, validando por extensión:', extension);
    
    // Si es audio, validar por extensión
    if (allowedTypes.some(type => type.startsWith('audio/'))) {
      const audioExtensions = ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac', 'flac'];
      if (extension && audioExtensions.includes(extension)) {
        console.log('✅ Extensión de audio válida:', extension);
        return true;
      }
    }
    
    // Si es video, validar por extensión
    if (allowedTypes.some(type => type.startsWith('video/'))) {
      const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'wmv'];
      if (extension && videoExtensions.includes(extension)) {
        console.log('✅ Extensión de video válida:', extension);
        return true;
      }
    }
  }

  console.log('❌ Tipo de archivo no válido');
  return false;
}

/**
 * Validar tamaño de archivo
 * @param file - Archivo a validar
 * @param maxSizeInMB - Tamaño máximo en MB
 * @returns true si el archivo es válido
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// Tipos de archivo permitidos por categoría
export const ALLOWED_FILE_TYPES = {
  CV: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AUDIO: [
    'audio/mpeg', 
    'audio/wav', 
    'audio/ogg', 
    'audio/webm',
    'audio/mp3',
    'audio/m4a',
    'audio/aac',
    'audio/flac'
  ],
  VIDEO: [
    'video/mp4', 
    'video/webm', 
    'video/ogg', 
    'video/avi', 
    'video/mov',
    'video/mkv',
    'video/wmv'
  ],
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Límites de tamaño por tipo de archivo (en MB)
export const FILE_SIZE_LIMITS = {
  CV: 10,     // 10MB para CVs
  AUDIO: 50,  // 50MB para audios de entrevista
  VIDEO: 100, // 100MB para videos de entrevista
  IMAGE: 5,   // 5MB para imágenes
};
