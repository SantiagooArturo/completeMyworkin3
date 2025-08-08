import { db } from '@/firebase/config';
import { matchPractices, MatchPracticesRequest, Practica } from './matchPracticesService';
import crypto from 'crypto'; 
import { 
  query, collection, where, orderBy, limit, getDocs, getDoc,serverTimestamp, 
  deleteDoc, doc, setDoc 
} from 'firebase/firestore';

export interface OnboardingMatchData {
  userId: string;
  practices: Practica[];
  source: 'api' | 'mock';
  matchQuery: {
    puesto: string;
    cv_url: string;
    cv_embedding?: number[];
  };
  timestamp: any;
  retryCount: number;
}

// Prácticas mock para fallback
const MOCK_PRACTICES: Practica[] = [
  {
    company: "TechStart Peru",
    title: "Practicante de Desarrollo Web",
    descripcion: "Únete a nuestro equipo para desarrollar aplicaciones web modernas usando React y Node.js.",
    location: "Lima, Perú",
    salary: "S/. 1,200 - S/. 1,500",
    url: "https://example.com/job1",
    fecha_agregado: "2025-01-10",
    schedule: "Tiempo completo",
    similitud_requisitos: 85,
    similitud_puesto: 92,
    afinidad_sector: 78,
    similitud_semantica: 88,
    juicio_sistema: 86,
    similitud_total: 86,
    justificacion_requisitos: "Tu perfil académico en desarrollo se alinea perfectamente con los requisitos técnicos.",
    justificacion_puesto: "El título coincide directamente con tu área de interés en desarrollo frontend.",
    justificacion_afinidad: "Aunque es tu primera experiencia, el perfil es ideal para practicantes.",
    justificacion_semantica: "La empresa busca perfiles junior con ganas de aprender, perfecto para ti.",
    justificacion_juicio: "Sistema evaluó positivamente tu compatibilidad con este puesto."
  },
  {
    company: "Innovación Digital SAC",
    title: "Practicante de Sistemas",
    descripcion: "Participa en proyectos de automatización y mejora de procesos empresariales.",
    location: "Lima, Perú",
    salary: "S/. 1,000 - S/. 1,300",
    url: "https://example.com/job2",
    fecha_agregado: "2025-01-09",
    schedule: "Tiempo completo",
    similitud_requisitos: 80,
    similitud_puesto: 88,
    afinidad_sector: 82,
    similitud_semantica: 85,
    juicio_sistema: 84,
    similitud_total: 84,
    justificacion_requisitos: "Tus conocimientos en sistemas informáticos encajan con los requerimientos.",
    justificacion_puesto: "El puesto de sistemas está alineado con tu formación académica.",
    justificacion_afinidad: "La automatización es una habilidad valorada en tu perfil.",
    justificacion_semantica: "Los procesos empresariales requieren pensamiento sistemático que posees.",
    justificacion_juicio: "Sistema considera muy buena tu compatibilidad con este rol."
  },
  {
    company: "StartUp Labs",
    title: "Practicante de Desarrollo Frontend",
    descripcion: "Colabora en el desarrollo de interfaces de usuario para aplicaciones web innovadoras.",
    location: "Lima, Perú",
    salary: "S/. 1,100 - S/. 1,400",
    url: "https://example.com/job3",
    fecha_agregado: "2025-01-08",
    schedule: "Tiempo parcial",
    similitud_requisitos: 87,
    similitud_puesto: 95,
    afinidad_sector: 75,
    similitud_semantica: 82,
    juicio_sistema: 85,
    similitud_total: 85,
    justificacion_requisitos: "Perfecto match con HTML, CSS, JavaScript que has estudiado.",
    justificacion_puesto: "Frontend es exactamente lo que has seleccionado como interés principal.",
    justificacion_afinidad: "Ambiente ideal para aprender y crecer profesionalmente.",
    justificacion_semantica: "Startup con cultura joven y mentoría constante para practicantes.",
    justificacion_juicio: "Sistema recomienda altamente esta oportunidad para tu perfil."
  },
  {
    company: "Soluciones Tech EIRL",
    title: "Practicante de Soporte Técnico",
    descripcion: "Brinda soporte técnico a clientes y participa en proyectos de infraestructura IT.",
    location: "Lima, Perú",
    salary: "S/. 950 - S/. 1,200",
    url: "https://example.com/job4",
    fecha_agregado: "2025-01-07",
    schedule: "Tiempo completo",
    similitud_requisitos: 75,
    similitud_puesto: 80,
    afinidad_sector: 88,
    similitud_semantica: 78,
    juicio_sistema: 80,
    similitud_total: 80,
    justificacion_requisitos: "Tus conocimientos técnicos son suficientes para el rol de soporte.",
    justificacion_puesto: "Soporte técnico complementa bien tu formación en sistemas.",
    justificacion_afinidad: "Excelente punto de entrada para ganar experiencia práctica.",
    justificacion_semantica: "Empresa establecida con buenos programas de entrenamiento.",
    justificacion_juicio: "Sistema considera esta una buena oportunidad para tu desarrollo."
  },
  {
    company: "Digital Growth Co.",
    title: "Practicante de Marketing Digital",
    descripcion: "Apoya en campañas digitales, análisis de métricas y gestión de redes sociales.",
    location: "Lima, Perú",
    salary: "S/. 1,000 - S/. 1,350",
    url: "https://example.com/job5",
    fecha_agregado: "2025-01-06",
    schedule: "Flexible",
    similitud_requisitos: 70,
    similitud_puesto: 75,
    afinidad_sector: 85,
    similitud_semantica: 80,
    juicio_sistema: 78,
    similitud_total: 78,
    justificacion_requisitos: "Tus habilidades analíticas se transfieren bien al marketing digital.",
    justificacion_puesto: "Aunque no es tu área principal, hay overlap con tecnología.",
    justificacion_afinidad: "Perfecto para estudiantes que buscan diversificar habilidades.",
    justificacion_semantica: "Sector en crecimiento con muchas oportunidades de aprendizaje.",
    justificacion_juicio: "Sistema considera interesante esta alternativa para tu crecimiento."
  }
];

  // Genera un hash consistente a partir de puesto+cv_url
