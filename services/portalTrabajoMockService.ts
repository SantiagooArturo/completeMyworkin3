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
        title: 'Diseñador UX/UI Junior',
        company: 'Ejemplo Corp',
        descripcion: 'Buscamos un diseñador creativo para unirse a nuestro equipo.',
        location: 'Remoto',
        salary: '$800 - $1200',
        url: 'https://example.com/practica1',
        fecha_agregado: '2023-10-01',
        similitud_requisitos: 85,
        similitud_puesto: 90,
        afinidad_sector: 80,
        similitud_semantica: 75,
        juicio_sistema: 82,
        similitud_total: 82,
        justificacion_requisitos: 'Cumple con los requisitos básicos.',
        justificacion_puesto: 'Título relevante en diseño.',
        justificacion_afinidad: 'Experiencia previa en proyectos similares.',
        justificacion_semantica: 'Sector en crecimiento.',
        justificacion_juicio: 'Sistema recomienda esta oportunidad.'
      },
      // Más prácticas mock...
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
