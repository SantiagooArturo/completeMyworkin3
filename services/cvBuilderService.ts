'use client';

import { CVData, PersonalInfo, Education, WorkExperience, Skill, Reference, Project, Certification, Language } from '@/types/cv';
import { db } from '@/firebase/config';
import { User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

export interface SavedCV {
  id: string;
  userId: string;
  title: string;
  data: CVData;
  template: string;
  createdAt: any;
  updatedAt: any;
}

export class CVBuilderService {
  private static instance: CVBuilderService;

  public static getInstance(): CVBuilderService {
    if (!CVBuilderService.instance) {
      CVBuilderService.instance = new CVBuilderService();
    }
    return CVBuilderService.instance;
  }

  // Guardar CV
  async saveCV(user: User, cvData: CVData, title: string, template: string = 'harvard'): Promise<string> {
    try {
      if (!user || !user.uid) {
        throw new Error('Usuario no autenticado');
      }

      const cvDoc: Omit<SavedCV, 'id'> = {
        userId: user.uid,
        title,
        data: cvData,
        template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'userCVs'), cvDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error guardando CV:', error);
      throw new Error('Error al guardar el CV');
    }
  }

  // Actualizar CV existente
  async updateCV(cvId: string, cvData: CVData, title?: string): Promise<void> {
    try {
      const cvRef = doc(db, 'userCVs', cvId);
      const updateData: any = {
        data: cvData,
        updatedAt: serverTimestamp()
      };

      if (title) {
        updateData.title = title;
      }

      await updateDoc(cvRef, updateData);
    } catch (error) {
      console.error('Error actualizando CV:', error);
      throw new Error('Error al actualizar el CV');
    }
  }

  // Obtener CVs del usuario
  async getUserCVs(user: User): Promise<SavedCV[]> {
    try {
      if (!user || !user.uid) {
        throw new Error('Usuario no autenticado');
      }

      const cvsQuery = query(
        collection(db, 'userCVs'),
        where('userId', '==', user.uid)
      );

      const cvsSnapshot = await getDocs(cvsQuery);
      const cvs = cvsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedCV[];

      // Ordenar por fecha de actualización más reciente
      return cvs.sort((a, b) => {
        const dateA = a.updatedAt?.toDate() || new Date(0);
        const dateB = b.updatedAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error obteniendo CVs del usuario:', error);
      throw new Error('Error al cargar los CVs');
    }
  }

  // Obtener un CV específico
  async getCV(cvId: string): Promise<SavedCV | null> {
    try {
      const cvRef = doc(db, 'userCVs', cvId);
      const cvDoc = await getDoc(cvRef);

      if (cvDoc.exists()) {
        return {
          id: cvDoc.id,
          ...cvDoc.data()
        } as SavedCV;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo CV:', error);
      throw new Error('Error al cargar el CV');
    }
  }

  // Eliminar CV
  async deleteCV(cvId: string): Promise<void> {
    try {
      const cvRef = doc(db, 'userCVs', cvId);
      await updateDoc(cvRef, {
        deleted: true,
        deletedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error eliminando CV:', error);
      throw new Error('Error al eliminar el CV');
    }
  }

  // Validar datos del CV
  validateCVData(cvData: CVData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar información personal obligatoria
    if (!cvData.personalInfo.fullName.trim()) {
      errors.push('El nombre completo es obligatorio');
    }
    if (!cvData.personalInfo.email.trim()) {
      errors.push('El correo electrónico es obligatorio');
    }
    if (!cvData.personalInfo.phone.trim()) {
      errors.push('El teléfono es obligatorio');
    }
    if (!cvData.personalInfo.summary.trim()) {
      errors.push('El resumen profesional es obligatorio');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cvData.personalInfo.email && !emailRegex.test(cvData.personalInfo.email)) {
      errors.push('El formato del correo electrónico no es válido');
    }

    // Validar que tenga al menos una educación
    if (cvData.education.length === 0) {
      errors.push('Debe incluir al menos una formación académica');
    }

    // Validar educación
    cvData.education.forEach((edu, index) => {
      if (!edu.institution.trim()) {
        errors.push(`La institución en educación ${index + 1} es obligatoria`);
      }
      if (!edu.degree.trim()) {
        errors.push(`El título en educación ${index + 1} es obligatorio`);
      }
    });

    // Validar experiencia laboral si existe
    cvData.workExperience.forEach((exp, index) => {
      if (!exp.company.trim()) {
        errors.push(`La empresa en experiencia ${index + 1} es obligatoria`);
      }
      if (!exp.position.trim()) {
        errors.push(`El cargo en experiencia ${index + 1} es obligatorio`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generar PDF del CV (placeholder)
  async generatePDF(cvData: CVData, template: string = 'harvard'): Promise<Blob> {
    try {
      // Aquí implementarías la lógica para generar PDF
      // Por ahora, retornamos un placeholder
      throw new Error('Generación de PDF en desarrollo');
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar el PDF del CV');
    }
  }
}

// Exportar instancia singleton
export const cvBuilderService = CVBuilderService.getInstance();
