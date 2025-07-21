'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Building } from 'lucide-react';

interface JobPosting {
  id: string;
  companyName: string;
  companyLogo: string;
  position: string;
  postedAgo: string;
}

const recentPostings: JobPosting[] = [
  {
    id: '1',
    companyName: 'BBVA',
    companyLogo: '/companies/klipartz.com.png',
    position: 'Data Analyst',
    postedAgo: '6 hours ago'
  },
  {
    id: '2',
    companyName: 'P&G',
    companyLogo: '/companies/klipartz.com(1).png',
    position: 'Practicante de Ventas',
    postedAgo: '4 hours ago'
  },
  {
    id: '3',
    companyName: 'BCP',
    companyLogo: '/companies/klipartz.com(2).png',
    position: 'Practicante comercial',
    postedAgo: '6 hours ago'
  },
  {
    id: '4',
    companyName: 'JPMorgan',
    companyLogo: '/companies/klipartz.com(3).png',
    position: 'Practicante de M&A',
    postedAgo: '2 hours ago'
  },
  {
    id: '5',
    companyName: 'Aje',
    companyLogo: '/companies/klipartz.com(4).png',
    position: 'Practicante Global de Comunicación Interna',
    postedAgo: '1 hour ago'
  }
];

export default function CompanyCarousel() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center bg-blue-50 rounded-full px-4 py-2 text-[#028bbf] mb-4">
            <Building className="w-5 h-5 mr-2" />
            Prácticas Actualizadas
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            +150 nuevas prácticas todos los días
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Las mejores empresas publican sus prácticas en MyWorkIn. Postula fácilmente y aumenta tus posibilidades de ser aceptado.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex gap-6 py-4 animate-scroll">
            {/* Primera set de prácticas */}
            {recentPostings.map((posting) => (
              <div
                key={posting.id}
                className="flex items-center bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow min-w-[300px]"
              >
                <div className="w-12 h-12 relative mr-4 flex-shrink-0">
                  <Image
                    src={posting.companyLogo}
                    alt={posting.companyName}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{posting.companyName}</h3>
                    <span className="text-sm text-gray-500">{posting.postedAgo}</span>
                  </div>
                  <p className="text-sm text-gray-600">{posting.position}</p>
                </div>
              </div>
            ))}
            {/* Set duplicado para scroll infinito */}
            {recentPostings.map((posting) => (
              <div
                key={`duplicate-${posting.id}`}
                className="flex items-center bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow min-w-[300px]"
              >
                <div className="w-12 h-12 relative mr-4 flex-shrink-0">
                  <Image
                    src={posting.companyLogo}
                    alt={posting.companyName}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{posting.companyName}</h3>
                    <span className="text-sm text-gray-500">{posting.postedAgo}</span>
                  </div>
                  <p className="text-sm text-gray-600">{posting.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 