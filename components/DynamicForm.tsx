'use client';

import React, { useState } from 'react';
import { FormSection } from '../src/types';
import { HelpCircle, Info, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  schema: FormSection[];
  initialData?: any;
  onNext?: (data: any) => void;
  onChange?: (data: any) => void;
}

export default function DynamicForm({ schema, initialData, onNext, onChange }: Props) {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);

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

  const activeSection = normalizedSchema[currentSectionIdx];
  const isLastSection = currentSectionIdx === normalizedSchema.length - 1;
  const isFirstSection = currentSectionIdx === 0;

  const validateSection = (sectionIdx: number) => {
    const newErrors: Record<string, string> = {};
    const section = normalizedSchema[sectionIdx];

    section.fields?.forEach((field) => {
      const value = String(formData[field.id] || '').trim();

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
      
      if (!value && field.required !== false) {
          newErrors[field.id] = 'Este campo é obrigatório';
      }
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

  const handleNextSection = () => {
    if (validateSection(currentSectionIdx)) {
      if (isLastSection) {
        if (onNext) onNext(formData);
      } else {
        setCurrentSectionIdx(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevSection = () => {
    setCurrentSectionIdx(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (normalizedSchema.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Progress Indicator for multi-section forms */}
      {normalizedSchema.length > 1 && (
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 no-scrollbar">
          {normalizedSchema.map((_, idx) => (
            <React.Fragment key={idx}>
              <div 
                className={`flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer transition-all ${
                  idx === currentSectionIdx ? 'opacity-100' : 'opacity-40 hover:opacity-100'
                }`}
                onClick={() => {
                  if (idx < currentSectionIdx) setCurrentSectionIdx(idx);
                }}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                  idx <= currentSectionIdx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {idx + 1}
                </div>
              </div>
              {idx < normalizedSchema.length - 1 && (
                <div className={`h-1 flex-1 min-w-[20px] mx-2 rounded-full ${
                  idx < currentSectionIdx ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div key={currentSectionIdx} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <span className="text-sm font-bold">{currentSectionIdx + 1}</span>
          </div>
          <h3 className="font-display text-lg font-bold tracking-tight text-slate-800">
            {activeSection.section}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {activeSection.fields?.map((field) => (
            <div 
              key={field.id} 
              className={`group flex flex-col space-y-1.5 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}
            >
              <div className="flex items-center justify-between px-1">
                <label htmlFor={field.id} className="text-[13px] font-semibold text-slate-700 transition-colors group-focus-within:text-emerald-600">
                  {field.label}
                  {field.required !== false && <span className="ml-1 text-red-400">*</span>}
                </label>
                {field.id === 'bi_number' && (
                  <div className="group/info relative cursor-help">
                    <HelpCircle size={14} className="text-slate-300" />
                    <div className="absolute right-0 top-6 z-20 hidden w-48 rounded-lg bg-slate-800 p-2 text-[10px] text-white shadow-xl group-hover/info:block">
                      Formato: 12 números + 1 letra. Ex: 123456789012A
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onFocus={() => setFocusedField(field.id)}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={field.required !== false}
                    rows={4}
                    className={`w-full px-4 py-3.5 rounded-2xl border bg-slate-50/30 transition-all outline-none resize-none text-slate-900 placeholder:text-slate-400 ${
                      errors[field.id] 
                        ? 'border-red-300 bg-red-50/30 focus:border-red-500' 
                        : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50/50'
                    }`}
                  />
                ) : (
                  <input
                    id={field.id}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onFocus={() => setFocusedField(field.id)}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={field.required !== false}
                    className={`w-full px-4 py-3.5 rounded-2xl border bg-slate-50/30 transition-all outline-none text-slate-900 placeholder:text-slate-400 ${
                      errors[field.id] 
                        ? 'border-red-300 bg-red-50/30 focus:border-red-500' 
                        : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50/50'
                    }`}
                  />
                )}
                
                {focusedField === field.id && !errors[field.id] && (
                  <div className="absolute -bottom-px left-8 right-8 h-0.5 bg-emerald-500 rounded-full blur-[1px] opacity-20" />
                )}
              </div>

              {errors[field.id] && (
                <span className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  <Info size={12} />
                  {errors[field.id]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row gap-4">
        {!isFirstSection && (
          <button
            type="button"
            onClick={handlePrevSection}
            className="btn-secondary flex-1"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>
        )}
        <button
          type="button"
          onClick={handleNextSection}
          className="btn-primary flex-[2]"
        >
          {isLastSection ? 'Revisar Documento Completo' : 'Próxima Seção'}
          {!isLastSection && <ChevronRight size={18} />}
        </button>
      </div>

      <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
        * Campos obrigatórios para a emissão correta do documento
      </p>
    </div>
  );
}
