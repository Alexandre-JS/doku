'use client';

import React, { useState } from 'react';
import { FormSection } from '../src/types';

interface Props {
  schema: FormSection[];
  initialData?: any;
  onNext?: (data: any) => void;
  onChange?: (data: any) => void;
}

export default function DynamicForm({ schema, initialData, onNext, onChange }: Props) {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sincroniza o estado se o initialData mudar (ex: vindo do servidor)
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Normaliza o schema para suportar tanto o formato novo (seções) quanto o antigo (array plano)
  const normalizedSchema: FormSection[] = React.useMemo(() => {
    if (!Array.isArray(schema) || schema.length === 0) return [];
    
    // Se o primeiro item não tem 'fields', assumimos que é um array plano de FormField
    if (!('fields' in schema[0])) {
      return [{
        section: 'Informações do Documento',
        fields: schema as any
      }];
    }
    
    return schema;
  }, [schema]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    normalizedSchema.forEach((section) => {
      section.fields?.forEach((field) => {
        const value = formData[field.id] || '';

        if (field.id === 'bi_number' || field.id === 'biNumber') {
          const biRegex = /^\d{12}[A-Z]$/i;
          if (value && !biRegex.test(value)) {
            newErrors[field.id] = 'O BI deve ter 12 números seguidos de uma letra (ex: 123456789012A).';
          }
        }

        if (field.id === 'nuit') {
          const nuitRegex = /^\d{9}$/;
          if (value && !nuitRegex.test(value)) {
            newErrors[field.id] = 'O NUIT deve ter exatamente 9 dígitos numéricos.';
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (id: string, value: string) => {
    const newData = { ...formData, [id]: value };
    setFormData(newData);
    
    if (onChange) {
      onChange(newData);
    }

    // Limpa o erro ao digitar
    if (errors[id]) {
      setErrors((prev: Record<string, string>) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (onNext) onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      {normalizedSchema.map((section, sIdx) => (
        <div key={sIdx} className="space-y-6">
          {section.section && (
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-800">
                {section.section}
              </h3>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields?.map((field) => (
              <div key={field.id} className={`flex flex-col space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                <label htmlFor={field.id} className="text-sm font-medium text-slate-700">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required
                    rows={4}
                    className={`px-4 py-3 rounded-xl border transition-all outline-none resize-none ${
                      errors[field.id] 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                ) : (
                  <input
                    id={field.id}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required
                    className={`px-4 py-3 rounded-xl border transition-all outline-none ${
                      errors[field.id] 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                )}
                {errors[field.id] && (
                  <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                    {errors[field.id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
      >
        Revisar Documento
      </button>
    </form>
  );
}
