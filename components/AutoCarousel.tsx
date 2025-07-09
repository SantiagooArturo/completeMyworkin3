'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

const CARDS = [
  {
    label: 'Simulación de entrevistas',
    labelColor: 'bg-yellow-100 text-yellow-700',
    text: (
      <>
        ¿Aún no conoces a Worky?<br />
        Prepárate para destacar y simula una entrevista con nuestro bot potenciado con IA
      </>
    ),
  },
  {
    label: 'Análisis de CV con IA',
    labelColor: 'bg-green-100 text-green-700',
    text: (
      <>
        ¿Tu CV está alineado con lo que buscan las empresas?<br />
        Analiza tu CV con IA y mejora tu perfil profesional.
      </>
    ),
  },
  {
    label: 'Crear CV',
    labelColor: 'bg-blue-100 text-blue-700',
    text: (
      <>
        ¿Te gustaría tener un CV impecable sin complicarte?<br />
        Créalo en minutos con formato Harvard y listo para postular.
      </>
    ),
  },
];

export default function AutoCarousel() {
  const [active, setActive] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % CARDS.length);
    }, 4000);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [active]);

  return (
    <div className="w-full flex flex-col items-center text-sm">
      <div className="relative w-full max-w-md">
        {CARDS.map((card, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="bg-[#f6fbff] rounded-3xl shadow-md p-6 min-h-[210px] flex flex-col justify-between">
              <div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${card.labelColor}`}>
                  {card.label}
                </span>
                <button className="float-right text-gray-400 hover:text-gray-600">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-4 mb-2 text-lg font-semibold text-gray-900 leading-snug">
                {card.text}
              </div>
              {/* Paginación */}
              <div className="flex justify-center gap-2 mt-4">
                {CARDS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === active ? 'bg-blue-400' : 'bg-blue-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}