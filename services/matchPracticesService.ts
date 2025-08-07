export interface MatchPracticesRequest {
  puesto: string;
  cv_url: string;
  //agregar cvFileEmbedding que son vectores floaat
  cv_embedding?: number[];
}

export interface Practica {
  company: string;
  title: string;
  descripcion: string;
  location: string;
  salary: string;
  url: string;
  logo?:string;
  fecha_agregado: string;
  requisitos_tecnicos: number;
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
  request: MatchPracticesRequest, 
  onProgress?: (practices: any[], isComplete: boolean) => void
): Promise<MatchPracticesResponse> {
  // Logging para debug
  //enviar cvFileEmbedding si existe
  console.log('🔍 Datos enviados a matchPractices:', {
    puesto: request.puesto,
    cv_embedding: request.cv_embedding,
    cv_url: request.cv_url,
    cv_url_type: typeof request.cv_url,
    cv_url_length: request.cv_url?.length || 0
  });
  const url_localhost = "http://127.0.0.1:8000/match-practices"
  const url_produccion = "https://jobsmatch.onrender.com/match-practices"
  //comunicando la url:
  console.log("Se enviarán los datos a la siguiente url: ", url_localhost);


  // Validación previa
  if (!request.cv_url || request.cv_url.trim() === '') {
    throw new Error('cv_url es requerido y no puede estar vacío');
  }

  if (!request.puesto || request.puesto.trim() === '') {
    throw new Error('puesto es requerido y no puede estar vacío');
  }

  // Comprimir el JSON usando gzip para reducir el tamaño sin pérdida de calidad
  const jsonString = JSON.stringify(request);
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
      
      console.log('📤 POST body enviado a match-practices (COMPRIMIDO):', {
        url: url_localhost,
        originalSize: originalSize,
        compressedSize: compressedBody.length,
        compressionRatio: `${Math.round((1 - compressedBody.length/originalSize) * 100)}% reducción`,
        cvFileEmbeddingExists: !!request.cv_embedding,
        cvFileEmbeddingLength: request.cv_embedding?.length
      });
    } else {
      // Fallback: sin compresión si CompressionStream no está disponible
      compressedBody = jsonString;
      headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      };
      
      console.log('📤 POST body enviado a match-practices (SIN COMPRESIÓN):', {
        url: url_localhost,
        bodySize: originalSize,
        cvFileEmbeddingExists: !!request.cv_embedding,
        cvFileEmbeddingLength: request.cv_embedding?.length,
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

  const response = await fetch(url_localhost, {
    method: 'POST',
    headers,
    body: compressedBody,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error response from match-practices:', {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText
    });
    throw new Error(`Error al hacer match de prácticas: ${response.status} ${response.statusText}`);
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
        console.log('🔍 Procesando chunk NDJSON:', {
          chunkLength: chunk.length,
          chunkPreview: chunk.substring(0, 100)
        });
        
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
            console.log('✅ Línea NDJSON parseada:', {
              hasCompany: !!obj.company,
              hasTitle: !!obj.title,
              hasMetadata: !!obj.metadata,
              keys: Object.keys(obj).slice(0, 10)
            });
            
            // Verificar si es metadata (final del stream)
            if (obj.metadata) {
              metadata = obj.metadata;
              console.log('📊 Metadata final recibida:', metadata);
              isStreamingComplete = true;
            }
            // Verificar si es una práctica individual
            else if (obj.company && obj.title) {
              practices.push(obj);
              linesProcessed++;
              console.log(`🎉 Práctica añadida! Total: ${practices.length}`);
              
              // 🔥 CALLBACK DE PROGRESO: Notificar inmediatamente por cada práctica
              if (onProgress) {
                console.log('📡 Notificando progreso al UI:', practices.length);
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
        
        console.log(`🏁 Chunk NDJSON procesado: ${linesProcessed} líneas procesadas`);
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
        console.log(`📦 Chunk ${chunkCount} recibido:`, {
          size: value.length,
          rawBytes: Array.from(value.slice(0, 50)).map(b => String.fromCharCode(b)).join(''),
          decodedPreview: chunk.substring(0, 200),
          decodedLength: chunk.length
        });
        
        processNDJSONChunk(chunk);
        
        // Log progreso cada chunk para debug
        console.log(`🔄 Después del chunk ${chunkCount}:`, {
          practicesCount: practices.length,
          bufferSize: buffer.length,
          bufferPreview: buffer.substring(0, 100)
        });
        
        // Log progreso cada 10 prácticas
        if (practices.length > 0 && practices.length % 10 === 0) {
          console.log(`🌊 Streaming: ${practices.length} prácticas recibidas...`);
        }
      }
      
      // Procesar cualquier dato restante en el buffer
      if (buffer.trim()) {
        processNDJSONChunk('');
      }
      
      console.log(`✅ Streaming completado: ${practices.length} prácticas recibidas`);
      
      // 🏁 CALLBACK FINAL: Notificar que el streaming terminó
      if (onProgress) {
        console.log('🏁 Notificando finalización al UI');
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
        ...result,
        metadata: {
          ...result.metadata,
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