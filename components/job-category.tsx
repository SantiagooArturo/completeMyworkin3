"use client"

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface JobCategoryProps {
  id: string;
  icon: string;
  title: string;
  bgColor?: string;
  children: React.ReactNode;
}

export default function JobCategory({ id, icon, title, bgColor = 'bg-amber-50', children }: JobCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div id={id} className="scroll-mt-16">
      <div 
        className={`flex items-center justify-between ${bgColor} p-3 rounded-xl shadow-sm border border-amber-100 cursor-pointer transition-all duration-300 hover:shadow-md`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h2 className="text-lg font-bold text-gray-800">
            {title}
          </h2>
        </div>
        <div className="text-gray-600 hover:text-gray-900">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 transition-transform duration-300" />
          ) : (
            <ChevronRight className="h-5 w-5 transition-transform duration-300" />
          )}
        </div>
      </div>
      <div className={`transition-all duration-300 overflow-y-auto ${
        isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
      }`}>
        {children}
      </div>
    </div>
  );
}

