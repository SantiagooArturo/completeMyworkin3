import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  doc,
  getDoc,
  where
} from 'firebase/firestore';
// import { worksDb } from '@/firebase/works-config';
import { db2 } from '@/firebase/config-jobs';

// Tipos de datos para las prácticas y categorías
export interface Practice {
  id: string;
  title: string;
  company: string;
  url: string;
  location?: string;
  salary?: string;
  requirements?: string;
  end_date?: string;
  posted_date?: string | Date; // Puede ser un string o un objeto Date
  category: string;
  source: string;
  link: string;
}

export interface PracticeDB2 {
  id?: string;
  company: string;
  title: string;
  descripcion: string;
  location: string;
  fecha_agregado: string | Date; // Puede ser un string o un objeto Date
  url: string;
  salary: string;
}

export interface ExtractedData {
  id: string;
  extraction_date: string;
  total_practices: number;
  source: string;
  max_pages: number;
  use_selenium: boolean;
}

// Palabras clave para cada categoría
const categories = {
  'Ingeniería Industrial y Mecánica': [
    'maquinaria', 'mecánica', 'industrial', 'mantenimiento', 'máquinas', 'equipos',
    'producción industrial', 'planta', 'manufactura', 'automatización', 'mecatrónica',
    'maquinaria pesada', 'operador', 'técnico mecánico', 'electromecánico'
  ],
  'Ingeniería Civil y Arquitectura': [
    'civil', 'arquitectura', 'construcción', 'edificación', 'obra', 'topografía',
    'estructural', 'MEP', 'residente', 'infraestructura', 'diseño estructural',
    'supervisor de obra', 'proyectos civiles', 'inmobiliaria', 'edificaciones'
  ],
  'Tecnología e innovación': [
    'tecnología', 'software', 'programación', 'desarrollador', 'developer', 'IT',
    'sistemas', 'informática', 'tech', 'data', 'datos', 'computación', 'web',
    'frontend', 'backend', 'fullstack', 'ux', 'ui', 'innovación', 'aplicaciones',
    'base de datos', 'redes', 'cloud', 'devops', 'ciberseguridad', 'soporte técnico'
  ],
  'Administración, economía y finanzas': [
    'administración', 'finanzas', 'contabilidad', 'economía', 'administrative',
    'finance', 'accounting', 'financiero', 'tesorería', 'treasury', 'presupuesto',
    'facturación', 'cuentas', 'auditoría', 'auditor', 'tributación', 'costos',
    'gestión administrativa', 'asistente administrativo', 'back office'
  ],
  'Comercial y ventas': [
    'ventas', 'comercial', 'sales', 'business', 'vendedor', 'negocio', 'retail',
    'cliente', 'account', 'comercio', 'atención al cliente', 'servicio al cliente',
    'asesor comercial', 'ejecutivo de ventas', 'telemarketing', 'call center'
  ],
  'Operaciones, cadena y proyectos': [
    'operaciones', 'cadena', 'logística', 'suministro', 'supply', 'chain',
    'proyecto', 'operations', 'logistics', 'planificación', 'calidad',
    'almacén', 'inventario', 'distribución', 'compras', 'abastecimiento',
    'gestión de proyectos', 'PMO', 'control de calidad'
  ],
  'Marketing y comunicaciones': [
    'marketing', 'comunicación', 'publicidad', 'community', 'redes sociales',
    'social media', 'branding', 'digital', 'contenido', 'content', 'comunicaciones',
    'diseño', 'gráfico', 'audiovisual', 'medios', 'relaciones públicas', 'PR'
  ],
  'Capital humano': [
    'recursos humanos', 'rrhh', 'hr', 'human resources', 'talento', 'gestión',
    'personal', 'selección', 'reclutamiento', 'recruitment', 'talent',
    'capacitación', 'desarrollo organizacional', 'bienestar', 'compensaciones'
  ],
  'Legal y derecho': [
    'legal', 'derecho', 'abogado', 'leyes', 'law', 'lawyer', 'jurídico',
    'normativa', 'compliance', 'regulatorio', 'contratos', 'legislación',
    'asesoría legal', 'notarial', 'procesos legales'
  ]
};

// Función para convertir PracticeDB2 a Practice
function convertPracticeDB2ToPractice(practiceDB2: PracticeDB2): Practice {
  return {
    id: practiceDB2.id || '',
    title: practiceDB2.title,
    company: practiceDB2.company,
    url: practiceDB2.url,
    location: practiceDB2.location,
    salary: practiceDB2.salary,
    requirements: practiceDB2.descripcion, // Mapear descripción a requirements
    end_date: undefined,
    posted_date: practiceDB2.fecha_agregado,
    category: classifyPractice(practiceDB2),
    source: 'jobs-update',
    link: practiceDB2.url
  };
}

