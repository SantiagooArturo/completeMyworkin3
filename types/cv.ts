// Información personal clara y formal
export interface PersonalInfo {
  fullName: string;           // Nombre completo
  email: string;             // Correo electrónico profesional
  phone: string;             // Número de teléfono
  address: string;           // Ciudad y País
  linkedIn?: string;         // Perfil de LinkedIn
  website?: string;          // Sitio web personal o portafolio
  summary: string;           // Resumen profesional conciso
}

// Formación académica con énfasis en logros académicos
export interface Education {
  id: string;
  institution: string;       // Nombre de la institución
  degree: string;           // Título obtenido
  fieldOfStudy?: string;    // Campo de estudio específico
  startDate: string;        // Fecha de inicio
  endDate: string;          // Fecha de finalización
  current: boolean;         // Si está en curso
  gpa?: string;            // GPA o promedio académico
  honors?: string;         // Honores académicos (Cum Laude, etc.)
  relevantCourses?: string[]; // Cursos relevantes para la posición
  achievements?: string[];  // Logros académicos destacados
  location?: string;       // Ciudad y país de la institución
}

// Experiencia profesional con énfasis en logros cuantificables
export interface WorkExperience {
  id: string;
  company: string;          // Nombre de la empresa
  position: string;         // Cargo o posición
  startDate: string;        // Fecha de inicio
  endDate: string;          // Fecha de finalización
  current: boolean;         // Si es el trabajo actual
  location?: string;        // Ciudad y país
  description?: string;     // Breve descripción del rol
  achievements: string[];   // Logros cuantificables y medibles
  technologies?: string[];  // Tecnologías o herramientas utilizadas
  responsibilities?: string[]; // Responsabilidades principales
  projects?: string[];      // Proyectos destacados
  // ✅ NUEVO: Soporte para subsecciones (como Recursos Humanos, Finanzas)
  sections?: {
    title: string;          // Nombre de la subsección
    achievements: string[]; // Logros específicos de esa área
  }[];
}

// Habilidades categorizadas según el formato Harvard
export interface Skill {
  id: string;
  name: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto';
  category: 'Technical' | 'Analytical' | 'Leadership' | 'Communication' | 'Research' | 'Language';
  proficiency?: number;     // Nivel de competencia (1-5)
  certifications?: string[]; // Certificaciones relacionadas
}

// ✅ NUEVO: Categorías de habilidades específicas para formato Harvard
export interface SkillCategory {
  id: string;
  category: string;         // "Software", "Gestión de proyectos", "Certificaciones"
  skills: {
    name: string;          // "Excel", "Microsoft Project"
    level?: string;        // "(Intermedio)", "(Avanzado)", etc.
  }[];
}

// Idiomas con nivel de competencia
export interface Language {
  id: string;
  language: string;
  proficiency: 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';
  certifications?: string[]; // Certificaciones de idiomas
  writingLevel?: string;    // Nivel de escritura específico
  speakingLevel?: string;   // Nivel de conversación específico
}

// Proyectos con detalles específicos
export interface Project {
  id: string;
  name: string;            // Nombre del proyecto
  description: string;     // Descripción detallada
  technologies: string[];  // Tecnologías utilizadas
  startDate: string;      // Fecha de inicio
  endDate: string;        // Fecha de finalización
  current: boolean;       // Si está en curso
  url?: string;           // Enlace al proyecto
  highlights: string[];   // Logros y resultados destacados
  role?: string;         // Rol en el proyecto
  teamSize?: number;     // Tamaño del equipo
  methodology?: string;  // Metodología utilizada
}

// Certificaciones profesionales
export interface Certification {
  id: string;
  name: string;           // Nombre de la certificación
  issuer: string;         // Entidad emisora
  date: string;          // Fecha de obtención
  expiryDate?: string;   // Fecha de vencimiento
  credentialId?: string; // ID de la credencial
  url?: string;          // URL de verificación
  score?: string;        // Calificación obtenida
  description?: string;  // Descripción breve
}

// Referencias profesionales
export interface Reference {
  id: string;
  name: string;           // Nombre completo
  position: string;       // Cargo actual
  company: string;        // Empresa actual
  email: string;         // Correo electrónico
  phone: string;         // Teléfono
  relationship?: string;  // Relación profesional
  yearsKnown?: number;   // Años de conocimiento
  preferredContact?: 'email' | 'phone'; // Método de contacto preferido
}

// ✅ NUEVO: Hobbies e intereses personales
export interface PersonalInterests {
  hobbies?: string[];      // ["Jugar fútbol", "golf", "tenis"]
  interests?: string[];    // ["escuchar podcasts", "ver películas"]
}

// Estructura completa del CV
export interface CVData {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages?: Language[];   // ✅ Agregado para completitud
  references?: Reference[]; // ✅ Agregado para completitud
  hobbies?: string[];      // ✅ NUEVO: Hobbies e intereses
}

