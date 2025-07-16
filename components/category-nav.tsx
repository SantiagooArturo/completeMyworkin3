"use client"

import { useCallback } from 'react'

interface CategoryNavItem {
  id: string;
  name: string;
  count: number;
  icon: string;
}

interface CategoryNavProps {
  categories: CategoryNavItem[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Ajusta este valor según el tamaño de tu navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
        <span className="bg-[#028bbf] text-white h-7 w-7 rounded-full flex items-center justify-center mr-2 shadow-md">2</span>
        <span className="relative">
          Ofertas por Categoría
          <span className="absolute -top-1 -right-20 bg-[#028bbf] text-white text-xs px-2 py-0.5 rounded-full animate-pulse">¡Nuevas!</span>
        </span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => scrollToCategory(category.id)}
            className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
          >
            <span className="text-xl">{category.icon}</span>
            <div className="flex-1 text-left">
              <span className="text-gray-800 group-hover:text-[#028bbf] transition-colors font-medium">
                {category.name}
              </span>
            </div>
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-sm font-medium">
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
} 