// Función para clasificar una práctica basada en su título y descripción
function classifyPractice(practice: PracticeDB2): string {
  const title = (practice.title || '').toLowerCase();
  const descripcion = (practice.descripcion || '').toLowerCase();
  const textToAnalyze = title + ' ' + descripcion;
  
  // Primero intentamos encontrar una categoría basada en palabras clave
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      // Usamos una coincidencia de palabra completa para evitar falsos positivos
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
      if (regex.test(textToAnalyze)) {
        return category;
      }
    }
  }
  
  // Si no se encuentra ninguna categoría, retornamos "Otros"
  return 'Otros';
}

// Obtener todas las prácticas de la colección practicas y clasificarlas
export async function getPracticesFromDB2(): Promise<{ [category: string]: Practice[] }> {
  console.log('Obteniendo prácticas de la base de datos jobs-update...');
  try {
    const practicesRef = collection(db2, 'practicas');
    const querySnapshot = await getDocs(practicesRef);
    
    // Inicializar objeto para almacenar prácticas por categoría
    const practicesByCategory: { [category: string]: Practice[] } = {};
    
    // Inicializar cada categoría con un array vacío
    for (const category of Object.keys(categories)) {
      practicesByCategory[category] = [];
    }
    practicesByCategory['Otros'] = []; // Para prácticas sin categoría clara
    
    // Procesar cada práctica
    querySnapshot.forEach((doc) => {
      const practiceDB2 = {
        id: doc.id,
        ...doc.data()
      } as PracticeDB2;
      
      // Convertir a formato Practice
      const practice = convertPracticeDB2ToPractice(practiceDB2);
      
      // Agregar a la categoría correspondiente
      if (practicesByCategory[practice.category]) {
        practicesByCategory[practice.category].push(practice);
      } else {
        practicesByCategory['Otros'].push(practice);
      }
    });
    
    // Eliminar categorías vacías
    for (const category of Object.keys(practicesByCategory)) {
      if (practicesByCategory[category].length === 0) {
        delete practicesByCategory[category];
      }
    }
    
    console.log('Prácticas encontradas:', Object.values(practicesByCategory).flat().length);
    return practicesByCategory;
  } catch (error) {
    console.error('Error al obtener prácticas:', error);
    return {};
  }
}

// Obtener la extracción más reciente
export async function getLatestExtraction(): Promise<ExtractedData | null> {
  try {
    // Ya no necesitamos extracciones específicas, retornamos datos simulados
    // basados en las prácticas actuales de la base de datos
    const today = new Date().toISOString().split('T')[0];
    return {
      id: 'jobs-update-latest',
      extraction_date: `${today} 12:00:00`,
      total_practices: 0, // Se calculará dinámicamente
      source: 'jobs-update',
      max_pages: 1,
      use_selenium: false
    };
  } catch (error) {
    console.error('Error getting latest extraction:', error);
    return null;
  }
}

// Obtener todas las prácticas de una extracción y clasificarlas
export async function getPractices(extractionId: string): Promise<{ [category: string]: Practice[] }> {
  console.log('Obteniendo prácticas para extracción:', extractionId);
  // Ahora simplemente redirigimos a la nueva función que obtiene de db2
  return await getPracticesFromDB2();
}

// Función para obtener los datos más recientes ya clasificados
export async function getLatestPracticesByCategory(): Promise<{ 
  extractionDate: string | null, 
  practices: { [category: string]: Practice[] } 
}> {
  const latestExtraction = await getLatestExtraction();
  
  if (!latestExtraction) {
    return { extractionDate: null, practices: {} };
  }
  
  const practices = await getPractices(latestExtraction.id);
  return { 
    extractionDate: latestExtraction.extraction_date, 
    practices 
  };
}

