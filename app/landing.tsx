'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-poppins">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/">
                <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8" />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-700 hover:text-[#028bbf] transition-colors">
                  Inicio
                </Link>
                <Link href="/bolsa-trabajo" className="text-gray-700 hover:text-[#028bbf] transition-colors">
                  Bolsa de trabajo
                </Link>
                <Link href="/agentes-ai" className="text-gray-700 hover:text-[#028bbf] transition-colors">
                  Agentes de AI
                </Link>
              </nav>
            </div>
            <a
              href="https://mc.ht/s/SH1lIgc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#028bbf] text-white rounded-full hover:bg-[#027ba8] transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chatea con Worky
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#028bbf] to-blue-600 bg-clip-text text-transparent">
                  Tu primer trabajo con IA
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  La plataforma #1 de empleabilidad juvenil en Perú que conecta estudiantes y talentos junior con oportunidades laborales reales.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="#start"
                    className="px-8 py-4 bg-[#028bbf] text-white rounded-xl font-medium shadow-lg hover:bg-[#027ba8] transition-all transform hover:scale-105"
                  >
                    Empezar con Worky
                  </a>
                  <Link
                    href="/bolsa-trabajo"
                    className="px-8 py-4 bg-white text-[#028bbf] rounded-xl font-medium shadow-lg hover:bg-gray-50 transition-all transform hover:scale-105 border-2 border-[#028bbf]"
                  >
                    Ver oportunidades
                  </Link>
                </div>
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#028bbf]">10,000+</p>
                    <p className="text-gray-600">Jóvenes empleados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#028bbf]">500+</p>
                    <p className="text-gray-600">Empresas confían</p>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative z-10"
              >
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-8">
                  <img
                    src="/dashboard-preview.png"
                    alt="MyWorkIn Platform"
                    className="rounded-xl shadow-2xl"
                  />
                </div>
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-3xl -z-10 transform -rotate-6"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Características de Worky 2.0</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#028bbf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Entrevistas Adaptativas</h3>
              <p className="text-gray-600">Personalizadas según el puesto y empresa que te interesa.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Respuestas Multimedia</h3>
              <p className="text-gray-600">Responde por audio o video para mostrar tus habilidades.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Revisión de CV</h3>
              <p className="text-gray-600">Análisis detallado y sugerencias personalizadas para tu CV.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Sesiones 1:1</h3>
              <p className="text-gray-600">Agenda sesiones personalizadas con expertos en RRHH.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#028bbf]">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Crea tu perfil</h3>
              <p className="text-gray-600">Sube tu CV o créalo con nuestra IA en minutos.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#028bbf]">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Practica con Worky</h3>
              <p className="text-gray-600">Mejora tus habilidades con entrevistas simuladas.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#028bbf]">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Postula y destaca</h3>
              <p className="text-gray-600">Aplica a oportunidades con confianza y preparación.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Lo que dicen nuestros usuarios</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">María García</h4>
                  <p className="text-gray-600 text-sm">Practicante de Marketing</p>
                </div>
              </div>
              <p className="text-gray-600">"Gracias a Worky conseguí mi primera práctica profesional. Las entrevistas simuladas me ayudaron muchísimo."</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">Carlos Mendoza</h4>
                  <p className="text-gray-600 text-sm">Desarrollador Junior</p>
                </div>
              </div>
              <p className="text-gray-600">"La revisión de CV con IA me ayudó a mejorar mi perfil. Ahora tengo un trabajo que me encanta."</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">Ana Torres</h4>
                  <p className="text-gray-600 text-sm">Analista de Datos</p>
                </div>
              </div>
              <p className="text-gray-600">"Las sesiones 1:1 con expertos me dieron la confianza que necesitaba para las entrevistas reales."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">¿Listo para iniciar tu carrera profesional?</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Únete a miles de jóvenes que ya encontraron su primer trabajo con MyWorkIn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://mc.ht/s/SH1lIgc"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#028bbf] text-white rounded-xl font-medium shadow-lg hover:bg-[#027ba8] transition-all transform hover:scale-105"
            >
              Empezar ahora
            </a>
            <Link
              href="/bolsa-trabajo"
              className="px-8 py-4 bg-white text-[#028bbf] rounded-xl font-medium shadow-lg hover:bg-gray-50 transition-all transform hover:scale-105 border-2 border-[#028bbf]"
            >
              Ver oportunidades
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8 mb-4" />
              <p className="text-gray-600">La plataforma líder de empleabilidad juvenil en Perú.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Plataforma</h3>
              <ul className="space-y-2">
                <li><Link href="/bolsa-trabajo" className="text-gray-600 hover:text-[#028bbf]">Bolsa de trabajo</Link></li>
                <li><Link href="/agentes-ai" className="text-gray-600 hover:text-[#028bbf]">Agentes de AI</Link></li>
                <li><Link href="/comunidad" className="text-gray-600 hover:text-[#028bbf]">Comunidad</Link></li>
              </ul>
            </div>
            {/* <div>
              <h3 className="font-bold text-gray-900 mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-600 hover:text-[#028bbf]">Blog</Link></li>
                <li><Link href="/guias" className="text-gray-600 hover:text-[#028bbf]">Guías</Link></li>
                <li><Link href="/eventos" className="text-gray-600 hover:text-[#028bbf]">Eventos</Link></li>
              </ul>
            </div> */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terminos" className="text-gray-600 hover:text-[#028bbf]">Términos y Condiciones</Link></li>
                <li><Link href="/privacidad" className="text-gray-600 hover:text-[#028bbf]">Política de Privacidad</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-600">© 2024 MyWorkIn. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 