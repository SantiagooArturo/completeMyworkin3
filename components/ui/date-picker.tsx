'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from './calendar';

interface DatePickerProps {
  value: string; // Formato: "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: string; // Formato: "YYYY-MM-DD"
  maxDate?: string; // Formato: "YYYY-MM-DD"
  required?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Selecciona fecha',
  disabled = false,
  className = '',
  minDate,
  maxDate,
  required = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    
    try {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return value;
    }
  };

  // Convertir string a Date para el calendario
  const getSelectedDate = () => {
    if (!value) return undefined;
    try {
      return new Date(value);
    } catch {
      return undefined;
    }
  };

  // Manejar selección de fecha
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange('');
      setIsOpen(false);
      return;
    }

    // Formatear como YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    onChange(dateString);
    setIsOpen(false);
  };

  // Convertir minDate y maxDate a objetos Date
  const getMinDate = () => {
    if (!minDate) return undefined;
    try {
      return new Date(minDate);
    } catch {
      return undefined;
    }
  };

  const getMaxDate = () => {
    if (!maxDate) return undefined;
    try {
      return new Date(maxDate);
    } catch {
      return undefined;
    }
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
            <CalendarComponent
              mode="single"
              selected={getSelectedDate()}
              onSelect={handleDateSelect}
              fromDate={getMinDate()}
              toDate={getMaxDate()}
              initialFocus
            />
            
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