// Obtener todas las extracciones del día actual
export async function getTodayExtractions(): Promise<ExtractedData[]> {
  console.log('Iniciando obtención de prácticas del día...');
  
  // Obtener la fecha actual en el formato "YYYY-MM-DD"
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const startOfDay = `${year}-${month}-${day} 00:00:00`;
  const endOfDay = `${year}-${month}-${day} 23:59:59`;

  console.log('Simulando extracciones para el día:', {
    startOfDay,
    endOfDay
  });

  try {
    // Simulamos una extracción para el día actual
    const extraction: ExtractedData = {
      id: 'jobs-update-today',
      extraction_date: `${year}-${month}-${day} 12:00:00`,
      total_practices: 0, // Se calculará dinámicamente
      source: 'jobs-update',
      max_pages: 1,
      use_selenium: false
    };

    console.log('Extracciones simuladas:', 1);
    return [extraction];
  } catch (error) {
    console.error('Error al obtener extracciones:', error);
    return [];
  }
}
export async function getRecentPracticesByCategory(): Promise<{ 
  extractionDate: string | null, 
  practices: { [category: string]: Practice[] } 
}> {
  console.log('Obteniendo prácticas recientes de la base de datos jobs-update...');
  
  try {
    // Filtrar prácticas de los últimos 5 días
    const today = new Date();
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 5);

    const practicesRef = collection(db2, 'practicas');
    const querySnapshot = await getDocs(practicesRef);
    
    let practicesByCategory: { [category: string]: Practice[] } = {};
    let extractionDate: string | null = null;
    for (const category of Object.keys(categories)) {
      practicesByCategory[category] = [];
    }
    practicesByCategory['Otros'] = [];
    querySnapshot.forEach((doc) => {
      const practiceDB2 = {
        id: doc.id,
        ...doc.data()
      } as PracticeDB2;
      // Parsear fecha_agregado y filtrar por los últimos 5 días
      let fechaPractica = null;
      if (practiceDB2.fecha_agregado) {
        try {
          let fechaRaw = practiceDB2.fecha_agregado;
          if (typeof fechaRaw === 'object' && fechaRaw !== null) {
            if (typeof (fechaRaw as any).toDate === 'function') {
              fechaRaw = (fechaRaw as any).toDate();
            } else if ('seconds' in fechaRaw && typeof (fechaRaw as any).seconds === 'number') {
              fechaRaw = new Date((fechaRaw as any).seconds * 1000);
            }
          }
          if (fechaRaw instanceof Date) {
            fechaPractica = fechaRaw;
          } else if (typeof fechaRaw === 'string') {
            // Soporta formato: '14 de julio de 2025, 11:11:12 a.m. UTC-5'
            const match = fechaRaw.match(/(\d{1,2}) de (\w+) de (\d{4})/);
            if (match) {
              const dia = parseInt(match[1], 10);
              const mesNombre = match[2].toLowerCase();
              const anio = parseInt(match[3], 10);
              const meses: { [key: string]: number } = {
                'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
                'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
              };
              const mes = meses[mesNombre] ?? 0;
              fechaPractica = new Date(anio, mes, dia);
            } else {
              // Si no matchea, intentar parsear como Date estándar
              const parsed = new Date(fechaRaw);
              if (!isNaN(parsed.getTime())) {
                fechaPractica = parsed;
              }
            }
          }
        } catch (error) {
          console.warn('Error parsing date:', practiceDB2.fecha_agregado);
        }
      }
      if (!fechaPractica || (fechaPractica >= fiveDaysAgo && fechaPractica <= today)) {
        const practice = convertPracticeDB2ToPractice(practiceDB2);
        if (practice.posted_date && typeof practice.posted_date === 'object') {
          // Type guard para Firestore Timestamp
          if (
            typeof (practice.posted_date as any).toDate === 'function'
          ) {
            practice.posted_date = (practice.posted_date as any).toDate().toISOString();
          } else if (
            'seconds' in (practice.posted_date as any) &&
            typeof (practice.posted_date as any).seconds === 'number'
          ) {
            const date = new Date((practice.posted_date as any).seconds * 1000);
            practice.posted_date = date.toISOString();
          }
        }
        if (practicesByCategory[practice.category]) {
          practicesByCategory[practice.category].push(practice);
        } else {
          practicesByCategory['Otros'].push(practice);
        }
        if (!extractionDate || practiceDB2.fecha_agregado > extractionDate) {
          let fechaRaw = practiceDB2.fecha_agregado;
          if (fechaRaw instanceof Date) {
            extractionDate = fechaRaw.toISOString();
          } else {
            extractionDate = String(fechaRaw);
          }
        }
      }
    });

    // Eliminar categorías vacías
    Object.keys(practicesByCategory).forEach(category => {
      if (practicesByCategory[category].length === 0) {
        delete practicesByCategory[category];
      }
    });

    return {
      extractionDate: extractionDate || new Date().toISOString().split('T')[0],
      practices: practicesByCategory
    };
  } catch (error) {
    console.error('Error al obtener prácticas recientes:', error);
    return { extractionDate: null, practices: {} };
  }
}
// Función para obtener los datos del día actual ya clasificados
export async function getTodayPracticesByCategory(): Promise<{ 
  extractionDate: string | null, 
  practices: { [category: string]: Practice[] } 
}> {
  console.log('Obteniendo prácticas del día de la base de datos jobs-update...');

  try {
    // Obtener todas las prácticas y filtrar por fecha del día actual
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const practicesRef = collection(db2, 'practicas');
    const querySnapshot = await getDocs(practicesRef);
    
    let practicesByCategory: { [category: string]: Practice[] } = {};
    let extractionDate: string | null = null;

    // Inicializar categorías
    for (const category of Object.keys(categories)) {
      practicesByCategory[category] = [];
    }
    practicesByCategory['Otros'] = [];

    let totalPractices = 0;
    let todayPractices = 0;

    querySnapshot.forEach((doc) => {
      const practiceDB2 = {
        id: doc.id,
        ...doc.data()
      } as PracticeDB2;

      totalPractices++;

      // Parsear fecha_agregado para filtrar por día actual
      let fechaPractica = null;
      let isToday = false;

      if (practiceDB2.fecha_agregado) {
        try {
          let fechaRaw = practiceDB2.fecha_agregado;
          if (typeof fechaRaw === 'object' && fechaRaw !== null) {
            if (typeof (fechaRaw as any).toDate === 'function') {
              fechaRaw = (fechaRaw as any).toDate();
            } else if ('seconds' in fechaRaw && typeof (fechaRaw as any).seconds === 'number') {
              fechaRaw = new Date((fechaRaw as any).seconds * 1000);
            }
          }
          if (fechaRaw instanceof Date) {
            fechaPractica = fechaRaw;
            isToday = fechaPractica >= startOfDay && fechaPractica < endOfDay;
          } else if (typeof fechaRaw === 'string') {
            const match = fechaRaw.match(/(\d{1,2}) de (\w+) de (\d{4})/);
            if (match) {
              const dia = parseInt(match[1], 10);
              const mesNombre = match[2].toLowerCase();
              const anio = parseInt(match[3], 10);
              const meses: { [key: string]: number } = {
                'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
                'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
              };
              const mes = meses[mesNombre] ?? 0;
              fechaPractica = new Date(anio, mes, dia);
              isToday = fechaPractica >= startOfDay && fechaPractica < endOfDay;
            } else {
              // Si no matchea, intentar parsear como Date estándar
              const parsed = new Date(fechaRaw);
              if (!isNaN(parsed.getTime())) {
                fechaPractica = parsed;
                isToday = fechaPractica >= startOfDay && fechaPractica < endOfDay;
              }
            }
          }
        } catch (error) {
          console.warn('Error parsing date:', practiceDB2.fecha_agregado);
        }
      }

      // Si no podemos determinar la fecha, incluir todas las prácticas
      // Si es del día actual o no hay prácticas del día, incluir
      if (!fechaPractica || isToday || todayPractices === 0) {
        const practice = convertPracticeDB2ToPractice(practiceDB2);
        
        if (practicesByCategory[practice.category]) {
          practicesByCategory[practice.category].push(practice);
        } else {
          practicesByCategory['Otros'].push(practice);
        }

        if (isToday) todayPractices++;

        // Guardar la fecha más reciente
        if (!extractionDate || practiceDB2.fecha_agregado > extractionDate) {
          let fechaRaw = practiceDB2.fecha_agregado;
          if (fechaRaw instanceof Date) {
            extractionDate = fechaRaw.toISOString();
          } else {
            extractionDate = String(fechaRaw);
          }
        }
      }
    });

    console.log(`Total de prácticas: ${totalPractices}, Prácticas del día: ${todayPractices}`);

    // Si no hay prácticas del día actual, incluir todas las prácticas recientes
    if (todayPractices === 0) {
      console.log('No se encontraron prácticas del día actual, incluyendo todas las prácticas');
      return await getRecentPracticesByCategory();
    }

    // Eliminar categorías vacías
    Object.keys(practicesByCategory).forEach(category => {
      if (practicesByCategory[category].length === 0) {
        delete practicesByCategory[category];
      }
    });

    // Imprimir resumen de prácticas por categoría
    Object.entries(practicesByCategory).forEach(([category, practices]) => {
      console.log(`Categoría ${category}: ${practices.length} prácticas`);
    });

    return {
      extractionDate: extractionDate || new Date().toISOString().split('T')[0],
      practices: practicesByCategory
    };
  } catch (error) {
    console.error('Error al obtener prácticas del día:', error);
    // En caso de error, intentar obtener prácticas recientes
    return await getRecentPracticesByCategory();
  }
}