'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
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
  );
} 