// ✅ NUEVO: CVData optimizada específicamente para formato Harvard
export interface CVDataHarvard {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  skillCategories: SkillCategory[]; // Reemplaza skills[] para formato Harvard
  certifications: Certification[];
  languages: Language[];
  hobbies?: string[];      // Hobbies e intereses personales
  projects?: Project[];    // Opcional para formato Harvard
  references?: Reference[]; // Opcional, usualmente no se incluyen
}

// ✅ NUEVO: Datos de ejemplo para Francesco Lucchesi
export const francescoLucchesiCV: CVDataHarvard = {
  personalInfo: {
    fullName: "Francesco Lucchesi Via",
    email: "flucchesi88@gmail.com",
    phone: "+51 954600805",
    address: "Lima, Perú",
    linkedIn: "linkedin.com/in/francesco-lucchesi/",
    summary: "Estudiante de octavo ciclo de Administración de Empresas en la Universidad de Lima. A lo largo de mi recorrido académico y profesional, he forjado una mentalidad dedicada y analítica. Mi trayectoria ha sido un proceso de aprendizaje constante, y me entusiasma la idea de continuar desarrollándome profesionalmente en áreas como administración y desarrollo de productos."
  },
  education: [
    {
      id: "edu-1",
      institution: "Universidad de Lima",
      degree: "Bachiller",
      fieldOfStudy: "Administración de Empresas",
      startDate: "2020",
      endDate: "",
      current: true,
      achievements: ["Tercio superior en la actualidad"]
    },
    {
      id: "edu-2",
      institution: "Colegio Alpamayo",
      degree: "Bachillerato",
      fieldOfStudy: "",
      startDate: "2008",
      endDate: "2019",
      current: false
    }
  ],
  workExperience: [
    {
      id: "exp-1",
      company: "Yape",
      position: "Practicante de Tribu Producto",
      startDate: "2024-01",
      endDate: "",
      current: true,
      description: "La Fintech más grande del Perú con más de 14 millones de usuarios.",
      achievements: [
        "Creación de un piloto para fomentar la sinergia entre dos entidades bancarias, con el objetivo de potenciar transacciones de los usuarios.",
        "Creación de informes diarios, semanales y mensuales para una base de más de 1000 clientes, proporcionando análisis detallados y personalizados sobre las principales funcionalidades de Yape."
      ]
    },
    {
      id: "exp-2",
      company: "Community Brands",
      position: "Practicante de Recursos humanos y Finanzas",
      startDate: "2023-07",
      endDate: "2024-01",
      current: false,
      description: "Un emprendimiento peruano localmente reconocido por sus marcas: Amaru Superfoods, Al Trono y Postres en Casa.",
      achievements: [],
      sections: [
        {
          title: "Recursos humanos",
          achievements: [
            "Reclutamiento y Selección de Personal: Responsable de identificar y atraer talento excepcional, así como de llevar a cabo procesos de evaluación rigurosos y la selección de candidatos destacados.",
            "Supervisión de procesos de Recursos Humanos, incluyendo la gestión del proceso de reclutamiento de personal, administración de nóminas y acuerdos contractuales."
          ]
        },
        {
          title: "Finanzas",
          achievements: [
            "Preparación de Informes Trimestrales: Elaboración de informes financieros trimestrales que ofrecen una visión detallada del rendimiento financiero, incluyendo análisis de tendencias y proyecciones.",
            "Gestión Financiera y Conciliaciones Bancarias: Responsable de realizar conciliaciones bancarias periódicas para garantizar la integridad y precisión de los registros financieros."
          ]
        }
      ]
    }
  ],
  skillCategories: [
    {
      id: "skill-cat-1",
      category: "Software",
      skills: [
        { name: "Microsoft Office: Excel", level: "(Intermedio)" },
        { name: "Power Point", level: "(Avanzado)" },
        { name: "Word", level: "(Avanzado)" },
        { name: "SQL", level: "(Principiante)" }
      ]
    },
    {
      id: "skill-cat-2",
      category: "Gestión de proyectos",
      skills: [
        { name: "Microsoft Project" },
        { name: "Trello" },
        { name: "Notion" }
      ]
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Advanced Intermediate Excel Course",
      issuer: "A2 Capacitación",
      date: "2023",
      description: "Certificación en Excel nivel intermedio avanzado"
    }
  ],
  languages: [
    {
      id: "lang-1",
      language: "Español",
      proficiency: "Nativo"
    },
    {
      id: "lang-2",
      language: "Inglés",
      proficiency: "Avanzado"
    }
  ],
  hobbies: ["Jugar fútbol", "golf", "tenis", "escuchar podcasts", "ver películas"]
};
