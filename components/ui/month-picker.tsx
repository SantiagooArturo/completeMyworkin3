'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthPickerProps {
  value: string; // Formato: "YYYY-MM-DD" o "YYYY-MM" (compatible con ambos)
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: string; // Formato: "YYYY-MM-DD" o "YYYY-MM"
  maxDate?: string; // Formato: "YYYY-MM-DD" o "YYYY-MM"
  required?: boolean;
  dateFormat?: 'month' | 'full'; // 'month' para YYYY-MM, 'full' para YYYY-MM-DD
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function MonthPicker({
  value,
  onChange,
  placeholder = 'Selecciona mes y año',
  disabled = false,
  className = '',
  minDate,
  maxDate,
  required = false,
  dateFormat = 'month'
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length >= 1) {
        return parseInt(parts[0]);
      }
    }
    return new Date().getFullYear();
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Formatear valor para mostrar
  const formatDisplayValue = (value: string) => {
    if (!value) return '';
    
    // Extraer año y mes del valor (compatible con YYYY-MM-DD y YYYY-MM)
    const dateStr = value.includes('-') ? value : '';
    const parts = dateStr.split('-');
    if (parts.length < 2) return value;
    
    const year = parts[0];
    const month = parts[1];
    const monthIndex = parseInt(month) - 1;
    
    if (monthIndex < 0 || monthIndex > 11) return value;
    
    return `${months[monthIndex]} ${year}`;
  };

  // Extraer fecha en formato YYYY-MM para comparaciones
  const extractYearMonth = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}`;
    }
    return dateStr;
  };
  // Verificar si un mes está habilitado
  const isMonthEnabled = (year: number, monthIndex: number) => {
    const monthValue = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    
    if (minDate && monthValue < extractYearMonth(minDate)) return false;
    if (maxDate && monthValue > extractYearMonth(maxDate)) return false;
    
    return true;
  };

  // Manejar selección de mes
  const handleMonthSelect = (year: number, monthIndex: number) => {
    if (!isMonthEnabled(year, monthIndex)) return;
    
    let selectedValue;
    if (dateFormat === 'full') {
      // Para formato completo, usar el primer día del mes
      selectedValue = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    } else {
      // Para formato de mes, usar YYYY-MM
      selectedValue = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    }
    
    onChange(selectedValue);
    setIsOpen(false);
  };

  // Navegar años
  const handlePrevYear = () => {
    setViewYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear(prev => prev + 1);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "cursor-pointer select-none",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2",
          className
        )}
      >
        <div className="flex items-center w-full">
          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
          <span className={cn(
            "flex-1",
            !value && "text-muted-foreground"
          )}>
            {value ? formatDisplayValue(value) : placeholder}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg">
          <div className="p-3">
            {/* Header con navegación de año */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevYear}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="font-medium text-sm">
                {viewYear}
              </span>
              
              <button
                type="button"
                onClick={handleNextYear}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Grid de meses */}
            <div className="grid grid-cols-3 gap-1">              {months.map((month, index) => {
                const currentYearMonth = `${viewYear}-${String(index + 1).padStart(2, '0')}`;
                const valueYearMonth = extractYearMonth(value);
                const isSelected = valueYearMonth === currentYearMonth;
                const isEnabled = isMonthEnabled(viewYear, index);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleMonthSelect(viewYear, index)}
                    disabled={!isEnabled}
                    className={cn(
                      "p-2 text-xs rounded transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      !isEnabled && "opacity-50"
                    )}
                  >
                    {month}
                  </button>
                );
              })}
            </div>

            {/* Botón para limpiar */}
            {value && (
              <div className="mt-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="w-full p-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}