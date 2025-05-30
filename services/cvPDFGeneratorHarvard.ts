import { CVData } from '@/types/cv';

export class CVPDFGeneratorHarvard {
  static async generatePDF(cvData: CVData): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      
      // Crear documento PDF
      const doc = new jsPDF();
      
      // Cargar fuentes Garamond
      await doc.addFont('EBGaramond-Regular.ttf', 'Garamond', 'normal');
      await doc.addFont('EBGaramond-Bold.ttf', 'Garamond', 'bold');
      await doc.addFont('EBGaramond-Italic.ttf', 'Garamond', 'italic');
      
      // Configuración de tamaños de fuente
      const fontSize = {
        name: 20,    // text-cv-2xl
        heading: 14, // text-cv-lg
        normal: 11,  // text-cv-base
        small: 10    // texto pequeño
      };

      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Header - Información Personal
      doc.setFont('Garamond', 'bold');
      doc.setFontSize(fontSize.name);
      const nameWidth = doc.getTextWidth(cvData.personalInfo.fullName);
      doc.text(cvData.personalInfo.fullName, (pageWidth - nameWidth) / 2, yPosition);
      yPosition += 10;

      // Información de contacto
      doc.setFontSize(fontSize.normal);
      doc.setFont('Garamond', 'normal');
      const contactInfo = [
        cvData.personalInfo.address,
        cvData.personalInfo.phone,
        cvData.personalInfo.email
      ].filter(Boolean).join(' • ');
      
      const contactWidth = doc.getTextWidth(contactInfo);
      doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPosition);
      yPosition += 6;

      // LinkedIn y Website si existen
      if (cvData.personalInfo.linkedIn || cvData.personalInfo.website) {
        const onlineInfo = [
          cvData.personalInfo.linkedIn,
          cvData.personalInfo.website
        ].filter(Boolean).join(' • ');
        
        const onlineWidth = doc.getTextWidth(onlineInfo);
        doc.text(onlineInfo, (pageWidth - onlineWidth) / 2, yPosition);
        yPosition += 6;
      }

      // Línea separadora más fina y elegante
      yPosition += 4;
      doc.setDrawColor(70, 70, 70);
      doc.setLineWidth(0.2);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Función para agregar sección con título
      const addSection = (title: string) => {
        doc.setFontSize(fontSize.heading);
        doc.setFont('Garamond', 'bold');
        doc.text(title.toUpperCase(), margin, yPosition);
        yPosition += 4;
        
        // Línea bajo el título más fina
        doc.setDrawColor(70, 70, 70);
        doc.setLineWidth(0.2);
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
        
        doc.setFontSize(fontSize.small);
        doc.setFont('Garamond', 'normal');
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
          
          doc.setFontSize(fontSize.normal);
          doc.setFont('Garamond', 'bold');
          const degreeText = `${edu.degree}${edu.fieldOfStudy ? ` en ${edu.fieldOfStudy}` : ''}`;
          doc.text(degreeText, margin, yPosition);
          
          // Fechas a la derecha
          const dateText = `${this.formatDate(edu.startDate)} - ${edu.current ? 'Presente' : this.formatDate(edu.endDate)}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.setFont('Garamond', 'normal');
          doc.text(dateText, pageWidth - margin - dateWidth, yPosition);
          yPosition += 5;
          
          doc.setFontSize(fontSize.small);
          doc.setFont('Garamond', 'italic');
          doc.text(edu.institution, margin, yPosition);
          yPosition += 4;
          
          // GPA y honores
          if (edu.gpa) {
            doc.setFont('Garamond', 'normal');
            doc.text(`GPA: ${edu.gpa}`, margin, yPosition);
            yPosition += 4;
          }
          
          if (edu.honors) {
            doc.setFont('Garamond', 'normal');
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
          
          doc.setFontSize(fontSize.normal);
          doc.setFont('Garamond', 'bold');
          doc.text(exp.position, margin, yPosition);
          
          // Fechas a la derecha
          const dateText = `${this.formatDate(exp.startDate)} - ${exp.current ? 'Presente' : this.formatDate(exp.endDate)}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.setFont('Garamond', 'normal');
          doc.text(dateText, pageWidth - margin - dateWidth, yPosition);
          yPosition += 5;
          
          doc.setFontSize(fontSize.small);
          doc.setFont('Garamond', 'italic');
          doc.text(exp.company, margin, yPosition);
          yPosition += 4;
          
          // Descripción
          if (exp.description) {
            doc.setFont('Garamond', 'normal');
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
          'tecnica': cvData.skills.filter(s => s.category === 'Technical'),
          'blanda': cvData.skills.filter(s => s.category === 'Analytical' || s.category === 'Leadership' || s.category === 'Communication'),
        };
        
        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          if (skills.length > 0) {
            const categoryNames = {
              'tecnica': 'Técnicas',
              'blanda': 'Interpersonales',
              'herramienta': 'Herramientas',
              'idioma': 'Idiomas'
            };
            
            doc.setFontSize(fontSize.small);
            doc.setFont('Garamond', 'bold');
            doc.text(`${categoryNames[category as keyof typeof categoryNames]}:`, margin, yPosition);
            yPosition += 4;
            
            doc.setFont('Garamond', 'normal');
            const skillNames = skills.map(s => s.name).join(', ');
            const skillLines = doc.splitTextToSize(skillNames, contentWidth - 10);
            doc.text(skillLines, margin + 5, yPosition);
            yPosition += skillLines.length * 4 + 3;
          }
        });
      }

      // Referencias con estilo refinado
      if (cvData.references.length > 0) {
        checkPageSpace(40);
        addSection('Referencias');
        
        cvData.references.forEach((ref) => {
          checkPageSpace(25);
          doc.setFontSize(fontSize.normal);
          doc.setFont('Garamond', 'bold');
          doc.text(ref.name, margin, yPosition);
          
          doc.setFont('Garamond', 'italic');
          doc.text(`${ref.position}, ${ref.company}`, margin, yPosition + 5);
          
          doc.setFont('Garamond', 'normal');
          doc.text(ref.email, margin, yPosition + 10);
          doc.text(ref.phone, margin, yPosition + 15);
          
          yPosition += 20;
        });
      } else {
        checkPageSpace(20);
        addSection('Referencias');
        doc.setFontSize(11);
        doc.setFont('Garamond', 'italic');
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
