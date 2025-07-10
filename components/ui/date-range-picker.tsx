'use client';

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Selecciona rango de fechas",
  className = "",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    onChange({ from: range.from, to: range.to });
    // Cierra el popover solo si ambos están seleccionados
    if (range.from && range.to) setOpen(false);
  };

  let label = placeholder;
  if (value.from && value.to) {
    label = `${format(value.from, "dd/MM/yyyy", { locale: es })} - ${format(value.to, "dd/MM/yyyy", { locale: es })}`;
  } else if (value.from) {
    label = `${format(value.from, "dd/MM/yyyy", { locale: es })} - ...`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[220px]",
            !value.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          selected={value}
          onSelect={handleSelect}
          numberOfMonths={1}
          className="rounded-md"
          captionLayout="buttons"
            locale={es}
            disabled={(date) => date > addDays(new Date(), 365)}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;