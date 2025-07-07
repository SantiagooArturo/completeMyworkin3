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
    hasCV: '',
  });

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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Selecciona los roles que más te interesan para tu carrera profesional
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecciona los roles de tu interés (puedes elegir varios)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ROLE_OPTIONS.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`p-3 rounded-lg border-2 text-left transition ${
                        formData.interestedRoles.includes(role)
                          ? 'border-[#028bbf] bg-[#028bbf]/10 text-[#028bbf]'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{role}</span>
                        {formData.interestedRoles.includes(role) && (
                          <svg className="w-5 h-5 text-[#028bbf]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Te mostramos insights del mercado laboral para los roles que seleccionaste
              </p>
            </div>

            <div className="space-y-4">
              {formData.interestedRoles.slice(0, 3).map((role, index) => (
                <div key={role} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">{role}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#028bbf] mb-1">
                        {index === 0 ? 'S/. 3,500' : index === 1 ? 'S/. 4,200' : 'S/. 3,800'}
                      </div>
                      <div className="text-gray-600">Salario promedio</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {index === 0 ? '850+' : index === 1 ? '620+' : '750+'}
                      </div>
                      <div className="text-gray-600">Ofertas activas</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {index === 0 ? 'Alta' : index === 1 ? 'Media' : 'Alta'}
                      </div>
                      <div className="text-gray-600">Demanda</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Habilidades más demandadas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
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
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Cuéntanos sobre tu situación actual con tu currículum vitae
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ¿Ya cuentas con un CV? *
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => updateFormData('hasCV', 'si-actualizado')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      formData.hasCV === 'si-actualizado'
                        ? 'border-[#028bbf] bg-[#028bbf]/10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Sí, tengo un CV actualizado</div>
                        <div className="text-sm text-gray-600">Mi CV está listo y actualizado</div>
                      </div>
                      {formData.hasCV === 'si-actualizado' && (
                        <svg className="w-5 h-5 text-[#028bbf]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFormData('hasCV', 'si-desactualizado')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      formData.hasCV === 'si-desactualizado'
                        ? 'border-[#028bbf] bg-[#028bbf]/10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Sí, pero necesita actualización</div>
                        <div className="text-sm text-gray-600">Tengo un CV pero está desactualizado</div>
                      </div>
                      {formData.hasCV === 'si-desactualizado' && (
                        <svg className="w-5 h-5 text-[#028bbf]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateFormData('hasCV', 'no')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      formData.hasCV === 'no'
                        ? 'border-[#028bbf] bg-[#028bbf]/10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">No, necesito crear uno</div>
                        <div className="text-sm text-gray-600">No tengo un CV y necesito crearlo desde cero</div>
                      </div>
                      {formData.hasCV === 'no' && (
                        <svg className="w-5 h-5 text-[#028bbf]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {formData.hasCV && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        {formData.hasCV === 'si-actualizado' && '¡Perfecto!'}
                        {formData.hasCV === 'si-desactualizado' && '💡 Te ayudamos a mejorarlo'}
                        {formData.hasCV === 'no' && '🚀 ¡Comencemos desde cero!'}
                      </h4>
                      <p className="text-sm text-blue-800">
                        {formData.hasCV === 'si-actualizado' && 'Podrás usar nuestras herramientas para optimizar aún más tu CV y practicar entrevistas.'}
                        {formData.hasCV === 'si-desactualizado' && 'Nuestro creador de CV te ayudará a actualizarlo con las mejores prácticas y optimizaciones para ATS.'}
                        {formData.hasCV === 'no' && 'Te guiaremos paso a paso para crear un CV profesional que destaque entre los reclutadores.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* step indicator */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Barras de progreso */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= currentStep;
            return (
              <div
                key={stepNumber}
                className={`h-2 w-full rounded-full transition-colors duration-300 ${
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
      <div className="max-w-4xl mx-auto px-4 py-6">
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
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl p-8">
          {renderStepContent()}
        </div>
      </div>

      {/* Botones fuera de la card */}
      <div className="max-w-4xl mx-auto px-4 flex justify-between pb-8">
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
            (currentStep === 2 && formData.interestedRoles.length === 0) ||
            (currentStep === 4 && (!formData.hasCV || submitting))
          }
          className="px-8 py-3 rounded-lg bg-[#028bbf] hover:bg-[#027ba8] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === totalSteps ? (submitting ? "Finalizando..." : "Completar onboarding") : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
