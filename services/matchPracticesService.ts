// Tipo para embeddings multi-aspecto
type CVEmbedding = {
  hard_skills: number[];
  soft_skills: number[];
  sector_afinnity: number[];
  general: number[];
};

export type CVEmbeddingUnion = CVEmbedding;

import { db } from '@/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export async function uploadCVEmbeddings(userId: string, cvUrl: string, desiredPosition?: string) {
  console.log('🚀 Iniciando uploadCVEmbeddings con:', { userId, cvUrl, desiredPosition });
  
  const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8000/cvFileUrl_to_embedding'
    : 'https://jobsmatch.onrender.com/cvFileUrl_to_embedding';

  // Función interna para limpiar embeddings
  const cleanEmbeddings = (rawEmbeddings: Record<string, any>) => {
    const aspects = ['hard_skills', 'soft_skills', 'sector_afinnity', 'general'];
    const cleaned: Record<string, number[]> = {};

    for (const aspect of aspects) {
      if (rawEmbeddings[aspect]) {
        let value = rawEmbeddings[aspect]._value || rawEmbeddings[aspect];
        if (!Array.isArray(value)) {
          console.warn(`⚠️ El aspecto "${aspect}" no es un array válido`, value);
          value = [];
        }
        cleaned[aspect] = value;
      } else {
        console.warn(`⚠️ Falta el aspecto requerido: ${aspect}`);
        cleaned[aspect] = [];
      }
    }
    return cleaned;
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_url: cvUrl, desired_position: desiredPosition })
    });

    if (!res.ok) throw new Error(`Error API embeddings: ${await res.text()}`);

    const { embeddings } = await res.json();
    if (!embeddings || typeof embeddings !== 'object') throw new Error('Embeddings inválidos');

    // Limpiar estructura para asegurar formato correcto
    const embeddingsClean = cleanEmbeddings(embeddings);

    await updateDoc(doc(db, 'users', userId), { cv_embeddings: embeddingsClean });
    console.log('✅ Embeddings limpiados y guardados en Firestore');
    return embeddingsClean;

  } catch (err) {
    console.error('❌ No se pudieron guardar embeddings:', err);
    return null;
  }
}



// Normalizar la estructura de los embeddings para asegurar que sea un objeto directo
function normalizeEmbeddings(embeddings: any): CVEmbedding | undefined {
  if (!embeddings) return undefined;
  
  // Si los embeddings están dentro de una propiedad _value, extraerlos
  if (embeddings._value && typeof embeddings._value === 'object') {
    embeddings = embeddings._value;
  }
  
  // Asegurarse de que todos los campos requeridos estén presentes
  const requiredAspects = ['hard_skills', 'soft_skills', 'sector_afinnity', 'general'];
  const normalized: any = {};
  
  for (const aspect of requiredAspects) {
    if (embeddings[aspect]) {
      // Si el aspecto existe, asegurarse de que sea un array
      normalized[aspect] = Array.isArray(embeddings[aspect]) 
        ? embeddings[aspect] 
        : [];
    } else {
      // Si falta algún aspecto, devolver undefined
      return undefined;
    }
  }
  
  return normalized as CVEmbedding;
}

// Validar si un embedding es multi-aspecto válido
function isValidMultiAspectEmbedding(embedding?: CVEmbeddingUnion): embedding is CVEmbedding {
  if (!embedding) return false;
  
  const requiredAspects = ['hard_skills', 'soft_skills', 'sector_afinnity', 'general'];
  return requiredAspects.every(aspect => 
    aspect in embedding && 
    Array.isArray(embedding[aspect as keyof CVEmbedding]) &&
    embedding[aspect as keyof CVEmbedding].length > 0
  );
}

export interface MatchPracticesRequest { userId?: string; puesto: string; cv_url: string; cv_embeddings?: CVEmbeddingUnion }

export interface Practica {
  company: string;
  title: string;
  descripcion: string;
  location: string;
  salary: string;
  url: string;
  logo?:string;
  fecha_agregado: string;
  similitud_requisitos: number;
  similitud_puesto: number;
  afinidad_sector: number;
  similitud_semantica: number;
  juicio_sistema: number;
  similitud_total: number;
  justificacion_requisitos: string;
  justificacion_puesto: string;
  justificacion_afinidad: string;
  justificacion_semantica: string;
  justificacion_juicio: string;
  schedule?: string; // Agregado para compatibilidad con el filtro de jornada
}

export interface MatchPracticesResponse {
  practicas: Practica[];
  metadata?: {
    total_practicas_procesadas?: number;
    streaming_used?: boolean;
    fallback_reason?: string;
    compression_used?: boolean;
  };
}

