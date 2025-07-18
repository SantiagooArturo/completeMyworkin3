'use client';

import { useState, useEffect } from 'react';

export const useToolsUsed = (jobTitle: string) => {
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);

  // Cargar herramientas utilizadas desde localStorage al inicializar
  useEffect(() => {
    if (jobTitle) {
      const storedTools = localStorage.getItem(`tools_used_${jobTitle}`);
      if (storedTools) {
        setToolsUsed(JSON.parse(storedTools));
      }
    }
  }, [jobTitle]);

  // Función para agregar una herramienta utilizada
  const addToolUsed = (tool: string) => {
    if (!jobTitle) return;
    
    const currentTools = JSON.parse(localStorage.getItem(`tools_used_${jobTitle}`) || '[]');
    if (!currentTools.includes(tool)) {
      const newTools = [...currentTools, tool];
      localStorage.setItem(`tools_used_${jobTitle}`, JSON.stringify(newTools));
      setToolsUsed(newTools);
    }
  };

  // Función para obtener las herramientas utilizadas
  const getToolsUsed = (): string[] => {
    if (!jobTitle) return [];
    const storedTools = localStorage.getItem(`tools_used_${jobTitle}`);
    return storedTools ? JSON.parse(storedTools) : [];
  };

  // Función para limpiar las herramientas utilizadas
  const clearToolsUsed = () => {
    if (jobTitle) {
      localStorage.removeItem(`tools_used_${jobTitle}`);
      setToolsUsed([]);
    }
  };

  return {
    toolsUsed,
    addToolUsed,
    getToolsUsed,
    clearToolsUsed
  };
};
