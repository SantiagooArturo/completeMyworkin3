#!/usr/bin/env node

/**
 * Script de prueba para la funcionalidad de adaptación de CV
 * Simula el flujo completo desde la identificación del CV hasta la adaptación
 */

console.log('🧪 INICIANDO PRUEBA DE ADAPTACIÓN DE CV');
console.log('=====================================');

// Simulamos los datos que tendría un usuario típico
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com'
};

const mockJobContext = {
  jobTitle: 'Desarrollador Frontend React',
  company: 'TechCorp',
  location: 'Lima, Perú',
  requirements: 'React, JavaScript, TypeScript, CSS, HTML, Git',
  description: 'Buscamos un desarrollador frontend con experiencia en React...',
  industry: 'Tecnología',
  skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML']
};

// Simulamos que el usuario tiene un CV PDF subido
const mockUserData = {
  cvFileUrl: 'https://firebasestorage.googleapis.com/example-cv.pdf',
  onboarding: {
    cvFileUrl: 'https://firebasestorage.googleapis.com/example-cv.pdf',
    interestedRoles: ['Desarrollador Frontend', 'Desarrollador Full Stack'],
    educationType: 'universitario',
    currentCareer: 'Ingeniería de Sistemas',
    studyCenter: 'Universidad Nacional Mayor de San Marcos'
  }
};

// Simulamos datos extraídos del PDF
const mockExtractedData = {
  personalInfo: {
    phone: '+51 987 654 321',
    location: 'Lima, Perú',
    linkedin: 'https://linkedin.com/in/john-doe',
    portfolio: 'https://johndoe.dev'
  },
  professional: {
    position: 'Desarrollador Junior',
    bio: 'Desarrollador apasionado con conocimientos en tecnologías web modernas',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'CSS', 'HTML']
  },
  experience: [
    {
      position: 'Practicante de Desarrollo',
      company: 'StartupTech',
      startDate: '03/2024',
      endDate: 'Actualidad',
      description: 'Desarrollo de componentes React y APIs REST',
      isCurrent: true
    }
  ],
  education: [
    {
      degree: 'Ingeniería de Sistemas',
      institution: 'Universidad Nacional Mayor de San Marcos',
      startDate: '03/2020',
      endDate: '12/2024',
      isCurrent: false
    }
  ],
  languages: [
    { language: 'Español', level: 'Nativo' },
    { language: 'Inglés', level: 'Intermedio' }
  ],
  projects: [
    {
      name: 'E-commerce React',
      description: 'Aplicación de comercio electrónico desarrollada con React y Node.js',
      technologies: ['React', 'Node.js', 'MongoDB']
    }
  ]
};

