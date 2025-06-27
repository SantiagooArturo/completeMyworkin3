import { CVData } from '@/types/cv';

export class CVPDFGeneratorSimple {
  static async generatePDF(cvData: CVData): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const leftMargin = 15;
      const rightMargin = 25; // Aumentar margen derecho
      const contentWidth = pageWidth - leftMargin - rightMargin;
      let y = 25;

      // Configurar fuente serif (Times) para coincidir con font-serif de CSS
      doc.setFont('times');

      // ENCABEZADO - Nombre centrado como en CVPreview
      doc.setFontSize(18); // Equivalente a text-2xl
      doc.setFont('times', 'bold');
      doc.setTextColor(0, 0, 0); // text-black
      const nameWidth = doc.getTextWidth(cvData.personalInfo.fullName);
      const nameX = (pageWidth - nameWidth) / 2; // Centrar el nombre
      doc.text(cvData.personalInfo.fullName, nameX, y);
      y += 7; // Espaciado reducido para CV de una página

      // Información de contacto en una línea con separadores "•"
      doc.setFontSize(11); // Unificado a 11pt
      doc.setFont('times', 'normal'); // font-medium
      doc.setTextColor(0, 0, 0); // negro puro
      const contactItems = [];
      if (cvData.personalInfo.email) contactItems.push(cvData.personalInfo.email);
      if (cvData.personalInfo.phone) contactItems.push(cvData.personalInfo.phone);
      if (cvData.personalInfo.address) contactItems.push(cvData.personalInfo.address);
      if (cvData.personalInfo.linkedIn) contactItems.push(cvData.personalInfo.linkedIn);
      if (cvData.personalInfo.website) contactItems.push(cvData.personalInfo.website);

