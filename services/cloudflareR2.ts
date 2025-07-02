import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración del cliente S3 para Cloudflare R2
const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 usa 'auto' como región
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'myworkin-uploads';
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

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

    // Crear comando de subida
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
      // Hacer el archivo público para lectura
      ACL: 'public-read',
    });

    // Ejecutar la subida
    await r2Client.send(command);

    // Retornar la URL pública
    const publicUrl = `${PUBLIC_URL}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
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
  return allowedTypes.includes(file.type);
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
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Límites de tamaño por tipo de archivo (en MB)
export const FILE_SIZE_LIMITS = {
  CV: 10,     // 10MB para CVs
  AUDIO: 50,  // 50MB para audios de entrevista
  VIDEO: 100, // 100MB para videos de entrevista
  IMAGE: 5,   // 5MB para imágenes
};
