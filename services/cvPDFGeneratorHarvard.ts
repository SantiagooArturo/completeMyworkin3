import { CVData } from '@/types/cv';

export class CVPDFGeneratorHarvard {
  static async generatePDF(cvData: CVData): Promise<void> {
    try {
      // Importar jsPDF dinámicamente para evitar problemas de SSR
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Configuración de fuentes
      doc.setFont('helvetica');

      // Header - Información Personal (Formato Harvard)
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const nameWidth = doc.getTextWidth(cvData.personalInfo.fullName);
      doc.text(cvData.personalInfo.fullName, (pageWidth - nameWidth) / 2, yPosition);
      yPosition += 8;

      // Información de contacto centrada
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contactInfo = [
        cvData.personalInfo.address,
        cvData.personalInfo.phone,
        cvData.personalInfo.email
      ].filter(Boolean).join(' • ');
      
      const contactWidth = doc.getTextWidth(contactInfo);
      doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPosition);
      yPosition += 5;

      // LinkedIn y Website si existen
      if (cvData.personalInfo.linkedIn || cvData.personalInfo.website) {
        const onlineInfo = [
          cvData.personalInfo.linkedIn,
          cvData.personalInfo.website
        ].filter(Boolean).join(' • ');
        
        const onlineWidth = doc.getTextWidth(onlineInfo);
        doc.text(onlineInfo, (pageWidth - onlineWidth) / 2, yPosition);
        yPosition += 5;
      }

      // Línea separadora
      yPosition += 5;
      doc.setDrawColor(100, 100, 100);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Función para agregar sección con título
      const addSection = (title: string) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), margin, yPosition);
        yPosition += 3;
        
        // Línea bajo el título
        doc.setDrawColor(100, 100, 100);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      };

      // Función para verificar espacio en página
      const checkPageSpace = (neededSpace: number) => {
        if (yPosition + neededSpace > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // Resumen Profesional
      if (cvData.personalInfo.summary) {
        checkPageSpace(30);
        addSection('Perfil Profesional');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(cvData.personalInfo.summary, contentWidth);
        doc.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 4 + 10;
      }

      // Educación
      if (cvData.education.length > 0) {
        checkPageSpace(40);
        addSection('Educación');
        
        cvData.education.forEach((edu) => {
          checkPageSpace(25);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const degreeText = `${edu.degree}${edu.fieldOfStudy ? ` en ${edu.fieldOfStudy}` : ''}`;
          doc.text(degreeText, margin, yPosition);
          
          // Fechas a la derecha
          const dateText = `${this.formatDate(edu.startDate)} - ${edu.current ? 'Presente' : this.formatDate(edu.endDate)}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.setFont('helvetica', 'normal');
          doc.text(dateText, pageWidth - margin - dateWidth, yPosition);
          yPosition += 5;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text(edu.institution, margin, yPosition);
          yPosition += 4;
          
          // GPA y honores
          if (edu.gpa) {
            doc.setFont('helvetica', 'normal');
            doc.text(`GPA: ${edu.gpa}`, margin, yPosition);
            yPosition += 4;
          }
          
          if (edu.honors) {
            doc.setFont('helvetica', 'normal');
            doc.text(edu.honors, margin, yPosition);
            yPosition += 4;
          }
          
          // Logros
          if (edu.achievements && edu.achievements.length > 0) {
            edu.achievements.forEach((achievement) => {
              const achievementLines = doc.splitTextToSize(`• ${achievement}`, contentWidth - 10);
              doc.text(achievementLines, margin + 5, yPosition);
              yPosition += achievementLines.length * 4;
            });
          }
          
          yPosition += 5;
        });
      }

      // Experiencia Laboral
      if (cvData.workExperience.length > 0) {
        checkPageSpace(40);
        addSection('Experiencia Profesional');
        
        cvData.workExperience.forEach((exp) => {
          checkPageSpace(30);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.position, margin, yPosition);
          
          // Fechas a la derecha
          const dateText = `${this.formatDate(exp.startDate)} - ${exp.current ? 'Presente' : this.formatDate(exp.endDate)}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.setFont('helvetica', 'normal');
          doc.text(dateText, pageWidth - margin - dateWidth, yPosition);
          yPosition += 5;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text(exp.company, margin, yPosition);
          yPosition += 4;
          
          // Descripción
          if (exp.description) {
            doc.setFont('helvetica', 'normal');
            const descLines = doc.splitTextToSize(exp.description, contentWidth);
            doc.text(descLines, margin, yPosition);
            yPosition += descLines.length * 4;
          }
          
          // Logros
          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach((achievement) => {
              const achievementLines = doc.splitTextToSize(`• ${achievement}`, contentWidth - 10);
              doc.text(achievementLines, margin + 5, yPosition);
              yPosition += achievementLines.length * 4;
            });
          }
          
          yPosition += 5;
        });
      }

      // Habilidades
      if (cvData.skills.length > 0) {
        checkPageSpace(30);
        addSection('Competencias y Habilidades');
          const skillsByCategory = {
          'tecnica': cvData.skills.filter(s => s.category === 'Técnica'),
          'blanda': cvData.skills.filter(s => s.category === 'Blanda'),
          'herramienta': cvData.skills.filter(s => s.category === 'Técnica'), // Herramientas también van en Técnica
          'idioma': cvData.skills.filter(s => s.category === 'Idioma')
        };
        
        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          if (skills.length > 0) {
            const categoryNames = {
              'tecnica': 'Técnicas',
              'blanda': 'Interpersonales',
              'herramienta': 'Herramientas',
              'idioma': 'Idiomas'
            };
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${categoryNames[category as keyof typeof categoryNames]}:`, margin, yPosition);
            yPosition += 4;
            
            doc.setFont('helvetica', 'normal');
            const skillNames = skills.map(s => s.name).join(', ');
            const skillLines = doc.splitTextToSize(skillNames, contentWidth - 10);
            doc.text(skillLines, margin + 5, yPosition);
            yPosition += skillLines.length * 4 + 3;
          }
        });
      }

      // Referencias
      if (cvData.references.length > 0) {
        checkPageSpace(40);
        addSection('Referencias');
        
        cvData.references.forEach((ref) => {
          checkPageSpace(20);
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(ref.name, margin, yPosition);
          yPosition += 4;
          
          doc.setFont('helvetica', 'normal');
          doc.text(ref.position, margin, yPosition);
          yPosition += 4;
          
          doc.text(ref.company, margin, yPosition);
          yPosition += 4;
          
          doc.text(`${ref.phone} • ${ref.email}`, margin, yPosition);
          yPosition += 8;
        });
      } else {
        checkPageSpace(20);
        addSection('Referencias');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const referencesText = 'Disponibles bajo solicitud';
        const refWidth = doc.getTextWidth(referencesText);
        doc.text(referencesText, (pageWidth - refWidth) / 2, yPosition);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
}