      if (contactItems.length > 0) {
        // Calcular el ancho total de la línea de contacto (incluyendo separadores)
        let contactLine = contactItems.join(' • ');
        let contactLineWidth = doc.getTextWidth(contactLine);
        let contactX = (pageWidth - contactLineWidth) / 2;
        let contactY = y;
        for (let i = 0; i < contactItems.length; i++) {
          let item = contactItems[i];
          let isEmail = item === cvData.personalInfo.email;
          let isLinkedIn = item === cvData.personalInfo.linkedIn;
          let color: [number, number, number] = (isEmail || isLinkedIn) ? [37, 99, 235] : [0, 0, 0];
          let fontStyle = (isEmail || isLinkedIn) ? 'underline' : 'normal';
          let link = null;
          if (isEmail) link = `mailto:${item}`;
          if (isLinkedIn) link = item.startsWith('http') ? item : `https://${item}`;

          // Separador
          if (i > 0) {
            doc.setFont('times', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.text(' • ', contactX, contactY);
            contactX += doc.getTextWidth(' • ');
          }

          // Texto con color y subrayado
          doc.setFont('times', fontStyle);
          doc.setTextColor(...color);
          doc.setFontSize(11);
          doc.text(item, contactX, contactY);

          // Enlace
          if (link) {
            doc.link(contactX, contactY - 2, doc.getTextWidth(item), 5, { url: link });
          }
          contactX += doc.getTextWidth(item);
        }
        y += 6;

        // Línea separadora negra
        doc.setDrawColor(0, 0, 0); // negro puro
        doc.setLineWidth(0.5);
        doc.line(leftMargin, y, pageWidth - rightMargin, y);
        y += 7;
      }

      // Función para agregar títulos de sección centrados como en CVPreview
      const addSectionTitle = (title: string) => {
        if (y > 250) {
          doc.addPage();
          y = 25;
        }
        doc.setFontSize(11); // Unificado a 11pt
        doc.setFont('times', 'bold'); // font-semibold
        doc.setTextColor(0, 0, 0); // text-black
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2; // text-center
        doc.text(title, titleX, y);
        y += 7; // Espaciado reducido para CV de una página
      };

      // RESUMEN - Sin título, como en CVPreview
      if (cvData.personalInfo.summary) {
        doc.setFontSize(11); // Unificado a 11pt
        doc.setFont('times', 'normal');
        doc.setTextColor(0, 0, 0); // negro puro
        const summaryLines = doc.splitTextToSize(cvData.personalInfo.summary.replace(/\n+/g, ' '), contentWidth);
        doc.text(summaryLines, leftMargin + 2, y, { align: 'justify', maxWidth: contentWidth});
        y += summaryLines.length * 4.5 + 5; // más espacio después
      }

      // EXPERIENCIA LABORAL Y PROYECTOS - Sección combinada como en CVPreview
      if (cvData.workExperience.length > 0 || cvData.projects.length > 0) {
        addSectionTitle('Experiencia');
        
        // Experiencia Laboral
        if (cvData.workExperience.length > 0) {
          cvData.workExperience.forEach((exp, index) => {
            // Verificar espacio en página
            if (y > 250) {
              doc.addPage();
              y = 25;
            }

            // Empresa (font-bold)
            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(exp.company, leftMargin, y);
            y += 6; // MÁS ESPACIO después de empresa

            // Descripción de la empresa (italic, después del nombre)
            if (exp.description) {
              doc.setFontSize(11);
              doc.setFont('times', 'italic');
              doc.setTextColor(0, 0, 0);
              const descLines = doc.splitTextToSize(exp.description, contentWidth);
              doc.text(descLines, leftMargin, y);
              y += descLines.length * 4.5 + 2; // Espaciado mayor
            }

            // Puesto y fechas en la misma línea (flex justify-between)
            doc.setFontSize(11);
            doc.setFont('times', 'bold'); // font-semibold
            doc.setTextColor(0, 0, 0);
            doc.text(exp.position, leftMargin, y);
            
            // Fechas alineadas a la derecha (corregido para lógica igual que educación)
            doc.setFont('times', 'normal');
            const expDateRange = `${this.formatDate(exp.startDate)}${exp.current ? ' – Actualidad' : exp.endDate ? ` – ${this.formatDate(exp.endDate)}` : ''}`;
            const expDateWidth = doc.getTextWidth(expDateRange);
            doc.text(expDateRange, pageWidth - rightMargin - expDateWidth, y);
            y += 5.5; // MÁS ESPACIO después de puesto y fechas

            // Logros organizados como en CVPreview
            if (exp.sections && exp.sections.length > 0) {
              // Sub-secciones con títulos
              exp.sections.forEach(section => {
                if (section.title) {
                  doc.setFontSize(11);
                  doc.setFont('times', 'bold'); // font-semibold
                  doc.setTextColor(0, 0, 0);
                  // Título de subcategoría
                  doc.text(section.title, leftMargin, y); // Sin tabulación extra
                  y += 4.5; // MÁS ESPACIO después de subcategoría
                }
                if (section.achievements && section.achievements.length > 0) {
                  doc.setFontSize(11);
                  doc.setFont('times', 'normal');
                  doc.setTextColor(0, 0, 0);
                  section.achievements.forEach((achievement, idx) => {
                    const achievementLines = doc.splitTextToSize(`• ${achievement}`, contentWidth - 20);
                    // Logros de subcategoría
                    doc.text(achievementLines, leftMargin + 5, y); // Solo un pequeño espacio para la viñeta
                    y += achievementLines.length * 4.2; // Espaciado mayor entre logros
                    if (idx < section.achievements.length - 1) y += 2; // Espacio extra entre logros
                  });
                  y += 3; // Espacio extra después de la lista de logros
                }
              });
            } else if (exp.achievements && exp.achievements.length > 0) {
              // Logros directos
              doc.setFontSize(11);
              doc.setFont('times', 'normal');
              doc.setTextColor(0, 0, 0);
              exp.achievements.forEach((achievement, idx) => {
                const achievementLines = doc.splitTextToSize(`• ${achievement}`, contentWidth - 10);
                doc.text(achievementLines, leftMargin + 10, y);
                y += achievementLines.length * 4.2;
                if (idx < exp.achievements.length - 1) y += 2; // Espacio extra entre logros
              });
              y += 3; // Espacio extra después de la lista de logros
            }

            // Tecnologías como en CVPreview
            if (exp.technologies && exp.technologies.length > 0) {
              y += 2; // mt-2, reducido
              doc.setFontSize(11);
              doc.setFont('times', 'bold'); // font-medium
              doc.setTextColor(0, 0, 0);
              const techLabel = 'Tecnologías: ';
              doc.text(techLabel, leftMargin, y);
              
              doc.setFont('times', 'normal');
              const techText = exp.technologies.join(', ');
              const techLabelWidth = doc.getTextWidth(techLabel);
              const techLines = doc.splitTextToSize(techText, contentWidth - techLabelWidth);
              doc.text(techLines, leftMargin + techLabelWidth, y);
              y += techLines.length * 4.2 + 2; // MÁS ESPACIO después de tecnologías
            }

            // Espacio entre experiencias (space-y-4)
            if (index < cvData.workExperience.length - 1) {
              y += 4; // MÁS ESPACIO entre experiencias
            }
          });

          // Espacio después de experiencia laboral (mb-6)
          if (cvData.projects.length > 0) {
            y += 4; // Espaciado mayor
          }
        }

        // Proyectos Destacados
        if (cvData.projects.length > 0) {
          // Subtítulo para proyectos
          doc.setFontSize(11); // text-base, reducido
          doc.setFont('times', 'bold'); // font-semibold
          doc.setTextColor(0, 0, 0);
          doc.text('Proyectos Destacados', leftMargin, y);
          y += 6; // mb-3, espaciado reducido

          cvData.projects.forEach((project, index) => {
            if (y > 240) {
              doc.addPage();
              y = 25;
            }

            // Nombre del proyecto y fechas (flex justify-between)
            doc.setFontSize(11); // Reducido
            doc.setFont('times', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(project.name, leftMargin, y);
              // Fechas y URL alineadas a la derecha
            const projectDateRange = `${this.formatDate(project.startDate)}${project.current ? ' – En curso' : project.endDate ? ` – ${this.formatDate(project.endDate)}` : ''}`;
            const dateWidth = doc.getTextWidth(projectDateRange);
            doc.setFont('times', 'normal'); // font-medium
            doc.text(projectDateRange, pageWidth - rightMargin - dateWidth, y);
            y += 4; // Espaciado reducido
            
            // URL del proyecto si existe
            if (project.url) {
              doc.setFontSize(9);
              doc.setFont('times', 'normal');
              doc.setTextColor(37, 99, 235); // text-blue-600
              const urlWidth = doc.getTextWidth('Ver proyecto');
              doc.text('Ver proyecto', pageWidth - rightMargin - urlWidth, y);
              y += 3.5; // Espaciado reducido
            }

            // Descripción
            if (project.description) {
              doc.setFontSize(11);
              doc.setFont('times', 'normal');
              doc.setTextColor(0, 0, 0);
              const descLines = doc.splitTextToSize(project.description, contentWidth);
              doc.text(descLines, leftMargin, y);
              y += descLines.length * 3.5 + 2; // mb-2, espaciado reducido
            }

            // Highlights como lista
            if (project.highlights && project.highlights.length > 0) {
              doc.setFontSize(11);
              doc.setFont('times', 'normal');
              doc.setTextColor(0, 0, 0);
              project.highlights.forEach((highlight) => {
                const highlightLines = doc.splitTextToSize(`• ${highlight}`, contentWidth - 10);
                doc.text(highlightLines, leftMargin + 10, y);
                y += highlightLines.length * 3.5; // Espaciado reducido
              });
              y += 2; // mb-2, reducido
            }

            // Tecnologías del proyecto
            if (project.technologies && project.technologies.length > 0) {
              doc.setFontSize(11);
              doc.setFont('times', 'bold'); // font-medium
              doc.setTextColor(0, 0, 0);
              const techLabel = 'Tecnologías: ';
              doc.text(techLabel, leftMargin, y);
              
              doc.setFont('times', 'normal');
              const techText = project.technologies;
              const techLabelWidth = doc.getTextWidth(techLabel);
              const techLines = doc.splitTextToSize(techText, contentWidth - techLabelWidth);
              doc.text(techLines, leftMargin + techLabelWidth, y);
              y += techLines.length * 3.5; // Espaciado reducido
            }

            // Espacio entre proyectos (space-y-3)
            if (index < cvData.projects.length - 1) {
              y += 4; // Espaciado reducido
            }
          });
        }
        
        y += 0; // Espacio después de toda la sección de experiencia, reducido
      }

      // EDUCACIÓN - Exactamente como en CVPreview
      if (cvData.education.length > 0) {
        addSectionTitle('Educación');

        cvData.education.forEach((edu, index) => {
          if (y > 250) {
            doc.addPage();
            y = 25;
          }

          // Institución y campo de estudio en la misma línea (flex justify-between)
          doc.setFontSize(11); // Reducido
          doc.setFont('times', 'bold');
          doc.setTextColor(0, 0, 0);
          
          // Construir texto: institución — campo de estudio
          const institutionText = `${edu.institution}${edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}`;
          doc.text(institutionText, leftMargin, y);
          
          // Fechas alineadas a la derecha
          const eduDateRange = `${this.formatDate(edu.startDate)}${edu.current ? ' – Actualidad' : edu.endDate ? ` – ${this.formatDate(edu.endDate)}` : ''}`;
          doc.setFont('times', 'normal');
          doc.setTextColor(0, 0, 0);
          const eduDateWidth = doc.getTextWidth(eduDateRange);
          doc.text(eduDateRange, pageWidth - rightMargin - eduDateWidth, y);
          y += 5; // Espaciado reducido

          // Logros de educación si existen (mt-1 space-y-1)
          if (edu.achievements && edu.achievements.length > 0) {
            y += 1.5; // mt-1, reducido
            doc.setFontSize(11);
            doc.setFont('times', 'normal');
            doc.setTextColor(0, 0, 0);
            edu.achievements.forEach((achievement) => {
              const achievementLines = doc.splitTextToSize(`• ${achievement}`, contentWidth - 10);
              doc.text(achievementLines, leftMargin + 10, y); // list-disc list-inside
              y += achievementLines.length * 3.5; // space-y-1, reducido
            });
          }

          // Espacio entre educaciones (space-y-4)
          if (index < cvData.education.length - 1) {
            y += 6; // Espaciado reducido
          }
        });
        y += 8; // Espaciado reducido
      }

      // HABILIDADES Y CERTIFICACIONES - Exactamente como en CVPreview
      if (cvData.skills.length > 0 || (cvData.certifications && cvData.certifications.length > 0) || (cvData.hobbies && cvData.hobbies.length > 0)) {
        addSectionTitle('Habilidades & Certificaciones');

        const skillsOrganized = this.getSkillsForHarvardFormat(cvData.skills);
        
        // Software (space-y-2 entre párrafos)
        if (skillsOrganized.software.length > 0) {
          doc.setFontSize(11);
          doc.setFont('times', 'bold'); // font-semibold
          doc.setTextColor(0, 0, 0);
          const softwareLabel = 'Software: ';
          doc.text(softwareLabel, leftMargin, y);
          
          doc.setFont('times', 'normal');
          const softwareSkills = skillsOrganized.software
            .map(skill => `${skill.name}${skill.level !== 'Experto' ? ` (${skill.level})` : ''}`)
            .join(', ');
          const softwareLabelWidth = doc.getTextWidth(softwareLabel);
          const softwareLines = doc.splitTextToSize(softwareSkills, contentWidth - softwareLabelWidth);
          doc.text(softwareLines, leftMargin + softwareLabelWidth, y);
          y += Math.max(softwareLines.length * 3.8, 3.8) + 4; // leading-relaxed + space-y-2, reducido
        }

        // Gestión de proyectos
        if (skillsOrganized.projectManagement.length > 0) {
          doc.setFontSize(11);
          doc.setFont('times', 'bold');
          doc.setTextColor(0, 0, 0);
          const managementLabel = 'Gestión de Proyectos: ';
          doc.text(managementLabel, leftMargin, y);
          
          doc.setFont('times', 'normal');
          const managementSkills = skillsOrganized.projectManagement
            .map(skill => `${skill.name}${skill.level !== 'Experto' ? ` (${skill.level})` : ''}`)
            .join(', ');
          const managementLabelWidth = doc.getTextWidth(managementLabel);
          const managementLines = doc.splitTextToSize(managementSkills, contentWidth - managementLabelWidth);
          doc.text(managementLines, leftMargin + managementLabelWidth, y);
          y += Math.max(managementLines.length * 3.8, 3.8) + 4; // Espaciado reducido
        }

        // Certificaciones
        if (cvData.certifications && cvData.certifications.length > 0) {
          doc.setFontSize(11);
          doc.setFont('times', 'bold');
          doc.setTextColor(0, 0, 0);
          const certLabel = 'Certificaciones: ';
          doc.text(certLabel, leftMargin, y);
          
          doc.setFont('times', 'normal');
          const certificationsText = cvData.certifications.map(cert => {
            let certText = cert.name;
            if (cert.issuer) certText += ` - ${cert.issuer}`;
            if (cert.date) certText += ` (${this.formatDate(cert.date)})`;
            return certText;
          }).join(', ');
          const certLabelWidth = doc.getTextWidth(certLabel);
          const certLines = doc.splitTextToSize(certificationsText, contentWidth - certLabelWidth);
          doc.text(certLines, leftMargin + certLabelWidth, y);
          y += Math.max(certLines.length * 3.8, 3.8) + 4; // Espaciado reducido
        }

        // Idiomas
        const hasLanguageSkills = skillsOrganized.languages.length > 0;
        const hasLanguagesData = cvData.languages && cvData.languages.length > 0;
        
        if (hasLanguageSkills || hasLanguagesData) {
          doc.setFontSize(11);
          doc.setFont('times', 'bold');
          doc.setTextColor(0, 0, 0);
          const langLabel = 'Idiomas: ';
          doc.text(langLabel, leftMargin, y);
          
          doc.setFont('times', 'normal');
          const allLanguages = [
            ...(cvData.languages?.map(lang => `${lang.language} (${lang.proficiency})`) || []),
            ...skillsOrganized.languages.map(skill => `${skill.name}${skill.level !== 'Experto' ? ` (${skill.level})` : ''}`)
          ];
          const languagesText = allLanguages.join(', ');
          const langLabelWidth = doc.getTextWidth(langLabel);
          const langLines = doc.splitTextToSize(languagesText, contentWidth - langLabelWidth);
          doc.text(langLines, leftMargin + langLabelWidth, y);
          y += Math.max(langLines.length * 3.8, 3.8) + 4; // Espaciado reducido
        }

        // Hobbies
        if (cvData.hobbies && cvData.hobbies.length > 0) {
          doc.setFontSize(11);
          doc.setFont('times', 'bold');
          doc.setTextColor(0, 0, 0);
          const hobbiesLabel = 'Hobbies: ';
          doc.text(hobbiesLabel, leftMargin, y);
          
          doc.setFont('times', 'normal');
          const hobbiesText = cvData.hobbies.join(', ');
          const hobbiesLabelWidth = doc.getTextWidth(hobbiesLabel);
          const hobbiesLines = doc.splitTextToSize(hobbiesText, contentWidth - hobbiesLabelWidth);
          doc.text(hobbiesLines, leftMargin + hobbiesLabelWidth, y);
          y += Math.max(hobbiesLines.length * 3.8, 3.8) + 4; // Espaciado reducido
        }

        // Otras competencias
        if (skillsOrganized.other.length > 0) {
          doc.setFontSize(11);
          doc.setFont('times', 'bold');
          doc.setTextColor(0, 0, 0);
          const otherLabel = 'Otras Competencias: ';
          doc.text(otherLabel, leftMargin, y);
          
          doc.setFont('times', 'normal');
          const otherSkills = skillsOrganized.other
            .map(skill => `${skill.name}${skill.level !== 'Experto' ? ` (${skill.level})` : ''}`)
            .join(', ');
          const otherLabelWidth = doc.getTextWidth(otherLabel);
          const otherLines = doc.splitTextToSize(otherSkills, contentWidth - otherLabelWidth);
          doc.text(otherLines, leftMargin + otherLabelWidth, y);
          y += Math.max(otherLines.length * 3.8, 3.8); // Espaciado reducido
        }
      }

      // Generar el archivo PDF
      const fileName = `CV_${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      // doc.save(fileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar el PDF');
    }
  }

  // Función auxiliar para organizar habilidades como en CVPreview
  private static getSkillsForHarvardFormat(skills: any[]) {
    const softwareSkills = skills.filter((skill: any) => 
      skill.category === 'Technical'
    );
    const projectManagementSkills = skills.filter((skill: any) => 
      skill.category === 'Leadership' || skill.category === 'Analytical'
    );
    const languageSkills = skills.filter((skill: any) => 
      skill.category === 'Language'
    );
    const otherSkills = skills.filter((skill: any) => 
      skill.category === 'Research' || skill.category === 'Communication'
    );

    return {
      software: softwareSkills,
      projectManagement: projectManagementSkills,
      languages: languageSkills,
      other: otherSkills
    };
  }  // Función auxiliar para formatear fechas
  private static formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      // Si el formato es YYYY-MM o YYYY-MM-DD, mostrar solo mes/año
      if (/^\d{4}-\d{2}/.test(dateString)) {
        const [year, month] = dateString.split('-');
        return `${month}/${year}`;
      }
      // Si el formato es solo YYYY
      if (/^\d{4}$/.test(dateString)) {
        return dateString;
      }
      return dateString;
    } catch {
      return dateString;
    }
  }
}
