import { CVData } from '@/types/cv';

export class CVPDFGeneratorHarvardImproved {
  static async generatePDF(cvData: CVData): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      
      // Crear documento PDF con configuración exacta
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      
      // Configuración exacta de márgenes (Harvard estándar)
      const margins = {
        top: 25.4,    // 1 inch
        bottom: 25.4, // 1 inch  
        left: 25.4,   // 1 inch
        right: 25.4   // 1 inch
      };
      
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const contentWidth = pageWidth - margins.left - margins.right;
      
      // Configuración de fuentes y tamaños (Harvard estándar)
      const fonts = {
        family: 'times',
        sizes: {
          name: 16,      // Nombre principal
          sectionTitle: 12, // Títulos de sección
          jobTitle: 11,  // Títulos de trabajo/grado
          body: 10,      // Texto general
          small: 9       // Fechas y detalles
        }
      };
      
      let currentY = margins.top;
      
      // Función para verificar espacio y cambiar página si es necesario
      const checkPageBreak = (neededSpace: number): boolean => {
        if (currentY + neededSpace > pageHeight - margins.bottom) {
          doc.addPage();
          currentY = margins.top;
          return true;
        }
        return false;
      };
      
      // Función para centrar texto
      const centerText = (text: string, y: number, fontSize: number, fontStyle: string = 'normal') => {
        doc.setFont(fonts.family, fontStyle);
        doc.setFontSize(fontSize);
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
      };
      
      // ENCABEZADO - Información Personal (Centrado)
      doc.setFont(fonts.family, 'bold');
      doc.setFontSize(fonts.sizes.name);
      centerText(cvData.personalInfo.fullName.toUpperCase(), currentY, fonts.sizes.name, 'bold');
      currentY += 8;
      
      // Información de contacto (línea 1)
      const contactLine1 = [
        cvData.personalInfo.address,
        cvData.personalInfo.phone
      ].filter(Boolean).join(' • ');
      
      if (contactLine1) {
        centerText(contactLine1, currentY, fonts.sizes.small);
        currentY += 5;
      }
      
      // Email (línea 2)
      if (cvData.personalInfo.email) {
        centerText(cvData.personalInfo.email, currentY, fonts.sizes.small);
        currentY += 5;
      }
      
      // LinkedIn y website (línea 3)
      const contactLine3 = [
        cvData.personalInfo.linkedIn,
        cvData.personalInfo.website
      ].filter(Boolean).join(' • ');
      
      if (contactLine3) {
        centerText(contactLine3, currentY, fonts.sizes.small);
        currentY += 5;
      }
      
      // Línea horizontal bajo el encabezado
      currentY += 3;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
      currentY += 8;
      
      // Función para agregar títulos de sección
      const addSectionTitle = (title: string) => {
        checkPageBreak(15);
        doc.setFont(fonts.family, 'bold');
        doc.setFontSize(fonts.sizes.sectionTitle);
        doc.text(title.toUpperCase(), margins.left, currentY);
        currentY += 3;
        
        // Línea bajo el título
        doc.setLineWidth(0.3);
        doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
        currentY += 6;
      };
      
      // RESUMEN PROFESIONAL / OBJECTIVE
      if (cvData.personalInfo.summary) {
        addSectionTitle('OBJECTIVE');
        
        doc.setFont(fonts.family, 'normal');
        doc.setFontSize(fonts.sizes.body);
        const summaryLines = doc.splitTextToSize(cvData.personalInfo.summary, contentWidth);
        
        checkPageBreak(summaryLines.length * 4);
        doc.text(summaryLines, margins.left, currentY);
        currentY += summaryLines.length * 4 + 6;
      }
        // EXPERIENCIA PROFESIONAL
      if (cvData.workExperience.length > 0) {
        addSectionTitle('EXPERIENCE');
        
        cvData.workExperience.forEach((exp, index) => {
          checkPageBreak(25);
          
          // Cargo y fechas
          doc.setFont(fonts.family, 'bold');
          doc.setFontSize(fonts.sizes.jobTitle);
          doc.text(exp.position, margins.left, currentY);
          
          const dateText = `${this.formatDate(exp.startDate)}${exp.current ? ' - Present' : ` - ${this.formatDate(exp.endDate)}`}`;
          doc.setFont(fonts.family, 'normal');
          doc.setFontSize(fonts.sizes.small);
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margins.right - dateWidth, currentY);
          currentY += 5;
          
          // Empresa y ubicación
          doc.setFont(fonts.family, 'italic');
          doc.setFontSize(fonts.sizes.body);
          const companyLocation = exp.location ? `${exp.company}, ${exp.location}` : exp.company;
          doc.text(companyLocation, margins.left, currentY);
          currentY += 5;
          
          // Descripción
          if (exp.description) {
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.sizes.body);
            const descLines = doc.splitTextToSize(exp.description, contentWidth);
            checkPageBreak(descLines.length * 3);
            doc.text(descLines, margins.left, currentY);
            currentY += descLines.length * 3 + 2;
          }
          
          // Logros con bullets
          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach((achievement) => {
              const bulletText = `• ${achievement}`;
              const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
              checkPageBreak(lines.length * 3);
              doc.text(lines, margins.left + 3, currentY);
              currentY += lines.length * 3 + 1;
            });
          }
          
