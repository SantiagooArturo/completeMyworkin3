import { db2 } from "@/firebase/config-jobs";
import { collection, getDocs } from "firebase/firestore";

// Reutiliza o importa tu función classifyPractice y el objeto categories si lo tienes en otro archivo
// Si no, copia aquí la función y el objeto categories

export interface PracticeDB2 {
    id?: string;
    company: string;
    title: string;
    descripcion: string;
    location: string;
    fecha_agregado: string;
    url: string;
    salary: string;
}

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

function classifyPractice(practice: PracticeDB2): string {
  const title = (practice.title || '').toLowerCase();
  const descripcion = (practice.descripcion || '').toLowerCase();
  const textToAnalyze = title + ' ' + descripcion;
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
      if (regex.test(textToAnalyze)) {
        return category;
      }
    }
  }
  return 'Otros';
}

// export async function getAllPractices(): Promise<Practice[]> {
//   try {
//     const practicas = collection(db2, 'practicas');
//     const querySnapshot = await getDocs(practicas);
//     return querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as Practice[];
//   } catch (error) {
//     console.error('Error al obtener prácticas:', error);
//     return [];
//   }
// }

// export async function getRecentPracticesByCategoryJobsUpdate(): Promise<{
//   extractionDate: string | null,
//   practices: { [category: string]: Practice[] }
// }> {
//   try {
//     const practicesRef = collection(db2, 'practicas');
//     const querySnapshot = await getDocs(practicesRef);

//     let practicesByCategory: { [category: string]: Practice[] } = {};
//     let extractionDate: string | null = null;
//     const today = new Date();
//     const fiveDaysAgo = new Date(today);
//     fiveDaysAgo.setDate(today.getDate() - 5);

//     querySnapshot.forEach(docSnap => {
//       const practice = { id: docSnap.id, ...docSnap.data() } as Practice;
//       // Parsear fecha_agregado (ejemplo: "14 de julio de 2025, 11:24:08 a.m. UTC-5")
//       let fecha = null;
//       if (practice.fecha_agregado) {
//         // Intenta parsear el string a Date (esto depende del formato exacto)
//         // Aquí se asume formato español, puedes ajustar si es necesario
//         const partes = practice.fecha_agregado.split(',');
//         if (partes.length > 0) {
//           // "14 de julio de 2025" => "2025-07-14"
//           const fechaTexto = partes[0].trim();
//           const meses = {
//             'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
//             'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
//           };
//           const match = fechaTexto.match(/(\d{1,2}) de (\w+) de (\d{4})/);
//           if (match) {
//             const dia = parseInt(match[1], 10);
//             const mesNombre = match[2].toLowerCase();
//             const anio = parseInt(match[3], 10);
//             const mes = meses[mesNombre as keyof typeof meses] ?? 0; // <-- Solución aquí
//             fecha = new Date(anio, mes, dia);
//           }
//         }
//       }
//       // Filtrar por los últimos 5 días
//       if (fecha && fecha >= fiveDaysAgo && fecha <= today) {
//         const category = classifyPractice(practice);
//         practice.category = category;
//         if (!practicesByCategory[category]) practicesByCategory[category] = [];
//         practicesByCategory[category].push(practice);

//         // Guardar la fecha más reciente encontrada
//         if (
//           practice.fecha_agregado &&
//           (!extractionDate || practice.fecha_agregado > extractionDate)
//         ) {
//           extractionDate = practice.fecha_agregado;
//         }
//       }
//     });

//     return {
//       extractionDate,
//       practices: practicesByCategory
//     };
//   } catch (error) {
//     console.error('Error al obtener prácticas recientes:', error);
//     return { extractionDate: null, practices: {} };
//   }
// }