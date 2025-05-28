// Tipos e interfaces para el generador de CV con formato Harvard

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedIn?: string;
  website?: string;
  summary: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  achievements?: string[];
  honors?: string;
  relevantCourses?: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
  achievements: string[];
  technologies?: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
  category: 'Técnica' | 'Blanda' | 'Idioma';
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  current: boolean;
  url?: string;
  highlights: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';
}

export interface CVData {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  references: Reference[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  awards?: string[];
  publications?: string[];
  volunteerWork?: string[];
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'harvard' | 'modern' | 'creative' | 'minimal';
}
