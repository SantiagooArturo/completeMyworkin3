import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { matchPractices, MatchPracticesRequest, Practica } from './matchPracticesService';

export interface OnboardingMatchData {
  userId: string;
  practices: Practica[];
  source: 'api' | 'mock';
  matchQuery: {
    puesto: string;
    cv_url: string;
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
    similitud_requisitos: 85,
    similitud_titulo: 92,
    similitud_experiencia: 78,
    similitud_macro: 88,
    similitud_total: 86,
    justificacion_requisitos: "Tu perfil académico en desarrollo se alinea perfectamente con los requisitos técnicos.",
    justificacion_titulo: "El título coincide directamente con tu área de interés en desarrollo frontend.",
    justificacion_experiencia: "Aunque es tu primera experiencia, el perfil es ideal para practicantes.",
    justificacion_macro: "La empresa busca perfiles junior con ganas de aprender, perfecto para ti."
  },
  {
    company: "Innovación Digital SAC",
    title: "Practicante de Sistemas",
    descripcion: "Participa en proyectos de automatización y mejora de procesos empresariales.",
    location: "Lima, Perú",
    salary: "S/. 1,000 - S/. 1,300",
    url: "https://example.com/job2",
    fecha_agregado: "2025-01-09",
    similitud_requisitos: 80,
    similitud_titulo: 88,
    similitud_experiencia: 82,
    similitud_macro: 85,
    similitud_total: 84,
    justificacion_requisitos: "Tus conocimientos académicos cubren las tecnologías que utilizan.",
    justificacion_titulo: "El rol de sistemas se adapta bien a tu formación académica.",
    justificacion_experiencia: "Buscan estudiantes motivados sin experiencia previa requerida.",
    justificacion_macro: "Empresa en crecimiento que invierte en el desarrollo de talentos jóvenes."
  },
  {
    company: "StartUp Labs",
    title: "Practicante de Desarrollo Frontend",
    descripcion: "Colabora en el desarrollo de interfaces de usuario para aplicaciones web innovadoras.",
    location: "Lima, Perú",
    salary: "S/. 1,100 - S/. 1,400",
    url: "https://example.com/job3",
    fecha_agregado: "2025-01-08",
    similitud_requisitos: 87,
    similitud_titulo: 95,
    similitud_experiencia: 75,
    similitud_macro: 82,
    similitud_total: 85,
    justificacion_requisitos: "Perfecto match con HTML, CSS, JavaScript que has estudiado.",
    justificacion_titulo: "Frontend es exactamente lo que has seleccionado como interés principal.",
    justificacion_experiencia: "Ambiente ideal para aprender y crecer profesionalmente.",
    justificacion_macro: "Startup con cultura joven y mentoría constante para practicantes."
  },
  {
    company: "Soluciones Tech EIRL",
    title: "Practicante de Soporte Técnico",
    descripcion: "Brinda soporte técnico a clientes y participa en proyectos de infraestructura IT.",
    location: "Lima, Perú",
    salary: "S/. 950 - S/. 1,200",
    url: "https://example.com/job4",
    fecha_agregado: "2025-01-07",
    similitud_requisitos: 75,
    similitud_titulo: 80,
    similitud_experiencia: 88,
    similitud_macro: 78,
    similitud_total: 80,
    justificacion_requisitos: "Tus conocimientos técnicos son suficientes para el rol de soporte.",
    justificacion_titulo: "Soporte técnico complementa bien tu formación en sistemas.",
    justificacion_experiencia: "Excelente punto de entrada para ganar experiencia práctica.",
    justificacion_macro: "Empresa estableci con buenos programas de entrenamiento."
  },
  {
    company: "Digital Growth Co.",
    title: "Practicante de Marketing Digital",
    descripcion: "Apoya en campañas digitales, análisis de métricas y gestión de redes sociales.",
    location: "Lima, Perú",
    salary: "S/. 1,000 - S/. 1,350",
    url: "https://example.com/job5",
    fecha_agregado: "2025-01-06",
    similitud_requisitos: 70,
    similitud_titulo: 75,
    similitud_experiencia: 85,
    similitud_macro: 80,
    similitud_total: 78,
    justificacion_requisitos: "Tus habilidades analíticas se transfieren bien al marketing digital.",
    justificacion_titulo: "Aunque no es tu área principal, hay overlap con tecnología.",
    justificacion_experiencia: "Perfecto para estudiantes que buscan diversificar habilidades.",
    justificacion_macro: "Sector en crecimiento con muchas oportunidades de aprendizaje."
  }
];

export class OnboardingMatchService {
  static async executeMatchWithRetry(matchQuery: MatchPracticesRequest, userId: string): Promise<OnboardingMatchData> {
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
}
