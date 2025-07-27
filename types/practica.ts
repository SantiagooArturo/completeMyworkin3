// Tipos para las prácticas del portal de trabajo

export interface Practica {
  company: string;
  fecha_agregado: string;
  salary: string;
  url: string;
  title: string;
  descripcion: string;
  location: string;
  
  logo?:string;
  // Datos de similitud/match (nueva estructura)
  requisitos_tecnicos: number;
  similitud_puesto: number;
  afinidad_sector: number;
  similitud_semantica: number;
  juicio_sistema: number;
  similitud_total: number;
  
  // Justificaciones de IA (nueva estructura)
  justificacion_requisitos: string;
  justificacion_puesto: string;
  justificacion_afinidad: string;
  justificacion_semantica: string;
  justificacion_juicio: string;
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