          if (index < cvData.workExperience.length - 1) {
            currentY += 4;
          }
        });
        currentY += 6;
      }
      
      // EDUCACIÓN
      if (cvData.education.length > 0) {
        addSectionTitle('EDUCATION');
        
        cvData.education.forEach((edu, index) => {
          checkPageBreak(20);
          
          // Título del grado y fechas en la misma línea
          doc.setFont(fonts.family, 'bold');
          doc.setFontSize(fonts.sizes.jobTitle);
          
          const degreeText = `${edu.degree}${edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}`;
          doc.text(degreeText, margins.left, currentY);
          
          // Fechas alineadas a la derecha
          const dateText = `${this.formatDate(edu.startDate)}${edu.current ? ' - Present' : ` - ${this.formatDate(edu.endDate)}`}`;
          doc.setFont(fonts.family, 'normal');
          doc.setFontSize(fonts.sizes.small);
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margins.right - dateWidth, currentY);
          currentY += 5;
          
          // Institución
          doc.setFont(fonts.family, 'italic');
          doc.setFontSize(fonts.sizes.body);
          doc.text(edu.institution, margins.left, currentY);
          currentY += 4;
          
          // GPA y honores en líneas separadas
          if (edu.gpa) {
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.sizes.small);
            doc.text(`GPA: ${edu.gpa}`, margins.left, currentY);
            currentY += 4;
          }
          
          if (edu.honors) {
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.sizes.small);
            doc.text(edu.honors, margins.left, currentY);
            currentY += 4;
          }
          
          // Logros con bullets
          if (edu.achievements && edu.achievements.length > 0) {
            edu.achievements.forEach((achievement) => {
              const bulletText = `• ${achievement}`;
              const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
              checkPageBreak(lines.length * 3);
              doc.text(lines, margins.left + 3, currentY);
              currentY += lines.length * 3 + 1;
            });
          }
          
          if (index < cvData.education.length - 1) {
            currentY += 4; // Espacio entre entradas
          }
        });
        currentY += 6;
      }
      
      // PROYECTOS
      if (cvData.projects && cvData.projects.length > 0) {
        addSectionTitle('PROJECTS');
        
        cvData.projects.forEach((project, index) => {
          checkPageBreak(20);
          
          // Nombre del proyecto y fechas
          doc.setFont(fonts.family, 'bold');
          doc.setFontSize(fonts.sizes.jobTitle);
          doc.text(project.name, margins.left, currentY);
          
          const dateText = `${this.formatDate(project.startDate)}${project.current ? ' - Present' : ` - ${this.formatDate(project.endDate)}`}`;
          doc.setFont(fonts.family, 'normal');
          doc.setFontSize(fonts.sizes.small);
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margins.right - dateWidth, currentY);
          currentY += 5;
          
          // Descripción
          if (project.description) {
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.sizes.body);
            const descLines = doc.splitTextToSize(project.description, contentWidth);
            checkPageBreak(descLines.length * 3);
            doc.text(descLines, margins.left, currentY);
            currentY += descLines.length * 3 + 2;
          }
          
          // URL
          if (project.url) {
            doc.setFont(fonts.family, 'italic');
            doc.setFontSize(fonts.sizes.small);
            doc.text(`URL: ${project.url}`, margins.left, currentY);
            currentY += 4;
          }
          
          // Highlights
          if (project.highlights && project.highlights.length > 0) {
            project.highlights.forEach((highlight) => {
              const bulletText = `• ${highlight}`;
              const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
              checkPageBreak(lines.length * 3);
              doc.text(lines, margins.left + 3, currentY);
              currentY += lines.length * 3 + 1;
            });
          }
          
          // Tecnologías
          if (project.technologies && project.technologies.length > 0) {
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.sizes.small);
            const techText = `Technologies: ${project.technologies.join(', ')}`;
            const techLines = doc.splitTextToSize(techText, contentWidth);
            checkPageBreak(techLines.length * 3);
            doc.text(techLines, margins.left, currentY);
            currentY += techLines.length * 3 + 2;
          }
          
          if (index < cvData.projects.length - 1) {
            currentY += 4;
          }
        });
        currentY += 6;
      }
      
      // HABILIDADES
      if (cvData.skills.length > 0) {
        addSectionTitle('SKILLS');
        
        // Agrupar habilidades por categoría
        const skillGroups = this.groupSkillsByCategory(cvData.skills);
        
        Object.entries(skillGroups).forEach(([category, skills]) => {
          if (skills.length > 0) {
            checkPageBreak(8);
            
            doc.setFont(fonts.family, 'bold');
            doc.setFontSize(fonts.sizes.body);
            doc.text(`${category}:`, margins.left, currentY);
            currentY += 4;
            
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.sizes.body);
            const skillsText = skills.map(s => s.name).join(', ');
            const skillLines = doc.splitTextToSize(skillsText, contentWidth - 10);
            doc.text(skillLines, margins.left + 5, currentY);
            currentY += skillLines.length * 3 + 3;
          }
        });
        currentY += 3;
      }
      
      // CERTIFICACIONES
      if (cvData.certifications && cvData.certifications.length > 0) {
        addSectionTitle('CERTIFICATIONS');
        
        cvData.certifications.forEach((cert, index) => {
          checkPageBreak(12);
          
          doc.setFont(fonts.family, 'bold');
          doc.setFontSize(fonts.sizes.jobTitle);
          doc.text(cert.name, margins.left, currentY);
          
          const dateText = this.formatDate(cert.date);
          doc.setFont(fonts.family, 'normal');
          doc.setFontSize(fonts.sizes.small);
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margins.right - dateWidth, currentY);
          currentY += 5;
          
          doc.setFont(fonts.family, 'italic');
          doc.setFontSize(fonts.sizes.body);
          doc.text(cert.issuer, margins.left, currentY);
          currentY += 4;
          
          if (cert.credentialId) {
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.sizes.small);
            doc.text(`Credential ID: ${cert.credentialId}`, margins.left, currentY);
            currentY += 4;
          }
          
          if (index < cvData.certifications.length - 1) {
            currentY += 3;
          }
        });
        currentY += 6;
      }
      
      // INTERESES (si existen)
      if (cvData.hobbies && cvData.hobbies.length > 0) {
        addSectionTitle('INTERESTS');
        
        doc.setFont(fonts.family, 'normal');
        doc.setFontSize(fonts.sizes.body);
        const hobbiesText = cvData.hobbies.join(', ');
        const hobbiesLines = doc.splitTextToSize(hobbiesText, contentWidth);
        checkPageBreak(hobbiesLines.length * 3);
        doc.text(hobbiesLines, margins.left, currentY);
        currentY += hobbiesLines.length * 3 + 6;
      }
      
      // Guardar el PDF
      const fileName = `CV_${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_Harvard.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar el PDF');
    }
  }

  private static formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // Manejar formato YYYY-MM
      if (dateString.includes('-') && dateString.length === 7) {
        const [year, month] = dateString.split('-');
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }
      
      // Para otros formatos
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  }
  
  private static groupSkillsByCategory(skills: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {
      'Technical': [],
      'Leadership': [],
      'Communication': [],
      'Research': []
    };
    
    skills.forEach(skill => {
      const category = skill.category || 'Technical';
      if (groups[category]) {
        groups[category].push(skill);
      } else {
        groups['Technical'].push(skill);
      }
    });
    
    // Filtrar categorías vacías
    return Object.fromEntries(
      Object.entries(groups).filter(([_, skills]) => skills.length > 0)
    );
  }
}
