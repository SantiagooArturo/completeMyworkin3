import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    console.log('🎤 === INICIO TRANSCRIPCIÓN API ===');
    
    const { audioUrl } = await request.json();
    console.log('🎤 Procesando transcripción para URL:', audioUrl);

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Descargar el archivo de audio
    console.log('📥 Descargando archivo de audio...');
    const audioResponse = await fetch(audioUrl);
    
    if (!audioResponse.ok) {
      console.error('❌ Error descargando audio:', audioResponse.status);
      return NextResponse.json(
        { error: `Failed to download audio: ${audioResponse.status}` },
        { status: 400 }
      );
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    console.log('✅ Audio descargado, tamaño:', audioBuffer.byteLength, 'bytes');

    if (audioBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Downloaded audio file is empty' },
        { status: 400 }
      );
    }

    // Crear archivo temporal (usando el método del ejemplo)
    const timestamp = Date.now();
    const tempFileName = `audio_${timestamp}.webm`;
    tempFilePath = join(tmpdir(), tempFileName);
    
    console.log('📝 Creando archivo temporal:', tempFilePath);
    
    // Escribir buffer al archivo temporal
    await writeFile(tempFilePath, Buffer.from(audioBuffer));
    console.log('✅ Archivo temporal creado');

    // Crear stream para Whisper
    const fileStream = createReadStream(tempFilePath);
    
    console.log('🤖 Enviando a Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: 'es',
      response_format: 'text', // Directamente texto, más simple
    });

    console.log('✅ Transcripción completada:', transcription);
    
    return NextResponse.json({ 
      transcription: transcription // Ya es string directamente
    });

  } catch (error: any) {
    console.error('❌ Error en transcripción:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing transcription' },
      { status: 500 }
    );
  } finally {
    // Limpiar archivo temporal
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('🗑️ Archivo temporal eliminado');
      } catch (cleanupError) {
        console.warn('⚠️ Error eliminando archivo temporal:', cleanupError);
      }
    }
  }
}