function generateMatchId(puesto: string, cv_url: string) {
    return crypto.createHash('md5').update(puesto + '|' + cv_url).digest('hex');
}

function generateMatchKey(puesto: string, cv_url: string) {
  return puesto + '|' + cv_url; // o en minúsculas si quieres ignorar mayúsculas
}
  

export class OnboardingMatchService {
  static async executeMatchWithRetry(matchQuery: MatchPracticesRequest, userId: string): Promise<OnboardingMatchData> {
    // 1. PRIMERO: Verificar si ya existe un match reciente en Firestore
    //comentado unicamente para pruebas. al comentarse evita el cacheo de los matches previos
    const existingMatch = await this.getExistingMatch(userId, matchQuery);
    if (existingMatch) {
      console.log('✅ Usando prácticas guardadas (cache)');
      return existingMatch;
    }

    // 2. SI NO EXISTE: Hacer nueva petición al API
    let retryCount = 0;
    let practices: Practica[] = [];
    let source: 'api' | 'mock' = 'mock';

    // Primer intento
    try {
      console.log('Primer intento de matchPractices...');
      const response = await matchPractices(matchQuery);
      practices = response.practicas;
      source = 'api';
      console.log('✅ Primer intento exitoso');
    } catch (error) {
      console.log('❌ Primer intento falló:', error);
      retryCount = 1;

      // Delay de 2 segundos antes del segundo intento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Segundo intento
      try {
        console.log('Segundo intento de matchPractices...');
        const response = await matchPractices(matchQuery);
        practices = response.practicas;
        source = 'api';
        console.log('✅ Segundo intento exitoso');
      } catch (secondError) {
        console.log('❌ Segundo intento falló:', secondError);
        retryCount = 2;
        
        // Usar prácticas mock
        console.log('🔄 Usando prácticas mock como fallback');
        practices = MOCK_PRACTICES;
        source = 'mock';
      }
    }

    // Guardar en Firestore solo si es de API (no mock)
    if (source === 'api') {
      const matchData: OnboardingMatchData = {
        userId,
        practices,
        source,
        matchQuery,
        timestamp: serverTimestamp(),
        retryCount
      };

      try {
        await setDoc(doc(db, 'onboarding_matches', userId), matchData);
        console.log('✅ Datos guardados en Firestore');
      } catch (firestoreError) {
        console.error('❌ Error guardando en Firestore:', firestoreError);
        // No fallar si Firestore falla, solo continuar
      }

      return matchData;
    } else {
      // Para mock, no guardar en Firestore pero retornar estructura similar
      return {
        userId,
        practices,
        source,
        matchQuery,
        timestamp: new Date(),
        retryCount
      };
    }
  }

  // Obtener match existente (máx. 2h de antigüedad)
static async getExistingMatch(
  userId: string,
  matchQuery: { puesto: string; cv_url: string }
) {
  try {
    const matchId = generateMatchId(matchQuery.puesto, matchQuery.cv_url);
    const matchRef = doc(db, 'onboarding_matches', userId, 'matches', matchId);
    const snapshot = await getDoc(matchRef);

    if (!snapshot.exists()) return null;

    const data = snapshot.data() as OnboardingMatchData;

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const matchTime = data.timestamp?.toDate?.() || new Date(0);

    if (matchTime.getTime() < twoHoursAgo) return null;

    console.log('🎯 Match encontrado en cache:', {
      puesto: data.matchQuery?.puesto,
      practices: data.practices.length,
      source: data.source
    });

    return data;
  } catch (error) {
    console.error('Error verificando match existente:', error);
    return null;
  }
}

// Guardar match con límite de 10 documentos
static async saveMatch(
  userId: string,
  matchQuery: { puesto: string; cv_url: string },
  practices: Practica[]
) {
  try {
    const matchesRef = collection(db, 'onboarding_matches', userId, 'matches');
    const matchId = generateMatchId(matchQuery.puesto, matchQuery.cv_url);

    // Guardar o actualizar directamente por matchId
    await setDoc(doc(matchesRef, matchId), {
      userId,
      practices,
      source: 'api',
      matchQuery,
      timestamp: serverTimestamp(),
      retryCount: 0
    });

    // Limitar a los 10 más recientes
    const snapshot = await getDocs(query(matchesRef, orderBy('timestamp', 'desc')));
    if (snapshot.size > 10) {
      const docsToDelete = snapshot.docs.slice(10);
      await Promise.all(docsToDelete.map(d => deleteDoc(d.ref)));
    }

    console.log('💾 Match guardado en Firestore');
  } catch (error) {
    console.error('❌ Error guardando match:', error);
  }
}


}





