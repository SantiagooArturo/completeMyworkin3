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
  technologies: string;  // Tecnologías utilizadas
  startDate: string;      // Fecha de inicio
  endDate: string;        // Fecha de finalización
  current: boolean;       // Si está en curso
  url?: string;           // Enlace al proyecto
  highlights: string[];   // Logros y resultados destacados
  role?: string;         // Rol en el proyecto
  teamSize?: number;     // Tamaño del equipo
  methodology?: string;  // Metodología utilizada
}

export interface Volunteer {
  id: string;
  organization: string;
  position: string;
  startDate: string;
  endDate: string;
  currentlyVolunteering: boolean;
  description: string;
  skills: string[];
  impact?: string; // Impacto o logros del voluntariado
  location?: string;
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
  volunteer : Volunteer[],
  languages?: Language[];   // ✅ Agregado para completitud
  references?: Reference[]; // ✅ Agregado para completitud
  hobbies?: string[];      // ✅ NUEVO: Hobbies e intereses
}
