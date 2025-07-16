'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { ArrowRight, Bot, MessageSquare, FileText, Users } from 'lucide-react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { trackButtonClick, trackBotInteraction } from '@/utils/analytics';
import { Button } from '@/components/ui/button';

const TrackedButton = ({ onClick, className, children, trackingName }: {
  onClick: () => void,
  className: string,
  children: React.ReactNode,
  trackingName: string
}) => {
  const handleClick = () => {
    trackButtonClick(trackingName);
    onClick();
  };

  return (
    <Button
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};

export default function BotsEmpleabilidad() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const fetchTargetDate = async () => {
      try {
        // Buscar la cuenta regresiva para "El Chambas"
        const q = query(
          collection(db, 'cuentas_regresivas'),
          where('bot', '==', 'El Chambas'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        let targetDate;

        if (!querySnapshot.empty) {
          // Usar la fecha del documento más reciente
          targetDate = querySnapshot.docs[0].data().targetDate.toDate();
        } else {
          // Si no hay fecha en Firestore, usar una fecha por defecto
          targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + 8);
        }

        const timer = setInterval(() => {
          const now = new Date();
          const difference = targetDate.getTime() - now.getTime();

          if (difference < 0) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            clearInterval(timer);
            return;
          }

          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error("Error fetching target date:", error);
        // En caso de error, mostrar una cuenta regresiva por defecto
        setTimeLeft({ days: 8, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    fetchTargetDate();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins">
      <Navbar />
      
      {/* Espaciador para compensar el header fijo */}
      <div className="h-[52px]"></div>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-black">Nuestros Bots de </span>
              <span className="text-[#028bbf]">Empleabilidad</span>
            </h1>
            <p className="text-xl text-gray-600">
              Potencia tu búsqueda laboral con inteligencia artificial. Nuestros bots están diseñados para ayudarte en cada paso del proceso.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Worky Bot - Activo */}
            <div className="bg-white rounded-2xl p-8 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#028bbf] rounded-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Worky</h2>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Activo
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-[#028bbf] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Análisis de CV</h3>
                    <p className="text-gray-600">Recibe feedback detallado y mejora tu CV al instante.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-6 h-6 text-[#028bbf] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Simulación de Entrevistas</h3>
                    <p className="text-gray-600">Practica con preguntas reales y recibe retroalimentación.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-[#028bbf] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Asesoría Personalizada</h3>
                    <p className="text-gray-600">Orientación experta para tu desarrollo profesional.</p>
                  </div>
                </div>
              </div>

              <TrackedButton
                onClick={() => {
                  trackBotInteraction('Worky');
                }}
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#028bbf] text-white rounded-xl font-medium hover:bg-[#027ba8] transition-colors"
                trackingName="Comenzar ahora"
              >
                Comenzar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </TrackedButton>
            </div>

            {/* El Chambas - Próximamente */}
            <div className="relative bg-white rounded-2xl p-8 shadow-xl overflow-hidden">
              {/* Overlay de censura */}
              <div className="absolute inset-0 bg-black/5 backdrop-blur-sm z-10"></div>
              
              <div className="relative z-20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Bot className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">El Chambas</h2>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Próximamente
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 blur-sm">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-6 h-6 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Actualizaciones Diarias</h3>
                      <p className="text-gray-600">Recibe oportunidades de prácticas personalizadas por WhatsApp.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Contactos Directos</h3>
                      <p className="text-gray-600">Accede a una lista exclusiva de contactos en empresas.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Emails Personalizados</h3>
                      <p className="text-gray-600">Redacción automática de correos de postulación.</p>
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 mb-4">Disponible en:</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <span className="block text-2xl font-bold text-[#028bbf]">{timeLeft.days}</span>
                      <span className="text-sm text-gray-600">Días</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <span className="block text-2xl font-bold text-[#028bbf]">{timeLeft.hours}</span>
                      <span className="text-sm text-gray-600">Horas</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <span className="block text-2xl font-bold text-[#028bbf]">{timeLeft.minutes}</span>
                      <span className="text-sm text-gray-600">Min</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <span className="block text-2xl font-bold text-[#028bbf]">{timeLeft.seconds}</span>
                      <span className="text-sm text-gray-600">Seg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8 mb-4" />
              <p className="text-gray-600">La plataforma líder de empleabilidad juvenil en Perú.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Plataforma</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-[#028bbf]">Inicio</Link></li>
                <li><Link href="/bolsa-trabajo" className="text-gray-600 hover:text-[#028bbf]">Bolsa de trabajo</Link></li>
                <li><Link href="/agentes-ai" className="text-gray-600 hover:text-[#028bbf]">Bots de empleabilidad</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-600 hover:text-[#028bbf]">Blog</Link></li>
                <li><Link href="/guias" className="text-gray-600 hover:text-[#028bbf]">Guías</Link></li>
                <li><Link href="/eventos" className="text-gray-600 hover:text-[#028bbf]">Eventos</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terminos" className="text-gray-600 hover:text-[#028bbf]">Términos y Condiciones</Link></li>
                <li><Link href="/privacidad" className="text-gray-600 hover:text-[#028bbf]">Política de Privacidad</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 