export interface MatchPracticesRequest {
  puesto: string;
  cv_url: string;
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
}

export async function matchPractices(data: MatchPracticesRequest): Promise<MatchPracticesResponse> {
  // Logging para debug
  console.log('🔍 Datos enviados a matchPractices:', {
    puesto: data.puesto,
    cv_url: data.cv_url,
    cv_url_type: typeof data.cv_url,
    cv_url_length: data.cv_url?.length || 0
  });

  // Validación previa
  if (!data.cv_url || data.cv_url.trim() === '') {
    throw new Error('cv_url es requerido y no puede estar vacío');
  }

  if (!data.puesto || data.puesto.trim() === '') {
    throw new Error('puesto es requerido y no puede estar vacío');
  }

  const response = await fetch('https://jobsmatch.onrender.com/match-practices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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

  return response.json();
}