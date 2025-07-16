'use client';

import React from 'react';
import { trackButtonClick, trackBotInteraction } from '@/utils/analytics';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  workyUrl: string;
  jobTitle: string;
  jobUrl: string; // Acepta la URL como prop
}

export default function ApplyModal({ isOpen, onClose, onApply, workyUrl, jobTitle, jobUrl }: ApplyModalProps) {
  
  console.log("URL",jobUrl);
  if (!isOpen) return null;

  const handleWorkyClick = () => {
    trackButtonClick('Entrenar con Worky');
    trackBotInteraction('Worky');
  };

  const handlePostularClick = () => {
    trackButtonClick('Postular ahora');
    window.open(jobUrl, '_blank'); // Redirige a la URL de la práctica

    onApply();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            ¿Listo para postular?
          </h3>
          <p className="text-gray-600">
            Entrena con Worky, nuestro bot de empleabilidad, y mejora tu CV y entrevista.
          </p>
        </div>
        
        <div className="space-y-3 flex flex-col items-center">
          <a
            href={workyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#028bbf] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#027ba8] transition-all duration-300 flex items-center justify-center gap-2"
            onClick={handleWorkyClick}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.83L2.29 22l4.17-1.59C7.88 21.44 9.87 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.38 13.63c-.23.63-.95 1.15-1.55 1.3-.41.1-.95.18-2.76-.63-2.32-1.03-3.82-3.57-3.93-3.73-.12-.17-.96-1.28-.96-2.44 0-1.16.6-1.73.81-1.97.17-.19.37-.27.53-.27.16 0 .32 0 .46.02.15.01.35-.04.54.41.19.45.65 1.59.71 1.71.06.12.1.26.02.41-.08.15-.12.24-.24.37-.12.13-.25.29-.36.39-.11.1-.23.21-.1.41.13.2.59.86 1.27 1.39.87.68 1.6 1.03 1.77 1.14.17.11.27.09.37-.04.1-.13.43-.5.54-.67.11-.17.22-.14.37-.08.15.06 1.74.82 1.97.92.23.1.39.15.45.23.06.08.06.47-.17 1.1z" clipRule="evenodd"/>
            </svg>
            Entrenar con Worky
          </a>
          
          <button
            onClick={handlePostularClick}
            className="w-2/3 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z M14 2v6h6" />
            </svg>
            Postular Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
