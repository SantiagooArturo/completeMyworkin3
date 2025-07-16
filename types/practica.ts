// Tipos para las prácticas del portal de trabajo

export interface Practica {
  company: string;
  fecha_agregado: string;
  salary: string;
  url: string;
  title: string;
  descripcion: string;
  location: string;
  
  // Datos de similitud/match
  similitud_requisitos: number;
  similitud_titulo: number;
  similitud_experiencia: number;
  similitud_macro: number;
  
  // Justificaciones de IA
  justificacion_requisitos: string;
  justificacion_titulo: string;
  justificacion_experiencia: string;
  justificacion_macro: string;
}

// Respuesta del API de match
export interface MatchPracticesResponse {
  practices: Practica[];
  total_practices: number;
  source: string;
}

// Estructura para los gráficos de similitud
export interface SimilitudData {
  label: string;
  value: number;
  color: string;
  justificacion: string;
}

// Props para componentes de detalle
export interface PracticaDetailProps {
  practica: Practica;
}

export interface MatchChartsProps {
  similitudes: SimilitudData[];
}

export interface PracticaToolsProps {
  practica: Practica;
} 