export async function matchPractices(
  request: { userId: string; puesto: string; cv_url: string; cv_embeddings?: CVEmbeddingUnion }, 
  onProgress?: (practices: Practica[], isComplete: boolean) => void
): Promise<MatchPracticesResponse> {
  const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://127.0.0.1:8000/match-practices' 
    : 'https://jobsmatch.onrender.com/match-practices';

  //console.log(`🌐 Enviando solicitud a: ${API_URL}`);


  // Validación previa
  if (!request.cv_url || request.cv_url.trim() === '') {
    throw new Error('cv_url es requerido y no puede estar vacío');
  }

  if (!request.puesto || request.puesto.trim() === '') {
    throw new Error('puesto es requerido y no puede estar vacío');
  }

  // Normalizar los embeddings si existen
  const normalizedEmbeddings = request.cv_embeddings 
    ? normalizeEmbeddings(request.cv_embeddings)
    : undefined;

  // Preparar la solicitud con validación de embedding
  let requestBody: MatchPracticesRequest = {
    puesto: request.puesto,
    cv_url: request.cv_url,
    cv_embeddings: normalizedEmbeddings
  };

  //Si no tiene un embeddings valido o simplemente no se paso, usaremos la funcion uploadCVEmbeddings para obtener los nuevos embeddings
  if (!request.cv_embeddings || !isValidMultiAspectEmbedding(request.cv_embeddings)) {
    console.log('🚀 No se proporcionaron embeddings válidos, generando nuevos...');
    const embeddings = await uploadCVEmbeddings(request.userId, request.cv_url, request.puesto);
  
    if (embeddings) {
      requestBody.cv_embeddings = embeddings;
      console.log('✅ Embeddings obtenidos y añadidos a la solicitud');
    } else {
      console.warn('⚠️ No se pudieron generar embeddings - la solicitud continuará sin ellos');
    }
  
  } else {
    console.log('✅ Se proporcionaron embeddings válidos para la solicitud');
    requestBody.cv_embeddings = request.cv_embeddings;
  }

  // Comprimir el JSON usando gzip para reducir el tamaño sin pérdida de calidad
  const jsonString = JSON.stringify(requestBody);
  const originalSize = jsonString.length;
  
  let compressedBody: string | Uint8Array;
  let headers: Record<string, string>;
  
  try {
    // Intentar comprimir usando CompressionStream (disponible en navegadores modernos)
    if (typeof CompressionStream !== 'undefined') {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(jsonString));
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      compressedBody = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressedBody.set(chunk, offset);
        offset += chunk.length;
      }
      
      headers = {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Accept-Encoding': 'gzip, deflate, br'
      };
      /*
      console.log('📤 POST body enviado a match-practices (COMPRIMIDO):', {
        url: API_URL,
        originalSize: originalSize,
        compressedSize: compressedBody.length,
        compressionRatio: `${Math.round((1 - compressedBody.length/originalSize) * 100)}% reducción`,
        cvEmbeddingPresent: !!request.cv_embeddings,
        cvEmbeddingValid: request.cv_embeddings ? isValidMultiAspectEmbedding(request.cv_embeddings) : false
      });
      */
    } else {
      // Fallback: sin compresión si CompressionStream no está disponible
      compressedBody = jsonString;
      headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      };
      
      console.log('📤 POST body enviado a match-practices (SIN COMPRESIÓN):', {
        url: API_URL,
        bodySize: originalSize,
        cvEmbeddingPresent: !!request.cv_embeddings,
        cvEmbeddingValid: request.cv_embeddings ? isValidMultiAspectEmbedding(request.cv_embeddings) : false,
        note: 'CompressionStream no disponible en este navegador'
      });
    }
  } catch (compressionError) {
    // Fallback en caso de error de compresión
    console.warn('Error al comprimir, usando JSON sin comprimir:', compressionError);
    compressedBody = jsonString;
    headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br'
    };
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: compressedBody,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Error en la solicitud:', {
      status: response.status,
      error: error,
      url: response.url
    });
    throw new Error(`Error en la solicitud: ${response.status} - ${error}`);
  }

  // Si no se espera streaming, devolver la respuesta completa
  if (!onProgress) {
    const data = await response.json();
    return { 
      practicas: data.practicas || [],
      metadata: data.metadata
    };
  }

  // Intentar streaming primero, con fallback robusto
  try {
    // Verificar si el navegador soporta streaming
    if (response.body && typeof ReadableStream !== 'undefined') {
      console.log('🌊 Iniciando streaming de prácticas...');
      
      // Backend envía streaming puro sin compresión para máxima velocidad
      const streamToRead = response.body;
      
      const reader = streamToRead.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let practices: any[] = [];
      let metadata: any = {};
      let isStreamingComplete = false;
      
      // 🚀 FUNCIÓN PARA PROCESAR NDJSON (Newline Delimited JSON)
      const processNDJSONChunk = (chunk: string) => {

        buffer += chunk;
        
        // Procesar líneas completas (separadas por \n)
        const lines = buffer.split('\n');
        
        // Guardar la última línea (posiblemente incompleta) en el buffer
        buffer = lines.pop() || '';
        
        let linesProcessed = 0;
        
        // Procesar cada línea completa
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Saltar líneas vacías
          if (!trimmedLine) {
            continue;
          }
          
          try {
            const obj = JSON.parse(trimmedLine);
            /*
            console.log('✅ Línea NDJSON parseada:', {
              hasCompany: !!obj.company,
              hasTitle: !!obj.title,
              hasMetadata: !!obj.metadata,
              keys: Object.keys(obj).slice(0, 10)
            });
            */
            
            // Verificar si es metadata (final del stream)
            if (obj.metadata) {
              metadata = obj.metadata;
              //console.log('📊 Metadata final recibida:', metadata);
              isStreamingComplete = true;
            }
            // Verificar si es una práctica individual
            else if (obj.company && obj.title) {
              practices.push(obj);
              linesProcessed++;
              //console.log(`🎉 Práctica añadida! Total: ${practices.length}`);
              
              // 🔥 CALLBACK DE PROGRESO: Notificar inmediatamente por cada práctica
              if (onProgress) {
                onProgress([...practices], isStreamingComplete);
              }
            }
            // Verificar si es un error
            else if (obj.error) {
              console.error('❌ Error recibido del backend:', obj.error);
              throw new Error(obj.error.message || 'Error del servidor');
            }
            else {
              console.log('❓ Línea NDJSON no reconocida:', {
                keys: Object.keys(obj).slice(0, 10),
                content: trimmedLine.substring(0, 100)
              });
            }
          } catch (parseError) {
            console.error('❌ Error parsing línea NDJSON:', {
              error: parseError,
              line: trimmedLine.substring(0, 200)
            });
          }
        }
        
      };
      
      // Leer el stream (ya descomprimido si era necesario)
      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          isStreamingComplete = true;
          console.log('🏁 Stream terminado. Estado final:', {
            totalChunks: chunkCount,
            bufferRemaining: buffer.length,
            practicesFound: practices.length,
            metadataFound: Object.keys(metadata).length > 0
          });
          break;
        }
        
        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        
        // LOG CRUDO: Mostrar exactamente qué llega del backend
        /*
        console.log(`📦 Chunk ${chunkCount} recibido:`, {
          size: value.length,
          rawBytes: Array.from(value.slice(0, 50)).map(b => String.fromCharCode(b)).join(''),
          decodedPreview: chunk.substring(0, 200),
          decodedLength: chunk.length
        });
        */
        
        processNDJSONChunk(chunk);

        // Log progreso cada 10 prácticas
        if (practices.length > 0 && practices.length % 10 === 0) {
          //console.log(`🌊 Streaming: ${practices.length} prácticas recibidas...`);
        }
      }
      
      // Procesar cualquier dato restante en el buffer
      if (buffer.trim()) {
        processNDJSONChunk('');
      }
      
      
      // 🏁 CALLBACK FINAL: Notificar que el streaming terminó
      if (onProgress) {
        //console.log('🏁 Notificando finalización al UI');
        onProgress([...practices], true); // true = completado
      }
      
      return {
        practicas: practices,
        metadata: {
          ...metadata,
          streaming_used: true,
          total_practicas_procesadas: practices.length
        }
      };
      
    } else {
      throw new Error('ReadableStream no soportado');
    }
    
  } catch (streamingError) {
    console.warn('⚠️ Streaming falló, usando fallback a JSON completo:', streamingError);
    
    try {
      // Fallback simple: leer respuesta completa sin compresión
      const result = await response.json();
      console.log('📬 Respuesta completa recibida (fallback):', {
        practicesCount: result.practicas?.length || 0
      });
      
      return {
        practicas: result.practicas || [],
        metadata: {
          ...(result.metadata || {}),
          streaming_used: false,
          fallback_reason: 'streaming_failed'
        }
      };
    } catch (fallbackError) {
      console.error('❌ Error en fallback:', fallbackError);
      throw new Error('Error al procesar respuesta: ' + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)));
    }
  }
}