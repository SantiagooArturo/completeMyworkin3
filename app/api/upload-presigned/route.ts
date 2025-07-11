import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
    try {
        const { filename, contentType } = await request.json();
        
        console.log('🔐 Generando presigned URL para:', { filename, contentType });
        
        // Validar parámetros
        if (!filename || !contentType) {
            return NextResponse.json(
                { error: 'filename y contentType son requeridos' },
                { status: 400 }
            );
        }
        
        // Configurar cliente S3 para Cloudflare R2
        // Usar variables CLOUDFLARE_R2_* o las existentes R2_* como respaldo
        const endpoint = process.env.R2_ENDPOINT;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        const bucketName = process.env.R2_BUCKET_NAME;
        const accountId = process.env.R2_ACCOUNT_ID;

        if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
            console.error('❌ Variables de entorno R2 faltantes:', {
                endpoint: !!endpoint,
                accessKeyId: !!accessKeyId,
                secretAccessKey: !!secretAccessKey,
                bucketName: !!bucketName
            });
            return NextResponse.json(
                { error: 'Configuración de R2 incompleta' },
                { status: 500 }
            );
        }

        const client = new S3Client({
            region: 'auto',
            endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        // Crear comando de upload
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: `interviews/${filename}`, // Organizarlo en carpeta
            ContentType: contentType,
            Metadata: {
                'uploaded-by': 'interview-simulation',
                'upload-timestamp': new Date().toISOString(),
            },
        });

        // Generar URL firmada (válida por 1 hora)
        const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
        
        // Construir URL pública para acceso posterior
        // Usar el dominio personalizado si está configurado, o el dominio por defecto
        const publicUrl = accountId 
            ? `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/interviews/${filename}`
            : `${endpoint}/interviews/${filename}`;  // Respaldo usando endpoint
        
        console.log('✅ Presigned URL generada exitosamente');
        
        return NextResponse.json({
            success: true,
            uploadUrl: signedUrl,
            publicUrl: publicUrl,
            expiresIn: 3600
        });

    } catch (error: any) {
        console.error('❌ Error generando presigned URL:', error);
        
        return NextResponse.json(
            { 
                error: 'Error interno del servidor al generar URL de upload',
                details: error.message 
            },
            { status: 500 }
        );
    }
}