export interface SalarioContribution {
  empresa: string;
  modalidadTrabajo: string;
  lugar: string;
  subvencionEconomica: string;
  industria: string;
  tamanoEmpresa: string;
  salarioContratado: string;
  createdAt: any;
  userId?: string;
}

export interface SalarioContributionFormData {
  empresa: string;
  modalidadTrabajo: string;
  lugar: string;
  subvencionEconomica: string;
  industria: string;
  tamanoEmpresa: string;
  salarioContratado: string;
}

// Opciones para los selects del formulario
export const MODALIDAD_TRABAJO_OPTIONS = [
  'Híbrido',
  'Presencial',
  'Remoto'
];

export const INDUSTRIA_OPTIONS = [
  'Energía / Hidrocarburos',
  'Consumo Masivo / Bebidas',
  'Seguros / Servicios Financieros',
  'Tecnología / Software',
  'Banca',
  'Retail / Supermercados',
  'Construcción / Ingeniería',
  'Alimentación / Consumo',
  'Energía eléctrica',
  'Cosméticos / Venta Directa',
  'Telecomunicaciones',
  'Minería',
  'Otros'
];

export const TAMANO_EMPRESA_OPTIONS = [
  '+1000 empleados',
  '+5000 empleados',
  '+500 empleados',
  '+100 empleados',
  '11-50 empleados',
  '51-100 empleados',
  '1-10 empleados'
]; 