// Simular el proceso de adaptación
function simulateAdaptationProcess() {
  console.log('\n1️⃣ PASO 1: Identificando CV del usuario...');
  console.log('✅ CV encontrado en:', mockUserData.cvFileUrl);
  
  console.log('\n2️⃣ PASO 2: Extrayendo datos del PDF...');
  console.log('✅ Datos extraídos exitosamente:');
  console.log('   📞 Teléfono:', mockExtractedData.personalInfo.phone);
  console.log('   📍 Ubicación:', mockExtractedData.personalInfo.location);
  console.log('   💼 Posición actual:', mockExtractedData.professional.position);
  console.log('   🛠️  Habilidades:', mockExtractedData.professional.skills.length, 'encontradas');
  console.log('   💼 Experiencia:', mockExtractedData.experience.length, 'trabajos');
  console.log('   🎓 Educación:', mockExtractedData.education.length, 'estudios');

  console.log('\n3️⃣ PASO 3: Adaptando CV para el puesto...');
  console.log('🎯 Puesto objetivo:', mockJobContext.jobTitle, 'en', mockJobContext.company);
  
  // Simular las adaptaciones que haría la IA
  const adaptations = [];
  
  // Adaptación del resumen profesional
  if (mockJobContext.jobTitle.toLowerCase().includes('react')) {
    adaptations.push({
      section: 'Resumen Profesional',
      change: 'Enfatizar experiencia en React y tecnologías frontend',
      before: mockExtractedData.professional.bio,
      after: 'Desarrollador Frontend especializado en React con experiencia en desarrollo de componentes reutilizables y APIs REST. Apasionado por crear interfaces de usuario modernas y responsive.'
    });
  }
  
  // Adaptación de habilidades
  const jobSkills = mockJobContext.skills;
  const userSkills = mockExtractedData.professional.skills;
  const matchingSkills = userSkills.filter(skill => 
    jobSkills.some(jobSkill => jobSkill.toLowerCase() === skill.toLowerCase())
  );
  
  adaptations.push({
    section: 'Habilidades',
    change: 'Reorganizar habilidades priorizando las requeridas por el puesto',
    before: userSkills,
    after: [...matchingSkills, ...userSkills.filter(s => !matchingSkills.includes(s))]
  });
  
  // Adaptación de la descripción de experiencia
  adaptations.push({
    section: 'Experiencia Laboral',
    change: 'Adaptar descripción para resaltar proyectos con React',
    before: mockExtractedData.experience[0].description,
    after: 'Desarrollo de componentes React reutilizables, implementación de hooks personalizados, y creación de APIs REST para aplicaciones web modernas. Colaboración en equipo ágil utilizando Git y metodologías Scrum.'
  });

  console.log('✅ Adaptaciones realizadas:');
  adaptations.forEach((adaptation, index) => {
    console.log(`   ${index + 1}. ${adaptation.section}: ${adaptation.change}`);
  });

  console.log('\n4️⃣ PASO 4: Guardando CV adaptado temporalmente...');
  const tempCVId = `temp_cv_${Date.now()}`;
  console.log('✅ CV adaptado guardado con ID:', tempCVId);

  console.log('\n5️⃣ PASO 5: Generando URL de redirección...');
  const params = new URLSearchParams({
    from: 'practica-detail',
    company: mockJobContext.company,
    position: mockJobContext.jobTitle,
    target: 'adapt-cv',
    adaptedCVId: tempCVId,
    adaptationId: `adaptation_${Date.now()}`,
    totalChanges: adaptations.length.toString()
  });
  
  const redirectUrl = `/crear-cv?${params.toString()}`;
  console.log('✅ URL de redirección generada:', redirectUrl);

  console.log('\n6️⃣ PASO 6: Simulando carga en CVBuilder...');
  console.log('✅ CVBuilder recibirá:');
  console.log('   🆔 CV ID:', tempCVId);
  console.log('   🏢 Empresa:', mockJobContext.company);
  console.log('   💼 Puesto:', mockJobContext.jobTitle);
  console.log('   📊 Total de cambios:', adaptations.length);
  console.log('   📋 Banner informativo: "CV adaptado para ' + mockJobContext.jobTitle + ' en ' + mockJobContext.company + '"');

  return {
    success: true,
    adaptedCVId: tempCVId,
    adaptations,
    redirectUrl
  };
}

// Ejecutar la simulación
try {
  const result = simulateAdaptationProcess();
  
  console.log('\n🎉 RESULTADO FINAL');
  console.log('==================');
  console.log('✅ Adaptación exitosa');
  console.log('📋 Total de adaptaciones:', result.adaptations.length);
  console.log('🔗 Usuario será redirigido a:', result.redirectUrl);
  console.log('\n💡 El usuario podrá:');
  console.log('   - Ver el CV prellenado con sus datos del PDF');
  console.log('   - Revisar las adaptaciones automáticas');
  console.log('   - Editar cualquier sección si lo desea');
  console.log('   - Descargar el CV adaptado final');
  
  console.log('\n✨ PRUEBA COMPLETADA EXITOSAMENTE ✨');

} catch (error) {
  console.error('❌ ERROR EN LA PRUEBA:', error.message);
  process.exit(1);
}
