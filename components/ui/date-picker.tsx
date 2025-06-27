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
      // Agregar T00:00:00 para asegurar que se interprete como UTC
      const date = new Date(`${value}T00:00:00`);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC' // Forzar zona horaria UTC
      });
    } catch {
      return value;
    }
  };

  // Convertir string a Date para el calendario
  const getSelectedDate = () => {
    if (!value) return undefined;
    try {
      // Agregar T00:00:00 para asegurar que se interprete como UTC
      return new Date(`${value}T00:00:00`);
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
      return new Date(`${minDate}T00:00:00`);
    } catch {
      return undefined;
    }
  };

  const getMaxDate = () => {
    if (!maxDate) return undefined;
    try {
      return new Date(`${maxDate}T00:00:00`);
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
        <div className="absolute top-full left-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg min-w-[280px] max-w-[320px]">
          <div className="p-2">
            <CalendarComponent
              mode="single"
              selected={getSelectedDate()}
              onSelect={handleDateSelect}
              fromDate={getMinDate()}
              toDate={getMaxDate()}
              initialFocus
              className="w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0",
                month: "space-y-2",
                caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-6 w-6",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.65rem] h-6 flex items-center justify-center",
                row: "flex w-full mt-1",
                cell: "text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-7 w-8",
                day: "inline-flex items-center justify-center rounded-sm text-xs font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-8",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-medium",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
            
            {/* Botón para limpiar - más compacto */}
            {value && (
              <div className="mt-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="w-full py-1 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors"
                >
                  Limpiar fecha
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
