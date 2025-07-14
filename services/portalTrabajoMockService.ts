import { Practica } from './matchPracticesService';

// Servicio mock para simular funcionalidades del portal de trabajo
export class PortalTrabajoMockService {
  
  // Simular refresco automático cada 2 horas
  static setupAutoRefresh(callback: () => void): NodeJS.Timeout {
    // En ambiente real sería 2 horas (7200000 ms)
    // Para demo, usamos 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresco activado (simulado)');
      callback();
    }, 30000); // 30 segundos para demo
    
    return interval;
  }

  // Simular verificación de CV del usuario
  static async checkUserCV(userId: string): Promise<{hasCV: boolean, cvUrl?: string, fileName?: string}> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Para demo, simulamos que el usuario tiene CV
    return {
      hasCV: true,
      cvUrl: 'https://example.com/cv.pdf',
      fileName: 'mi-cv.pdf'
    };
  }

  // Simular match de prácticas con filtros
  static async mockMatchPracticas(puestos: string[]): Promise<Practica[]> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const todasLasPracticas: Practica[] = [
      {
        company: 'MyWorkin',
        title: 'UX/UI Designer - Prácticas',
        descripcion: 'Únete a nuestro equipo de diseño para crear experiencias digitales excepcionales. Trabajarás en proyectos reales con mentores experimentados.',
        location: 'Lima, Perú',
        salary: 'S/ 1200',
        url: '#',
        fecha_agregado: 'hace 3 días',
        similitud_requisitos: 85,
        similitud_titulo: 90,
        similitud_experiencia: 75,
        similitud_macro: 80,
        similitud_total: 82
      },
      {
        company: 'TechCorp Solutions',
        title: 'Frontend Developer Intern',
        descripcion: 'Desarrollo de interfaces web modernas usando React y TypeScript. Perfecta para estudiantes de sistemas que buscan experiencia práctica.',
        location: 'Lima, Perú',
        salary: 'S/ 1500',
        url: '#',
        fecha_agregado: 'hace 1 día',
        similitud_requisitos: 78,
        similitud_titulo: 85,
        similitud_experiencia: 70,
        similitud_macro: 88,
        similitud_total: 80
      },
      {
        company: 'StartupPeru',
        title: 'Diseñador Gráfico Junior',
        descripcion: 'Oportunidad de crecimiento en startup en expansión. Trabajarás en branding, marketing digital y diseño de productos.',
        location: 'Arequipa, Perú',
        salary: 'S/ 1000',
        url: '#',
        fecha_agregado: 'hace 5 días',
        similitud_requisitos: 82,
        similitud_titulo: 88,
        similitud_experiencia: 65,
        similitud_macro: 75,
        similitud_total: 77
      },
      {
        company: 'InnovaTech',
        title: 'Product Designer Trainee',
        descripcion: 'Programa de entrenamiento integral en diseño de productos digitales. Incluye capacitación en metodologías ágiles y design thinking.',
        location: 'Cusco, Perú',
        salary: 'S/ 1100',
        url: '#',
        fecha_agregado: 'hace 2 días',
        similitud_requisitos: 90,
        similitud_titulo: 85,
        similitud_experiencia: 80,
        similitud_macro: 85,
        similitud_total: 85
      },
      {
        company: 'Digital Agency',
        title: 'Web Designer & Developer',
        descripcion: 'Posición híbrida perfecta para quien domina tanto diseño como desarrollo web. Proyectos variados para clientes internacionales.',
        location: 'Lima, Perú',
        salary: 'S/ 1400',
        url: '#',
        fecha_agregado: 'hace 4 días',
        similitud_requisitos: 75,
        similitud_titulo: 80,
        similitud_experiencia: 85,
        similitud_macro: 78,
        similitud_total: 79
      },
      {
        company: 'CreativeStudio',
        title: 'Motion Graphics Designer',
        descripcion: 'Creación de contenido audiovisual para redes sociales y campañas publicitarias. Ideal para estudiantes de comunicación audiovisual.',
        location: 'Lima, Perú',
        salary: 'S/ 1300',
        url: '#',
        fecha_agregado: 'hace 6 días',
        similitud_requisitos: 70,
        similitud_titulo: 75,
        similitud_experiencia: 60,
        similitud_macro: 72,
        similitud_total: 69
      },
      {
        company: 'EcommercePeru',
        title: 'Marketing Digital Specialist',
        descripcion: 'Gestión de campañas digitales, análisis de métricas y optimización de conversiones. Experiencia en Google Ads y Facebook Ads.',
        location: 'Lima, Perú',
        salary: 'S/ 1350',
        url: '#',
        fecha_agregado: 'hace 7 días',
        similitud_requisitos: 68,
        similitud_titulo: 70,
        similitud_experiencia: 65,
        similitud_macro: 74,
        similitud_total: 69
      }
    ];

    // Filtrar prácticas según puestos seleccionados
    const practicasFiltradas = todasLasPracticas.filter(practica => 
      puestos.some(puesto => {
        const puestoLower = puesto.toLowerCase();
        const tituloLower = practica.title.toLowerCase();
        
        // Coincidencia exacta o parcial
        return tituloLower.includes(puestoLower) || 
               puestoLower.includes('diseñador') && tituloLower.includes('design') ||
               puestoLower.includes('developer') && tituloLower.includes('developer') ||
               puestoLower.includes('frontend') && tituloLower.includes('frontend') ||
               puestoLower.includes('marketing') && tituloLower.includes('marketing');
      })
    );

    // Si no hay coincidencias específicas, devolver algunas prácticas por defecto
    return practicasFiltradas.length > 0 ? practicasFiltradas : todasLasPracticas.slice(0, 3);
  }

  // Simular guardado de historial de matches
  static async saveMatchHistory(userId: string, puestos: string[], practicas: Practica[]): Promise<void> {
    const matchData = {
      userId,
      puestos,
      practicas,
      timestamp: new Date().toISOString(),
      source: 'mock'
    };
    
    console.log('💾 Guardando historial de match (simulado):', {
      userId,
      puestos: puestos.join(', '),
      cantidadPracticas: practicas.length
    });
    
    // En implementación real, se guardaría en Firestore
    localStorage.setItem(`match_history_${userId}`, JSON.stringify(matchData));
  }

  // Obtener último puesto usado
  static getLastUsedPuesto(userId: string): string[] {
    try {
      const historial = localStorage.getItem(`match_history_${userId}`);
      if (historial) {
        const data = JSON.parse(historial);
        return data.puestos || ['Diseñador UX/UI'];
      }
    } catch (error) {
      console.error('Error obteniendo último puesto:', error);
    }
    
    return ['Diseñador UX/UI']; // Default
  }

  // Simular notificación de nuevas prácticas
  static checkForNewPracticas(): boolean {
    // Simular que a veces hay nuevas prácticas
    return Math.random() > 0.7; // 30% de probabilidad
  }
}
