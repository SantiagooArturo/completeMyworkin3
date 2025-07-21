'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';
import ToolsShowcase from '@/components/ToolsShowcase';
import CompanyCarousel from '@/components/CompanyCarousel';
import {
  ArrowRight,
  Briefcase,
  Star
} from 'lucide-react';
import { trackButtonClick } from '@/utils/analytics';

// Componente de botón con tracking
const TrackedLink = ({ href, className, children, trackingName }: { 
  href: string, 
  className: string, 
  children: React.ReactNode,
  trackingName: string 
}) => {
  const handleClick = () => {
    trackButtonClick(trackingName);
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins">
      <Navbar />

      {/* Espaciador para compensar el header fijo */}
      <div className="h-[52px]"></div>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Prepárate, postula
y consigue tu

              <br />
              <span className="text-[#028bbf] border-b-4 border-[#028bbf]/20">
                Primer trabajo
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Obtén recomendaciones de prácticas personalizadas, crea CVs optimizados y practica entrevistas.
              Todo en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#028bbf] text-white rounded-full font-medium hover:bg-[#027ba8] transition-colors shadow-lg hover:shadow-xl"
                onClick={() => trackButtonClick('Registrarse Gratis')}
              >
                Registrarse  ¡Es Gratis!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center text-gray-600">
              <Star className="h-5 w-5 text-yellow-400 mr-2" />
              <span>Más de 10,000 estudiantes ya confían en nosotros</span>
            </div>
          </div>
        </div>
      </section>

      {/* Company Carousel Section */}
      <CompanyCarousel />

      {/* Tools Showcase Section */}
      <ToolsShowcase />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 via-[#028bbf] to-emerald-500">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              ¡Atrévete a dar el salto. Aplica y empieza algo distinto!
            </h2>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#028bbf] rounded-full font-medium hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
              >
                Empezar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8 mb-4" />
              <p className="text-gray-600">La plataforma líder de empleabilidad juvenil en Perú.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Plataforma</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-[#028bbf]">Inicio</Link></li>
                <li><Link href="/bolsa-trabajo" className="text-gray-600 hover:text-[#028bbf]">Bolsa de trabajo</Link></li>
                <li><Link href="/login" className="text-gray-600 hover:text-[#028bbf]">Iniciar Sesión</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Recursos</h3>
              {/* <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-600 hover:text-[#028bbf]">Blog</Link></li>
                <li><Link href="/guias" className="text-gray-600 hover:text-[#028bbf]">Guías</Link></li>
                <li><Link href="/eventos" className="text-gray-600 hover:text-[#028bbf]">Eventos</Link></li>
              </ul> */}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                
                <li><Link href="/privacidad" className="text-gray-600 hover:text-[#028bbf]">Política de Privacidad</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600">© 2025 MyWorkIn. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 