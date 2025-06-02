import { CVData } from '@/types/cv';

export const completeStudentCVData: CVData = {
  personalInfo: {
    fullName: 'María Elena Rodríguez García',
    email: 'maria.rodriguez@tecsup.edu.pe',
    phone: '+51 987 654 321',
    address: 'Lima, Perú',
    linkedIn: 'linkedin.com/in/maria-rodriguez-dev',
    website: 'https://github.com/mariarodriguez',
    summary: 'Estudiante de Ingeniería de Software con sólida formación en desarrollo web y mobile. Apasionada por la tecnología y con experiencia práctica en proyectos académicos utilizando React, Node.js y bases de datos. Busco oportunidades para aplicar mis conocimientos y continuar creciendo profesionalmente en el sector tecnológico.'
  },
  education: [
    {
      id: '1',
      degree: 'Carrera Profesional Técnica en Desarrollo de Software',
      institution: 'TECSUP',
      fieldOfStudy: 'Ingeniería de Software',
      startDate: '2022-03',
      endDate: '2025-12',
      current: true,
      gpa: '17.5/20',
      honors: 'Tercio Superior',
      achievements: [
        'Beca de Excelencia Académica 2023-2024',
        'Mejor proyecto de desarrollo web del ciclo',
        'Participación en hackathon interno TECSUP'
      ],
      relevantCourses: [
        'Programación Orientada a Objetos',
        'Desarrollo Web Full Stack',
        'Base de Datos Avanzadas',
        'Metodologías Ágiles',
        'DevOps y Cloud Computing'
      ]
    },
    {
      id: '2',
      degree: 'Bachillerato',
      institution: 'I.E. San Martín de Porres',
      fieldOfStudy: 'Ciencias',
      startDate: '2017-03',
      endDate: '2021-12',
      current: false,
      gpa: '16.8/20',
      honors: 'Cuadro de Honor',
      achievements: [
        'Mejor estudiante en Matemáticas',
        'Representante estudiantil'
      ],
      relevantCourses: []
    }
  ],
  workExperience: [
    {
      id: '1',
      position: 'Practicante de Desarrollo Web',
      company: 'StartupTech Solutions',
      location: 'Lima, Perú',
      startDate: '2024-07',
      endDate: '2024-12',
      current: false,
      description: 'Desarrollo de aplicaciones web utilizando React y Node.js. Colaboración en equipo usando metodologías ágiles.',
      achievements: [
        'Desarrollé 3 módulos principales del sistema de gestión',
        'Optimicé el rendimiento de la aplicación en un 30%',
        'Implementé pruebas unitarias aumentando la cobertura al 85%'
      ],
      technologies: ['React', 'Node.js', 'MongoDB', 'Git', 'Jest']
    },
    {
      id: '2',
      position: 'Asistente de Soporte Técnico',
      company: 'TECSUP - Centro de Cómputo',
      location: 'Lima, Perú',
      startDate: '2023-08',
      endDate: '2024-06',
      current: false,
      description: 'Soporte técnico a estudiantes y mantenimiento de laboratorios de cómputo.',
      achievements: [
        'Resolví más de 200 incidencias técnicas',
        'Capacité a 50+ estudiantes en uso de software',
        'Implementé sistema de tickets reduciendo tiempo de respuesta'
      ],
      technologies: ['Windows', 'Office', 'Redes', 'Hardware']
    }
  ],
  projects: [
    {
      id: '1',
      name: 'EcoTracker - App de Sostenibilidad',
      description: 'Aplicación móvil para seguimiento de hábitos ecológicos utilizando React Native y Firebase. Permite a los usuarios registrar actividades sostenibles y obtener estadísticas de su impacto ambiental.',
      startDate: '2024-09',
      endDate: '2024-12',
      current: false,
      url: 'https://github.com/mariarodriguez/ecotracker',
      highlights: [
        'Más de 500 descargas en primera semana de lanzamiento',
        'Interfaz intuitiva con puntuación de 4.8/5 en usabilidad',
        'Integración con API de datos ambientales en tiempo real'
      ],
      technologies: ['React Native', 'Firebase', 'APIs REST', 'TypeScript']
    },
    {
      id: '2',
      name: 'Sistema de Gestión Académica',
      description: 'Sistema web completo para gestión de notas y asistencia estudiantil desarrollado como proyecto final del curso de Base de Datos.',
      startDate: '2024-04',
      endDate: '2024-07',
      current: false,
      url: 'https://github.com/mariarodriguez/sistema-academico',
      highlights: [
        'Manejo de más de 1000 registros de estudiantes',
        'Dashboard con métricas en tiempo real',
        'Implementación de roles y permisos avanzados'
      ],
      technologies: ['Vue.js', 'Laravel', 'MySQL', 'Bootstrap']
    },
    {
      id: '3',
      name: 'Bot de Trading Automatizado',
      description: 'Bot de trading que utiliza algoritmos de machine learning para analizar tendencias del mercado de criptomonedas.',
      startDate: '2024-01',
      endDate: '2024-03',
      current: false,
      url: 'https://github.com/mariarodriguez/trading-bot',
      highlights: [
        'Retorno de inversión simulado del 15% en 3 meses',
        'Análisis de más de 50 indicadores técnicos',
        'Sistema de alertas automatizadas'
      ],
      technologies: ['Python', 'Pandas', 'Scikit-learn', 'APIs Crypto']
    }
  ],  skills: [
    {
      id: '1',
      name: 'JavaScript',
      level: 'Avanzado',
      category: 'Technical'
    },
    {
      id: '2',
      name: 'React',
      level: 'Avanzado',
      category: 'Technical'
    },
    {
      id: '3',
      name: 'Node.js',
      level: 'Intermedio',
      category: 'Technical'
    },
    {
      id: '4',
      name: 'Python',
      level: 'Intermedio',
      category: 'Technical'
    },
    {
      id: '5',
      name: 'SQL',
      level: 'Avanzado',
      category: 'Technical'
    },
    {
      id: '6',
      name: 'Git',
      level: 'Avanzado',
      category: 'Technical'
    },
    {
      id: '7',
      name: 'Trabajo en Equipo',
      level: 'Avanzado',
      category: 'Leadership'
    },
    {
      id: '8',
      name: 'Comunicación Efectiva',
      level: 'Avanzado',
      category: 'Communication'
    },
    {
      id: '9',
      name: 'Resolución de Problemas',
      level: 'Avanzado',
      category: 'Analytical'
    },
    {
      id: '10',
      name: 'Investigación Académica',
      level: 'Intermedio',
      category: 'Research'
    },
    {
      id: '11',
      name: 'Análisis de Datos',
      level: 'Avanzado',
      category: 'Analytical'
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2024-10',
      expiryDate: '2027-10',
      credentialId: 'AWS-CP-2024-001'
    },
    {
      id: '2',
      name: 'Scrum Fundamentals Certified',
      issuer: 'SCRUMstudy',
      date: '2024-06',
      expiryDate: '',
      credentialId: 'SFC-789456'
    },
    {
      id: '3',
      name: 'Google Analytics Individual Qualification',
      issuer: 'Google',
      date: '2024-03',
      expiryDate: '2025-03',
      credentialId: 'GA-IQ-2024'
    }
  ],
  hobbies: [
    'Desarrollo de videojuegos indie',
    'Fotografía digital',
    'Senderismo y montañismo',
    'Lectura de ciencia ficción',
    'Contribución a proyectos open source',
    'Ajedrez'
  ]
};
