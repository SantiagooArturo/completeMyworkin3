import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configurar para archivos grandes
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    console.log('📤 === INICIO API UPLOAD ===');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📋 Datos recibidos:', {
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      fileType
    });

    // Verificar tamaño (100MB para Vercel Pro)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 413 }
      );
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const fileName = `${fileType}_${timestamp}_${randomString}.${extension}`;

    console.log('📁 Nombre único generado:', fileName);

    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📤 Subiendo archivo a R2...');
    console.log('📤 === INICIO UPLOAD R2 ===');

    // Subir a R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    const result = await client.send(command);
    console.log('✅ Upload exitoso a R2:', result);

    // Generar URL pública
    const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
    console.log('🔗 URL pública generada:', publicUrl);

    console.log('📤 === FIN API UPLOAD ===');

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error('❌ Error en upload:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
