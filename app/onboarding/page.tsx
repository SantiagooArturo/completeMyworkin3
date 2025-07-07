'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { X } from 'lucide-react';
import Link from 'next/link';
import { OnboardingData } from '@/services/onboardingService';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUp, FilePlus } from 'lucide-react';

// Opciones para los selects y botones
const CAREER_OPTIONS = [
  { value: 'ingenieria-sistemas', label: 'Ingeniería de Sistemas' },
  { value: 'ingenieria-software', label: 'Ingeniería de Software' },
  { value: 'ciencias-computacion', label: 'Ciencias de la Computación' },
  { value: 'ingenieria-informatica', label: 'Ingeniería Informática' },
  { value: 'desarrollo-software', label: 'Desarrollo de Software' },
  { value: 'administracion', label: 'Administración' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'diseño-grafico', label: 'Diseño Gráfico' },
  { value: 'comunicaciones', label: 'Comunicaciones' },
  { value: 'otra', label: 'Otra' },
];

const STUDY_CENTER_OPTIONS = [
  { value: 'upc', label: 'Universidad Peruana de Ciencias Aplicadas (UPC)' },
  { value: 'usil', label: 'Universidad San Ignacio de Loyola (USIL)' },
  { value: 'ulima', label: 'Universidad de Lima' },
  { value: 'unmsm', label: 'Universidad Nacional Mayor de San Marcos' },
  { value: 'pucp', label: 'Pontificia Universidad Católica del Perú' },
  { value: 'uni', label: 'Universidad Nacional de Ingeniería' },
  { value: 'tecsup', label: 'Tecsup' },
  { value: 'senati', label: 'SENATI' },
  { value: 'cibertec', label: 'Cibertec' },
  { value: 'otra', label: 'Otra' },
];

const CYCLE_OPTIONS = [
  { value: '1', label: '1er Ciclo' },
  { value: '2', label: '2do Ciclo' },
  { value: '3', label: '3er Ciclo' },
  { value: '4', label: '4to Ciclo' },
  { value: '5', label: '5to Ciclo' },
  { value: '6', label: '6to Ciclo' },
  { value: '7', label: '7mo Ciclo' },
  { value: '8', label: '8vo Ciclo' },
  { value: '9', label: '9no Ciclo' },
  { value: '10', label: '10mo Ciclo' },
];

const ROLE_OPTIONS = [
  'Desarrollador Frontend',
  'Desarrollador Backend',
  'Desarrollador Full Stack',
  'Desarrollador Mobile',
  'Data Scientist',
  'Data Analyst',
  'QA/Testing',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Project Manager',
  'Marketing Digital',
  'Ventas/Sales',
  'Business Analyst',
  'Cybersecurity',
  'Cloud Engineer',
];

