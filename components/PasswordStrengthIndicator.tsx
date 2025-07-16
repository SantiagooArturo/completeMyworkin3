'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  id: string;
  text: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    id: 'length',
    text: 'Al menos 6 caracteres',
    test: (password) => password.length >= 6
  },
  {
    id: 'letters',
    text: 'Contiene letras',
    test: (password) => /[a-zA-Z]/.test(password)
  },
  {
    id: 'numbers',
    text: 'Contiene números',
    test: (password) => /\d/.test(password)
  },
  {
    id: 'case',
    text: 'Mayúsculas y minúsculas',
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password)
  }
];

export default function PasswordStrengthIndicator({ 
  password, 
  className = "" 
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0);
  const [strengthLevel, setStrengthLevel] = useState<'weak' | 'medium' | 'strong'>('weak');

  useEffect(() => {
    const passed = requirements.filter(req => req.test(password)).length;
    setStrength(passed);
    
    if (passed <= 1) {
      setStrengthLevel('weak');
    } else if (passed <= 2) {
      setStrengthLevel('medium');
    } else {
      setStrengthLevel('strong');
    }
  }, [password]);

  if (!password) return null;

  const getStrengthColor = () => {
    switch (strengthLevel) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
    }
  };

  const getStrengthText = () => {
    switch (strengthLevel) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barra de fuerza */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Fuerza de contraseña:</span>
          <span className={`text-sm font-medium ${
            strengthLevel === 'weak' ? 'text-red-600' :
            strengthLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / requirements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Lista de requisitos */}
      <div className="space-y-1">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <div key={req.id} className="flex items-center space-x-2">
              {passed ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-gray-400" />
              )}
              <span className={`text-sm ${passed ? 'text-green-700' : 'text-gray-500'}`}>
                {req.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
