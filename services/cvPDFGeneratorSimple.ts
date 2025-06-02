import { CVData } from '@/types/cv';

export class CVPDFGeneratorSimple {
  static async generatePDF(cvData: CVData): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const leftMargin = 10;
      let y = 20;

      // ENCABEZADO - Nombre
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(cvData.personalInfo.fullName, leftMargin, y);
      y += 10;

      // Información de contacto en una línea
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const contactInfo = [
        cvData.personalInfo.email,
        cvData.personalInfo.address,
        cvData.personalInfo.phone,
        cvData.personalInfo.linkedIn
      ].filter(Boolean).join(' • ');
      
      doc.text(contactInfo, leftMargin, y);
      y += 15;

      // PERFIL/RESUMEN
      if (cvData.personalInfo.summary) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text("Perfil", leftMargin, y);
        y += 7;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const perfilLines = doc.splitTextToSize(cvData.personalInfo.summary, 190);
        doc.text(perfilLines, leftMargin, y);
        y += perfilLines.length * 5 + 10;
      }      // EXPERIENCIA LABORAL
      if (cvData.workExperience.length > 0) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text("Experiencia", leftMargin, y);
        y += 7;

        cvData.workExperience.forEach((exp) => {
          // Verificar si necesitamos nueva página
          if (y > 250) {
            doc.addPage();
            y = 20;
          }

          // Nombre de la empresa
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.company, leftMargin, y);
          y += 7;

          // Posición y fechas
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const dateRange = `${this.formatDate(exp.startDate)} – ${exp.current ? 'Actualidad' : this.formatDate(exp.endDate)}`;
          doc.text(`${exp.position} - ${dateRange}`, leftMargin, y);
          y += 7;

          // Logros/responsabilidades
          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach((achievement) => {
              doc.text(`• ${achievement}`, leftMargin, y);
              y += 6;
            });
          }
          y += 5; // Espacio entre trabajos
        });
        y += 5;
      }

      // EDUCACIÓN
      if (cvData.education.length > 0) {
        // Verificar si necesitamos nueva página
        if (y > 230) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text("Educación", leftMargin, y);
        y += 7;

        cvData.education.forEach((edu) => {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const eduText = `${edu.institution} - ${edu.degree}${edu.fieldOfStudy ? ` en ${edu.fieldOfStudy}` : ''} - ${this.formatDate(edu.startDate)} ${edu.current ? '– Actualidad' : `– ${this.formatDate(edu.endDate)}`}`;
          const eduLines = doc.splitTextToSize(eduText, 190);
          doc.text(eduLines, leftMargin, y);
          y += eduLines.length * 5 + 3;
        });
        y += 7;
      }

      // PROYECTOS (si existen)
      if (cvData.projects && cvData.projects.length > 0) {
        // Verificar si necesitamos nueva página
        if (y > 200) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text("Proyectos", leftMargin, y);
        y += 7;

        cvData.projects.forEach((project) => {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(project.name, leftMargin, y);
          y += 7;

          if (project.description) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const descLines = doc.splitTextToSize(project.description, 190);
            doc.text(descLines, leftMargin, y);
            y += descLines.length * 5 + 5;
          }

          if (project.technologies && project.technologies.length > 0) {
            doc.setFontSize(10);
            doc.text(`Tecnologías: ${project.technologies.join(', ')}`, leftMargin, y);
            y += 8;
          }
        });
        y += 5;
      }// HABILIDADES Y CERTIFICACIONES
      if (cvData.skills.length > 0 || (cvData.certifications && cvData.certifications.length > 0) || (cvData.hobbies && cvData.hobbies.length > 0)) {
        // Verificar si necesitamos nueva página
        if (y > 200) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text("Habilidades & Certificaciones", leftMargin, y);
        y += 7;

        // Agrupar habilidades por categoría
        const skillsByCategory = this.groupSkillsByCategory(cvData.skills);
        
        // 1. SOFTWARE (con niveles específicos)
        if (skillsByCategory['Software'] && skillsByCategory['Software'].length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const softwareSkills = skillsByCategory['Software']
            .map(skill => `${skill.name} (${skill.level})`)
            .join(', ');
          doc.text(`Software: ${softwareSkills}`, leftMargin, y);
          y += 6;
        }

        // 2. GESTIÓN DE PROYECTOS (sin niveles)
        if (skillsByCategory['Gestión de proyectos'] && skillsByCategory['Gestión de proyectos'].length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const projectSkills = skillsByCategory['Gestión de proyectos']
            .map(skill => skill.name)
            .join(', ');
          doc.text(`Gestión de proyectos: ${projectSkills}.`, leftMargin, y);
          y += 6;
        }

        // 3. CERTIFICACIONES
        if (cvData.certifications && cvData.certifications.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const certificationsText = cvData.certifications
            .map(cert => `"${cert.name}"${cert.issuer ? ` – ${cert.issuer}` : ''}`)
            .join(', ');
          doc.text(`Certificaciones: ${certificationsText}`, leftMargin, y);
          y += 6;
        }

        // 4. IDIOMAS (si existen en el CV)
        const languageSkills = skillsByCategory['Idiomas'];
        if (languageSkills && languageSkills.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const languagesText = languageSkills
            .map(lang => `${lang.name} – ${lang.level}`)
            .join(', ');
          doc.text(`Idiomas: ${languagesText}.`, leftMargin, y);
          y += 6;
        }

        // 5. HOBBIES
        if (cvData.hobbies && cvData.hobbies.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`Hobbies: ${cvData.hobbies.join(', ')}.`, leftMargin, y);
          y += 6;
        }

        // 6. OTRAS CATEGORÍAS DE HABILIDADES (si existen)
        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          if (category !== 'Software' && category !== 'Gestión de proyectos' && category !== 'Idiomas' && skills.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const skillsText = skills.map(skill => `${skill.name} (${skill.level})`).join(', ');
            doc.text(`${category}: ${skillsText}`, leftMargin, y);
            y += 6;
          }
        });
      }

      // Generar el archivo PDF
      const fileName = `CV_${cvData.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar el PDF');
    }
  }

  // Función auxiliar para formatear fechas
  private static formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  }

  // Función auxiliar para agrupar habilidades por categoría
  private static groupSkillsByCategory(skills: any[]): Record<string, any[]> {
    const categories: Record<string, any[]> = {};
    
    skills.forEach(skill => {
      const category = this.translateCategory(skill.category || 'Technical');
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(skill);
    });

    return categories;
  }

  // Función auxiliar para traducir categorías
  private static translateCategory(category: string): string {
    const translations: Record<string, string> = {
      'Technical': 'Software',
      'Leadership': 'Gestión de proyectos',
      'Communication': 'Comunicación',
      'Research': 'Investigación',
      'Language': 'Idiomas'
    };

    return translations[category] || category;
  }
}
