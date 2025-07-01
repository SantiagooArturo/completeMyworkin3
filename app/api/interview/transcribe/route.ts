import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import ffmpeg from 'fluent-ffmpeg';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para convertir a MP3
function convertToMp3(inputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = `${inputPath}.mp3`;
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

export async function POST(request: NextRequest) {
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;

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

    // Crear archivo temporal de entrada
    const timestamp = Date.now();
    const tempFileName = `audio_${timestamp}.webm`;
    tempInputPath = join(tmpdir(), tempFileName);

    console.log('📝 Creando archivo temporal de entrada:', tempInputPath);
    await writeFile(tempInputPath, Buffer.from(audioBuffer));
    console.log('✅ Archivo temporal de entrada creado');

    // Convertir a MP3
    console.log('🔄 Convirtiendo a MP3...');
    tempOutputPath = await convertToMp3(tempInputPath);
    console.log('✅ Conversión a MP3 completada:', tempOutputPath);

    // Crear stream para Whisper desde el archivo MP3
    const fileStream = createReadStream(tempOutputPath);

    console.log('🤖 Enviando a Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: 'es',
      response_format: 'text',
    });

    console.log('✅ Transcripción completada:', transcription);

    return NextResponse.json({
      transcription: transcription,
    });

  } catch (error: any) {
    console.error('❌ Error en transcripción:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing transcription' },
      { status: 500 }
    );
  } finally {
    // Limpiar archivos temporales
    if (tempInputPath) {
      try {
        await unlink(tempInputPath);
        console.log('🗑️ Archivo temporal de entrada eliminado');
      } catch (cleanupError) {
        console.warn('⚠️ Error eliminando archivo temporal de entrada:', cleanupError);
      }
    }
    if (tempOutputPath) {
      try {
        await unlink(tempOutputPath);
        console.log('🗑️ Archivo temporal de salida eliminado');
      } catch (cleanupError) {
        console.warn('⚠️ Error eliminando archivo temporal de salida:', cleanupError);
      }
    }
  }
}