// Opciones para tipo de trabajo
const WORK_TYPE_OPTIONS = [
  { value: 'Tiempo completo', label: 'Tiempo completo' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Prácticas', label: 'Prácticas' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Remoto', label: 'Remoto' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [submitting, setSubmitting] = useState(false);

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<OnboardingData>({
    position: '',
    experience: '',
    skills: [],
    industry: '',
    university: '',
    degree: '',
    graduationYear: '',
    objectives: [],
    notifications: {
      email: true,
      jobAlerts: true,
      tips: false,
    },
    // Nuevos campos para el onboarding actualizado
    educationType: '', // 'universitario' o 'tecnico'
    currentCareer: '',
    studyCenter: '',
    studyStatus: '', // 'estudiando' o 'egresado'
    currentCycle: '',
    interestedRoles: [],
    workType: [], // Cambiado a string[] para selección múltiple
    hasCV: '',
  });

  const [areasOpen, setAreasOpen] = useState(false);
  const [workTypeOpen, setWorkTypeOpen] = useState(false);

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-select="areas"]')) {
        setAreasOpen(false);
      }
      if (!target.closest('[data-select="workType"]')) {
        setWorkTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Paso final: guardar datos y completar onboarding
      await saveOnboardingData();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveOnboardingData = async () => {
    if (!user) return;
    
    setSubmitting(true);
    try {
      // Obtener datos existentes del usuario
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const existingData = userDoc.data() || {};

      // Actualizar documento del usuario con los datos del onboarding
      await updateDoc(userDocRef, {
        ...existingData,
        onboarding: {
          completed: true,
          completedAt: new Date(),
          ...formData,
        },
        // Actualizar campos principales si están disponibles
        ...(formData.university && { university: formData.university }),
        ...(formData.position && { position: formData.position }),
        ...(formData.skills.length > 0 && { skills: formData.skills }),
        updatedAt: new Date(),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error guardando datos de onboarding:', error);
      // Continuar al dashboard aunque haya error
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      interestedRoles: prev.interestedRoles.includes(role)
        ? prev.interestedRoles.filter(r => r !== role)
        : [...prev.interestedRoles, role],
    }));
  };

  const toggleObjective = (objective: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.includes(objective)
        ? prev.objectives.filter(o => o !== objective)
        : [...prev.objectives, objective],
    }));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "¿Qué estás estudiando actualmente?";
      case 2:
        return "¿Qué roles te interesan?";
      case 3:
        return "Así está el mercado para el rol que elegiste";
      case 4:
        return "¿Ya cuentas con un CV?";
      default:
        return "Configuración inicial";
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / totalSteps) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-left mb-6">
              <p className="text-gray-600">
                Busca tu carrera en la lista. Esto nos ayudará a recomendarte prácticas alineadas a tu perfil.
              </p>
            </div>

            <div className="space-y-4">
              {/* Tipo de educación con RadioGroup */}
              <RadioGroup
                value={formData.educationType}
                onValueChange={value => updateFormData('educationType', value)}
                className="flex gap-8 items-center mx-2"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="universitario" className="text-[#038bbf] border-[#038bbf] focus:ring-[#038bbf]" />
                  <span className="text-base text-gray-800">Universitario</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="tecnico" className="text-[#038bbf] border-[#038bbf] focus:ring-[#038bbf]" />
                  <span className="text-base text-gray-800">Técnico</span>
                </label>
              </RadioGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-2">
                    Carrera actual <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.currentCareer}
                    onValueChange={value => updateFormData('currentCareer', value)}
                  >
                    <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg hover:border-[#028bbf] focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                      <SelectValue placeholder="Selecciona tu carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAREER_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">
                    Centro de estudios
                  </label>
                  <Select
                    value={formData.studyCenter}
                    onValueChange={value => updateFormData('studyCenter', value)}
                  >
                    <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg hover:border-[#028bbf] focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                      <SelectValue placeholder="Selecciona tu centro de estudios" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_CENTER_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sigo estudiando / Egresado con RadioGroup */}
              <div>
                <label className="block text-gray-700 mb-4">
                  ¿En qué momento de tu formación te encuentras? <span className="text-red-500">*</span>
                </label>
                <RadioGroup
                  value={formData.studyStatus}
                  onValueChange={value => updateFormData('studyStatus', value)}
                  className="flex gap-8 items-center mx-2"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="estudiando" className="text-[#038bbf] border-[#038bbf] focus:ring-[#038bbf]" />
                    <span className="text-base text-gray-800">Sigo estudiando</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="egresado" className="text-[#038bbf] border-[#038bbf] focus:ring-[#038bbf]" />
                    <span className="text-base text-gray-800">Egresado</span>
                  </label>
                </RadioGroup>
              </div>

              {formData.studyStatus === 'estudiando' && (
                <div>
                  <label className="block text-gray-600 mb-2">
                    Ciclo actual
                  </label>
                  <Select
                    value={formData.currentCycle}
                    onValueChange={value => updateFormData('currentCycle', value)}
                  >
                    <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent">
                      <SelectValue placeholder="Seleccione su ciclo de estudios" />
                    </SelectTrigger>
                    <SelectContent>
                      {CYCLE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-left mb-6">
              <p className="text-[#373737] text-base">
                Según tu formación, estos roles podrían interesarte. Selecciona las que más te llamen la atención para ayudarte a encontrar tu primera experiencia profesional.
              </p>
            </div>
            <div className="space-y-6">
              {/* Áreas de interés - Select múltiple con chips */}
              <div>
                <label className="block text-[#373737] mb-3">
                  Áreas de interés <span className="text-red-500">*</span>
                </label>
                <div className="relative" data-select="areas">
                  <div 
                    className="w-full min-h-[56px] border border-primary rounded-lg bg-white flex flex-wrap gap-2 items-center px-4 py-2 cursor-pointer"
                    onClick={() => setAreasOpen(!areasOpen)}
                  >
                    {formData.interestedRoles.length === 0 ? (
                      <span className="text-gray-400">Selecciona áreas de interés</span>
                    ) : (
                      formData.interestedRoles.map(role => (
                        <span key={role} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#038bbf] text-white text-sm font-light mr-1 mb-1">
                          {role}
                          <button
                            type="button"
                            className="ml-1 bg-white rounded-full w-4 h-4 flex items-center justify-center focus:outline-none hover:bg-gray-100"
                            onClick={e => {
                              e.stopPropagation();
                              updateFormData('interestedRoles', formData.interestedRoles.filter(r => r !== role));
                            }}
                          >
                            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))
                    )}
                    <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {areasOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {ROLE_OPTIONS.filter(role => !formData.interestedRoles.includes(role)).map(role => (
                        <div
                          key={role}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            updateFormData('interestedRoles', [...formData.interestedRoles, role]);
                            setAreasOpen(false);
                          }}
                        >
                          {role}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo de trabajo - Select múltiple con chips */}
              <div>
                <label className="block text-[#373737] mb-3 font-medium">
                  Tipo de trabajo <span className="text-red-500">*</span>
                </label>
                <div className="relative" data-select="workType">
                  <div 
                    className="w-full min-h-[56px] border border-primary rounded-lg bg-white flex flex-wrap gap-2 items-center px-4 py-2 cursor-pointer"
                    onClick={() => setWorkTypeOpen(!workTypeOpen)}
                  >
                    {formData.workType.length === 0 ? (
                      <span className="text-gray-400">Selecciona tipo de trabajo</span>
                    ) : (
                      formData.workType.map(type => (
                        <span key={type} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#038bbf] text-white text-sm font-light mr-1 mb-1">
                          {type}
                          <button
                            type="button"
                            className="ml-1 bg-white rounded-full w-4 h-4 flex items-center justify-center focus:outline-none hover:bg-gray-100"
                            onClick={e => {
                              e.stopPropagation();
                              updateFormData('workType', formData.workType.filter(t => t !== type));
                            }}
                          >
                            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))
                    )}
                    <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {workTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {WORK_TYPE_OPTIONS.filter(opt => !formData.workType.includes(opt.value)).map(opt => (
                        <div
                          key={opt.value}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            updateFormData('workType', [...formData.workType, opt.value]);
                            setWorkTypeOpen(false);
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-left mb-6">
              <p className="text-[#373737] text-base">
                Así está el mercado para los roles que elegiste. Estos datos te ayudarán a tomar mejores decisiones para tu carrera.
              </p>
            </div>
            <div className="space-y-6">
              {formData.interestedRoles.slice(0, 3).map((role, index) => (
                <div key={role} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-center">{role}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-2xl font-bold text-[#028bbf] mb-1">
                        {index === 0 ? 'S/. 3,500' : index === 1 ? 'S/. 4,200' : 'S/. 3,800'}
                      </div>
                      <div className="text-gray-600">Salario promedio</div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {index === 0 ? '850+' : index === 1 ? '620+' : '750+'}
                      </div>
                      <div className="text-gray-600">Ofertas activas</div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {index === 0 ? 'Alta' : index === 1 ? 'Media' : 'Alta'}
                      </div>
                      <div className="text-gray-600">Demanda</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Habilidades más demandadas:</span>
                      <div className="flex flex-wrap gap-1 mt-1 justify-center">
                        {role.includes('Frontend') && ['React', 'JavaScript', 'CSS'].map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
                        ))}
                        {role.includes('Backend') && ['Node.js', 'Python', 'SQL'].map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
                        ))}
                        {role.includes('Full Stack') && ['React', 'Node.js', 'MongoDB'].map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
                        ))}
                        {role.includes('Mobile') && ['React Native', 'Flutter', 'Swift'].map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
                        ))}
                        {role.includes('Data') && ['Python', 'SQL', 'Tableau'].map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
                        ))}
                        {!role.includes('Frontend') && !role.includes('Backend') && !role.includes('Full Stack') && !role.includes('Mobile') && !role.includes('Data') && 
                          ['Excel', 'Analytics', 'Communication'].map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {formData.interestedRoles.length > 3 && (
                <div className="text-center text-sm text-gray-600">
                  Y {formData.interestedRoles.length - 3} roles más que también tienen gran demanda en el mercado
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">💡 Consejo profesional</h4>
                  <p className="text-sm text-yellow-800">
                    Estos roles tienen alta demanda. Te recomendamos crear un CV optimizado y practicar entrevistas para destacar entre los candidatos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-8">
            <div className="mb-6">
              <p>
                Tu CV es una de las herramientas más importantes para postular a una práctica. Si aún no lo tienes, no te preocupes: podemos ayudarte a crearlo desde cero usando inteligencia artificial.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="w-full p-6 min-h-[300px] rounded-2xl border hover:border-primary transition flex flex-col items-center gap-2 shadow-sm font-light text-[#373737] text-base"
                  onClick={() => updateFormData('hasCV', 'yes')}
                >
                  <div className="my-auto flex flex-col items-center">
                    <FileUp className="w-10 h-10 text-primary mb-2" strokeWidth={1.5} />
                  <span className="font-semibold">Adjunta tu CV</span>
                  <span className="text-sm text-gray-500 px-16">Sube tu archivo en PDF para que podamos ayudarte a encontrar prácticas compatibles.</span>
                  </div>
                </div>
                <div
                    className="w-full p-6 min-h-[300px] rounded-2xl border hover:border-primary transition flex flex-col items-center gap-2 shadow-sm font-light text-[#373737] text-base"
                    onClick={() => updateFormData('hasCV', 'no')}
                >
                  <div className="my-auto flex flex-col items-center">
                    <FilePlus className="w-10 h-10 text-primary mb-2" strokeWidth={1.5} />
                    <span className="font-semibold">Mi primer CV</span>
                    <span className="text-sm px-16 text-gray-500">Te guiaremos para que puedas generar un CV profesional desde cero, sin complicaciones.</span>
                    <button
                      className='mt-4 px-8 py-2 font-medium bg-white border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors'
                    >
                      Crear CV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#eff8ff]">
      {/* step indicator */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Barras de progreso */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= currentStep;
            return (
              <div
                key={stepNumber}
                className={`h-3 w-full rounded-full transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-[#028bbf]' 
                    : 'bg-[#028bbf]/30'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Header con logo y botón cerrar */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start flex-col gap-3">
            <Link href="/">
              <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8" />
            </Link>
            <h1 className="text-3xl font-semibold text-[#373737]">
              {getStepTitle()}
            </h1>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Omitir onboarding"
          >
            <X className="h-auto w-auto" />
          </button>
        </div>
      </div>

      {/* Card principal */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl p-8">
          {renderStepContent()}
        </div>
      </div>

      {/* Botones fuera de la card */}
      <div className="max-w-6xl mx-auto px-4 flex justify-between pb-8">
        {currentStep > 1 ? (
          <button
            onClick={handlePrevious}
            className="px-8 py-3 rounded-lg border border-[#028bbf] text-[#028bbf] bg-inherit font-semibold transition"
          >
            Atrás
          </button>
        ) : <div />} {/* Espacio para mantener alineación */}
        <button
          onClick={handleNext}
          disabled={
            (currentStep === 1 && (!formData.educationType || !formData.currentCareer || !formData.studyCenter || !formData.studyStatus)) ||
            (currentStep === 2 && (formData.interestedRoles.length === 0 || formData.workType.length === 0)) ||
            (currentStep === 4 && (!formData.hasCV || submitting))
          }
          className="px-8 py-3 rounded-lg bg-[#028bbf] hover:bg-[#027ba8] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === totalSteps ? (submitting ? "Finalizando..." : "Siguente") : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
