import { CVData } from '@/types/cv';

export class CVPDFGeneratorSimple {  static async generatePDF(cvData: CVData): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const leftMargin = 15;
      const rightMargin = 15;
      const contentWidth = pageWidth - leftMargin - rightMargin;
      let y = 25;

      // Configurar fuentes mejoradas
      doc.setFont('helvetica');

      // ENCABEZADO - Nombre con estilo mejorado
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      const nameWidth = doc.getTextWidth(cvData.personalInfo.fullName);
      const nameX = (pageWidth - nameWidth) / 2; // Centrar el nombre
      doc.text(cvData.personalInfo.fullName, nameX, y);
      y += 8;

      // Línea decorativa bajo el nombre
      const lineY = y;
      doc.setDrawColor(2, 139, 191); // Color azul corporativo
      doc.setLineWidth(0.8);
      doc.line(leftMargin, lineY, pageWidth - rightMargin, lineY);
      y += 12;

      // Información de contacto estilizada
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60); // Gris oscuro
      
      const contactItems = [
        { icon: '✉', text: cvData.personalInfo.email },
        { icon: '📱', text: cvData.personalInfo.phone },
        { icon: '📍', text: cvData.personalInfo.address },
        { icon: '🔗', text: cvData.personalInfo.linkedIn }
      ].filter(item => item.text);

      // Organizar contacto en dos columnas si hay muchos elementos
      const itemsPerRow = Math.ceil(contactItems.length / 2);
      let currentRow = 0;
      let currentCol = 0;

      contactItems.forEach((item, index) => {
        const x = currentCol === 0 ? leftMargin : pageWidth / 2;
        doc.text(`${item.icon} ${item.text}`, x, y + (currentRow * 6));
        
        currentCol++;
        if (currentCol >= 2) {
          currentCol = 0;
          currentRow++;
        }
      });

      y += Math.ceil(contactItems.length / 2) * 6 + 15;

      // Función para agregar títulos de sección con estilo
      const addSectionTitle = (title: string) => {
        if (y > 250) {
          doc.addPage();
          y = 25;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(2, 139, 191); // Color azul corporativo
        doc.text(title.toUpperCase(), leftMargin, y);
        
        y += 10;
        doc.setTextColor(0, 0, 0); // Volver a negro
      };

      // PERFIL/RESUMEN PROFESIONAL
      if (cvData.personalInfo.summary) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(cvData.personalInfo.summary, contentWidth);
        doc.text(summaryLines, leftMargin, y);
        y += summaryLines.length * 5 + 12;
      }

      // EXPERIENCIA LABORAL
      if (cvData.workExperience.length > 0) {
        addSectionTitle('Experiencia Profesional');

        cvData.workExperience.forEach((exp, index) => {
          // Verificar espacio en página
          if (y > 240) {
            doc.addPage();
            y = 25;
          }

          // Empresa y fechas en la misma línea
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(exp.company, leftMargin, y);
          
          // Fechas alineadas a la derecha
          const dateRange = `${this.formatDate(exp.startDate)} - ${exp.current ? 'Presente' : this.formatDate(exp.endDate)}`;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          const dateWidth = doc.getTextWidth(dateRange);
          doc.text(dateRange, pageWidth - rightMargin - dateWidth, y);
          y += 7;

          // Posición/Cargo
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(40, 40, 40);
          doc.text(exp.position, leftMargin, y);
          y += 8;

          // Logros y responsabilidades
          if (exp.achievements && exp.achievements.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            exp.achievements.forEach((achievement) => {
              const achievementLines = doc.splitTextToSize(`• ${achievement}`, contentWidth - 5);
              doc.text(achievementLines, leftMargin + 3, y);
              y += achievementLines.length * 5;
            });
          }
          
          // Espacio entre experiencias
          if (index < cvData.workExperience.length - 1) {
            y += 8;
          }
        });
        y += 12;
      }

      // EDUCACIÓN
      if (cvData.education.length > 0) {
        addSectionTitle('Formación Académica');

        cvData.education.forEach((edu, index) => {
          if (y > 250) {
            doc.addPage();
            y = 25;
          }

          // Institución y fechas
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(edu.institution, leftMargin, y);
          
          const eduDateRange = `${this.formatDate(edu.startDate)} - ${edu.current ? 'Presente' : this.formatDate(edu.endDate)}`;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          const eduDateWidth = doc.getTextWidth(eduDateRange);
          doc.text(eduDateRange, pageWidth - rightMargin - eduDateWidth, y);
          y += 7;

          // Título y campo de estudio
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 40);
          const degreeText = `${edu.degree}${edu.fieldOfStudy ? ` en ${edu.fieldOfStudy}` : ''}`;
          doc.text(degreeText, leftMargin, y);
          y += 6;

          // Espacio entre educaciones
          if (index < cvData.education.length - 1) {
            y += 6;
          }
        });
        y += 12;
      }

      // PROYECTOS
      if (cvData.projects && cvData.projects.length > 0) {
        addSectionTitle('Proyectos Destacados');

        cvData.projects.forEach((project, index) => {
          if (y > 230) {
            doc.addPage();
            y = 25;
          }

          // Nombre del proyecto
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(project.name, leftMargin, y);
          y += 7;

          // Descripción
          if (project.description) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(40, 40, 40);
            const descLines = doc.splitTextToSize(project.description, contentWidth);
            doc.text(descLines, leftMargin, y);
            y += descLines.length * 5 + 3;
          }

          // Tecnologías utilizadas
          if (project.technologies && project.technologies.length > 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(2, 139, 191);
            const techText = `Tecnologías: ${project.technologies.join(' • ')}`;
            const techLines = doc.splitTextToSize(techText, contentWidth);
            doc.text(techLines, leftMargin, y);
            y += techLines.length * 4 + 3;
          }

          // URL del proyecto si existe
          if (project.url) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(2, 139, 191);
            doc.text(`🔗 ${project.url}`, leftMargin, y);
            y += 5;
          }

          // Espacio entre proyectos
          if (index < cvData.projects.length - 1) {
            y += 8;
          }
        });
        y += 12;
      }

      // HABILIDADES, CERTIFICACIONES E INFORMACIÓN ADICIONAL
      if (cvData.skills.length > 0 || (cvData.certifications && cvData.certifications.length > 0) || (cvData.hobbies && cvData.hobbies.length > 0)) {
        addSectionTitle('Competencias y Certificaciones');

        const skillsByCategory = this.groupSkillsByCategory(cvData.skills);
        
        // Habilidades técnicas/software
        if (skillsByCategory['Software'] && skillsByCategory['Software'].length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('Habilidades Técnicas:', leftMargin, y);
          y += 6;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const softwareSkills = skillsByCategory['Software']
            .map(skill => `${skill.name} (${skill.level})`)
            .join(' • ');
          const softwareLines = doc.splitTextToSize(softwareSkills, contentWidth);
          doc.text(softwareLines, leftMargin + 5, y);
          y += softwareLines.length * 5 + 6;
        }

        // Habilidades de gestión
        if (skillsByCategory['Gestión de proyectos'] && skillsByCategory['Gestión de proyectos'].length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Gestión y Liderazgo:', leftMargin, y);
          y += 6;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const managementSkills = skillsByCategory['Gestión de proyectos']
            .map(skill => skill.name)
            .join(' • ');
          const managementLines = doc.splitTextToSize(managementSkills, contentWidth);
          doc.text(managementLines, leftMargin + 5, y);
          y += managementLines.length * 5 + 6;
        }

        // Idiomas
        const languageSkills = skillsByCategory['Idiomas'];
        if (languageSkills && languageSkills.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Idiomas:', leftMargin, y);
          y += 6;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const languagesText = languageSkills
            .map(lang => `${lang.name} (${lang.level})`)
            .join(' • ');
          const languageLines = doc.splitTextToSize(languagesText, contentWidth);
          doc.text(languageLines, leftMargin + 5, y);
          y += languageLines.length * 5 + 6;
        }

        // Certificaciones
        if (cvData.certifications && cvData.certifications.length > 0) {
          if (y > 240) {
            doc.addPage();
            y = 25;
          }
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Certificaciones:', leftMargin, y);
          y += 6;
          
          cvData.certifications.forEach((cert) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const certText = `• "${cert.name}"${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${this.formatDate(cert.date)})` : ''}`;
            const certLines = doc.splitTextToSize(certText, contentWidth);
            doc.text(certLines, leftMargin + 5, y);
            y += certLines.length * 5 + 2;
          });
          y += 6;
        }

        // Hobbies e intereses
        if (cvData.hobbies && cvData.hobbies.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Intereses:', leftMargin, y);
          y += 6;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const hobbiesText = cvData.hobbies.join(' • ');
          const hobbiesLines = doc.splitTextToSize(hobbiesText, contentWidth);
          doc.text(hobbiesLines, leftMargin + 5, y);
          y += hobbiesLines.length * 5 + 6;
        }

        // Otras categorías de habilidades
        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          if (category !== 'Software' && category !== 'Gestión de proyectos' && category !== 'Idiomas' && skills.length > 0) {
            if (y > 250) {
              doc.addPage();
              y = 25;
            }
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`${category}:`, leftMargin, y);
            y += 6;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const skillsText = skills.map(skill => `${skill.name} (${skill.level})`).join(' • ');
            const skillLines = doc.splitTextToSize(skillsText, contentWidth);
            doc.text(skillLines, leftMargin + 5, y);
            y += skillLines.length * 5 + 6;
          }
        });
      }

      // Generar el archivo PDF
      const fileName = `CV_${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
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
