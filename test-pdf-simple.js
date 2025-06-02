// Test para verificar la funcionalidad del nuevo generador de PDF
import { CVPDFGeneratorSimple } from './services/cvPDFGeneratorSimple.js';

// Datos de prueba completos
const testCVData = {
  personalInfo: {
    fullName: 'Ana María Rodríguez García',
    email: 'ana.rodriguez@tecsup.edu.pe',
    phone: '+51 987 654 321',
    address: 'Lima, Perú',
    linkedIn: 'linkedin.com/in/ana-rodriguez',
    website: 'anaportfolio.dev',
    summary: 'Estudiante de último ciclo en Desarrollo de Software con experiencia práctica en tecnologías web modernas. Apasionada por crear soluciones innovadoras y eficientes. Busco oportunidades para aplicar mis conocimientos en React, Node.js y bases de datos en un entorno profesional dinámico.'
  },
  education: [
    {
      id: 'edu-1',
      institution: 'TECSUP',
      degree: 'Técnico en Desarrollo de Software',
      fieldOfStudy: 'Ingeniería de Sistemas',
      startDate: '2022-03-01',
      endDate: '2025-12-15',
      current: true,
      achievements: [
        'Promedio ponderado: 17.2/20 - Tercio Superior',
        'Proyecto destacado: Sistema de gestión académica con React',
        'Ganadora del hackathon interno TECSUP 2024',
        'Representante estudiantil del programa'
      ]
    },
    {
      id: 'edu-2',
      institution: 'I.E. María Auxiliadora',
      degree: 'Bachiller',
      fieldOfStudy: 'Ciencias',
      startDate: '2017-03-01',
      endDate: '2021-12-15',
      current: false,
      achievements: [
        'Promedio general: 16.8/20',
        'Participación en olimpiadas de matemáticas'
      ]
    }
  ],
  workExperience: [
    {
      id: 'exp-1',
      position: 'Desarrolladora Frontend - Práctica Profesional',
      company: 'InnovaTech Solutions',
      location: 'San Isidro, Lima',
      startDate: '2024-08-01',
      endDate: '2024-12-15',
      current: true,
      description: 'Desarrollo de interfaces web responsivas y mantenimiento de aplicaciones React para clientes corporativos.',
      achievements: [
        'Implementé 8 nuevas funcionalidades en el sistema CRM principal',
        'Optimicé el rendimiento de la aplicación, reduciendo tiempo de carga en 40%',
        'Lideré la migración de componentes legacy a React hooks',
        'Capacité a 3 nuevos practicantes en tecnologías frontend'
      ],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Git', 'Figma']
    },
    {
      id: 'exp-2',
      position: 'Asistente de Soporte Técnico',
      company: 'Computec SAC',
      location: 'Lima, Perú',
      startDate: '2023-01-15',
      endDate: '2023-07-30',
      current: false,
      description: 'Soporte técnico a usuarios, mantenimiento de equipos y asistencia en proyectos de infraestructura.',
      achievements: [
        'Resolví más de 150 tickets de soporte técnico',
        'Implementé sistema de inventario con Excel VBA',
        'Reduje tiempo promedio de resolución de incidencias en 25%'
      ],
      technologies: ['Windows Server', 'Active Directory', 'Excel VBA', 'TeamViewer']
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Portal WorkIn - Plataforma de Empleo',
      description: 'Desarrollo de plataforma web completa para búsqueda de empleo con sistema de matching inteligente entre candidatos y empresas.',
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      current: false,
      url: 'https://github.com/ana-rodriguez/portal-workin',
      highlights: [
        'Arquitectura full-stack con Next.js y Firebase',
        'Sistema de autenticación y autorización completo',
        'Dashboard analytics para empresas reclutadoras',
        'API RESTful para integración con sistemas externos',
        'Implementación de tests unitarios y e2e'
      ],
      technologies: ['Next.js', 'React', 'Firebase', 'TypeScript', 'Tailwind CSS', 'Jest']
    },
    {
      id: 'proj-2',
      name: 'E-commerce Responsive',
      description: 'Tienda online con carrito de compras, pasarela de pagos y panel administrativo.',
      startDate: '2023-08-01',
      endDate: '2023-12-15',
      current: false,
      highlights: [
        'Frontend responsivo con React y Bootstrap',
        'Backend con Node.js y Express',
        'Base de datos MySQL con relaciones complejas',
        'Integración con PayPal y Mercado Pago'
      ],
      technologies: ['React', 'Node.js', 'Express', 'MySQL', 'Bootstrap']
    }
  ],
  skills: [
    {
      id: 'skill-1',
      name: 'React',
      level: 'Avanzado',
      category: 'Technical'
    },
    {
      id: 'skill-2',
      name: 'JavaScript/TypeScript',
      level: 'Avanzado',
      category: 'Technical'
    },
    {
      id: 'skill-3',
      name: 'Node.js',
      level: 'Intermedio',
      category: 'Technical'
    },
    {
      id: 'skill-4',
      name: 'Python',
      level: 'Intermedio',
      category: 'Technical'
    },
    {
      id: 'skill-5',
      name: 'MySQL/Firebase',
      level: 'Intermedio',
      category: 'Technical'
    },
    {
      id: 'skill-6',
      name: 'Git/GitHub',
      level: 'Avanzado',
      category: 'Technical'
    },
    {
      id: 'skill-7',
      name: 'Trabajo en equipo',
      level: 'Avanzado',
      category: 'Communication'
    },
    {
      id: 'skill-8',
      name: 'Resolución de problemas',
      level: 'Avanzado',
      category: 'Analytical'
    },
    {
      id: 'skill-9',
      name: 'Liderazgo de proyectos',
      level: 'Intermedio',
      category: 'Leadership'
    },
    {
      id: 'skill-10',
      name: 'Análisis de datos',
      level: 'Básico',
      category: 'Analytical'
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2024-06-15',
      credentialId: 'AWS-CP-2024-0615',
      url: 'https://aws.amazon.com/certification/'
    },
    {
      id: 'cert-2',
      name: 'React Developer Certificate',
      issuer: 'Meta (Facebook)',
      date: '2024-03-20',
      credentialId: 'META-REACT-2024',
      url: 'https://developers.facebook.com/certificate/'
    },
    {
      id: 'cert-3',
      name: 'JavaScript Algorithms and Data Structures',
      issuer: 'freeCodeCamp',
      date: '2023-11-10',
      credentialId: 'FCC-JS-2023-1110'
    }
  ],
  languages: [
    {
      id: 'lang-1',
      language: 'Español',
      proficiency: 'Nativo'
    },
    {
      id: 'lang-2',
      language: 'Inglés',
      proficiency: 'Intermedio Alto (B2)'
    },
    {
      id: 'lang-3',
      language: 'Portugués',
      proficiency: 'Básico (A2)'
    }
  ],
  hobbies: [
    'Desarrollo de proyectos personales',
    'Contribución a proyectos open source',
    'Lectura de blogs tecnológicos',
    'Fotografía digital',
    'Trekking y montañismo',
    'Aprendizaje de nuevos frameworks'
  ]
};

// Función para probar la generación de PDF
async function testPDFGeneration() {
  try {
    console.log('🧪 Iniciando prueba de generación de PDF...');
    console.log('📝 Datos del CV:', JSON.stringify(testCVData, null, 2));
    
    console.log('📄 Generando PDF...');
    await CVPDFGeneratorSimple.generatePDF(testCVData);
    
    console.log('✅ PDF generado exitosamente!');
    console.log('🎉 El archivo debería haberse descargado automáticamente');
    
  } catch (error) {
    console.error('❌ Error durante la generación del PDF:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
console.log('🚀 Iniciando test del generador de PDF mejorado...');
testPDFGeneration();
