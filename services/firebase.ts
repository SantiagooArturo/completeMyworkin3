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
import { worksDb } from '@/firebase/works-config';

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
  posted_date?: string;
  category: string;
  source: string;
  link: string;
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

// Función para clasificar una práctica basada en su título y requisitos
function classifyPractice(practice: Practice): string {
  const title = (practice.title || '').toLowerCase();
  const requirements = (practice.requirements || '').toLowerCase();
  const textToAnalyze = title + ' ' + requirements;
  
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

// Obtener la extracción más reciente
export async function getLatestExtraction(): Promise<ExtractedData | null> {
  try {
    const extractionsRef = collection(worksDb, 'extractions');
    const q = query(extractionsRef, orderBy('extraction_date', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      extraction_date: doc.data().extraction_date,
      total_practices: doc.data().total_practices,
      source: doc.data().source,
      max_pages: doc.data().max_pages,
      use_selenium: doc.data().use_selenium
    };
  } catch (error) {
    console.error('Error getting latest extraction:', error);
    return null;
  }
}

// Obtener todas las prácticas de una extracción y clasificarlas
export async function getPractices(extractionId: string): Promise<{ [category: string]: Practice[] }> {
  console.log('Obteniendo prácticas para extracción:', extractionId);
  try {
    const practicesRef = collection(worksDb, `extractions/${extractionId}/practices`);
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
      const practice = {
        id: doc.id,
        ...doc.data(),
        posted_date: doc.data().extraction_date || new Date().toISOString().split('T')[0] // Usar la fecha de extracción como fecha de publicación
      } as Practice;
      
      // Asignar categoría
      const category = classifyPractice(practice);
      practice.category = category;
      
      // Agregar a la categoría correspondiente
      if (practicesByCategory[category]) {
        practicesByCategory[category].push(practice);
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

  console.log('Buscando extracciones entre:', {
    startOfDay,
    endOfDay
  });

  try {
    const q = query(
      collection(worksDb, 'extractions'),
      where('extraction_date', '>=', startOfDay),
      where('extraction_date', '<=', endOfDay),
      orderBy('extraction_date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const extractions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        extraction_date: data.extraction_date,
        total_practices: data.total_practices || 0,
        source: data.source || '',
        max_pages: data.max_pages || 0,
        use_selenium: data.use_selenium || false
      };
    });

    console.log('Extracciones encontradas:', extractions.length);
    console.log('Datos de las extracciones:', JSON.stringify(extractions, null, 2));

    return extractions;
  } catch (error) {
    console.error('Error al obtener extracciones:', error);
    return [];
  }
}
export async function getRecentPracticesByCategory(): Promise<{ 
  extractionDate: string | null, 
  practices: { [category: string]: Practice[] } 
}> {
  const today = new Date();
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 5);

  // Formato "YYYY-MM-DD"
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const fiveDaysAgoStr = `${formatDate(fiveDaysAgo)} 00:00:00`;
  const todayStr = `${formatDate(today)} 23:59:59`;

  // 1. Extracciones manuales (use_selenium: false) últimos 5 días
  const manualQuery = query(
    collection(worksDb, 'extractions'),
    where('use_selenium', '==', false),
    where('extraction_date', '>=', fiveDaysAgoStr),
    where('extraction_date', '<=', todayStr),
    orderBy('extraction_date', 'desc')
  );
  const manualSnapshot = await getDocs(manualQuery);

  // 2. Extracciones automáticas (use_selenium: true) más recientes (por ejemplo, solo 1)
  const autoQuery = query(
    collection(worksDb, 'extractions'),
    where('use_selenium', '==', true),
    orderBy('extraction_date', 'desc'),
    limit(1)
  );
  const autoSnapshot = await getDocs(autoQuery);

  // Combinar extracciones
  const allExtractions: ExtractedData[] = [
    ...manualSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExtractedData)),
    ...autoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExtractedData)),
  ];

  // Obtener y combinar prácticas por categoría
  let practicesByCategory: { [category: string]: Practice[] } = {};
  let extractionDate: string | null = null;

  for (const extraction of allExtractions) {
    const practices = await getPractices(extraction.id);
    Object.entries(practices).forEach(([category, categoryPractices]) => {
      if (!practicesByCategory[category]) {
        practicesByCategory[category] = [];
      }
      practicesByCategory[category].push(...categoryPractices);
    });
    // Guardar la fecha más reciente para mostrar
    if (!extractionDate || extraction.extraction_date > extractionDate) {
      extractionDate = extraction.extraction_date;
    }
  }

  return {
    extractionDate,
    practices: practicesByCategory
  };
}
// Función para obtener los datos del día actual ya clasificados
export async function getTodayPracticesByCategory(): Promise<{ 
  extractionDate: string | null, 
  practices: { [category: string]: Practice[] } 
}> {
  const extractions = await getTodayExtractions();
  console.log('Total de extracciones encontradas:', extractions.length);

  let practicesByCategory: { [category: string]: Practice[] } = {};
  let extractionDate: string | null = null;

  if (extractions.length === 0) {
    console.log('No se encontraron extracciones recientes');
    // Si no hay extracciones recientes, obtener la última extracción disponible
    const lastExtractionQuery = query(
      collection(worksDb, 'extractions'),
      orderBy('extraction_date', 'desc'),
      limit(1)
    );
    
    const lastExtractionSnapshot = await getDocs(lastExtractionQuery);
    if (!lastExtractionSnapshot.empty) {
      const lastExtraction = lastExtractionSnapshot.docs[0];
      const lastExtractionData = lastExtraction.data();
      console.log('Usando última extracción disponible:', lastExtractionData.extraction_date);
      
      const practices = await getPractices(lastExtraction.id);
      practicesByCategory = practices;
      extractionDate = lastExtractionData.extraction_date;
    }
  } else {
    // Si hay extracciones recientes, combinar todas las prácticas
    console.log('Procesando extracciones encontradas:', extractions.length);
    for (const extraction of extractions) {
      console.log('Procesando extracción:', extraction.id, 'de fuente:', extraction.source);
      const practices = await getPractices(extraction.id);
      
      // Combinar las prácticas con las existentes
      Object.entries(practices).forEach(([category, categoryPractices]) => {
        if (!practicesByCategory[category]) {
          practicesByCategory[category] = [];
        }
        practicesByCategory[category].push(...categoryPractices);
      });
    }
    extractionDate = extractions[0].extraction_date;
  }

  // Imprimir resumen de prácticas por categoría
  Object.entries(practicesByCategory).forEach(([category, practices]) => {
    console.log(`Categoría ${category}: ${practices.length} prácticas`);
  });

  return {
    extractionDate,
    practices: practicesByCategory
  };
} 