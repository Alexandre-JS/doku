'use client';

import React, { useState, useMemo } from 'react';
import { FormSection } from '../src/types';
import { HelpCircle, Info, ChevronRight, ChevronLeft, Plus, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Função para verificar se um campo está preenchido
  const isFieldFilled = (fieldId: string) => {
    const val = formData[fieldId];
    if (Array.isArray(val)) return val.length > 0;
    return val && String(val).trim().length > 0;
  };

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

  const handleRepeaterChange = (sectionId: string, index: number, fieldId: string, value: string) => {
    const sectionData = [...(formData[sectionId] || [])];
    if (!sectionData[index]) sectionData[index] = {};
    sectionData[index] = { ...sectionData[index], [fieldId]: value };
    
    const newData = { ...formData, [sectionId]: sectionData };
    setFormData(newData);
    if (onChange) onChange(newData);
  };

  const addRepeaterItem = (sectionId: string) => {
    const sectionData = [...(formData[sectionId] || []), {}];
    const newData = { ...formData, [sectionId]: sectionData };
    setFormData(newData);
    if (onChange) onChange(newData);
  };

  const removeRepeaterItem = (sectionId: string, index: number) => {
    const sectionData = [...(formData[sectionId] || [])];
    sectionData.splice(index, 1);
    const newData = { ...formData, [sectionId]: sectionData };
    setFormData(newData);
    if (onChange) onChange(newData);
  };

  const validateSection = (sectionIdx: number) => {
    const newErrors: Record<string, string> = {};
    const section = normalizedSchema[sectionIdx];

    if (section.type === 'repeater') {
      // Validação básica para repetidores (pelo menos uma entrada se obrigatório - opcional)
      return true; 
    }

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

      <fieldset key={currentSectionIdx} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 border-none p-0 m-0">
        <legend className="flex items-center gap-2 pb-2 w-full mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-white text-[10px] font-black">
            {currentSectionIdx + 1}
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
            {activeSection.section}
          </span>
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {activeSection.type === 'repeater' ? (
            <div className="md:col-span-2 space-y-6">
              {(formData[activeSection.id || ''] || [{}])?.map((item: any, idx: number) => (
                <div key={idx} className="relative p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Entrada #{idx + 1}</span>
                    <button 
                      onClick={() => removeRepeaterItem(activeSection.id || '', idx)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSection.fields.map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="text-[12px] font-bold text-slate-600 mb-1 block">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={item[field.id] || ''}
                            onFocus={() => setFocusedField(`${field.id}-${idx}`)}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleRepeaterChange(activeSection.id || '', idx, field.id, e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition-all resize-none text-sm ${
                              focusedField === `${field.id}-${idx}` 
                                ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' 
                                : 'focus:border-emerald-500 focus:bg-white'
                            }`}
                            rows={3}
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={item[field.id] || ''}
                            onFocus={() => setFocusedField(`${field.id}-${idx}`)}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleRepeaterChange(activeSection.id || '', idx, field.id, e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition-all text-sm ${
                              focusedField === `${field.id}-${idx}` 
                                ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' 
                                : 'focus:border-emerald-500 focus:bg-white'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => addRepeaterItem(activeSection.id || '')}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all font-bold text-sm"
              >
                <Plus size={18} />
                Adicionar mais um item
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {activeSection.fields?.map((field, index) => {
                // Lógica de Visibilidade Dinâmica:
                // Um campo só aparece se o anterior (se obrigatório) estiver preenchido
                // ou se já houver algum dado nele (caso tenha sido restaurado)
                const prevRequiredFields = activeSection.fields.slice(0, index).filter(f => f.required !== false);
                const allPrevRequiredFilled = prevRequiredFields.every(f => isFieldFilled(f.id));
                const hasValue = isFieldFilled(field.id);
                
                // Sempre mostramos o primeiro campo, campos que já têm valor, 
                // ou o próximo campo disponível após os obrigatórios anteriores estarem prontos
                const isVisible = index === 0 || hasValue || allPrevRequiredFilled;

                if (!isVisible) return null;

                return (
                  <motion.div 
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
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
                              : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'
                          }`}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          id={field.id}
                          value={formData[field.id] || ''}
                          onFocus={() => setFocusedField(field.id)}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          required={field.required !== false}
                          className={`w-full px-4 py-3.5 rounded-2xl border bg-slate-50/30 transition-all outline-none text-slate-900 appearance-none ${
                            errors[field.id] 
                              ? 'border-red-300 bg-red-50/30 focus:border-red-500' 
                              : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'
                          }`}
                        >
                          <option value="" disabled>{field.placeholder || `Selecione ${field.label}`}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
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
                              : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'
                          }`}
                        />
                      )}
                      
                      {focusedField === field.id && !errors[field.id] && (
                        <div className="absolute -inset-[3px] border-2 border-emerald-500/20 rounded-[1.4rem] pointer-events-none animate-in fade-in duration-300" />
                      )}

                      {/* Indicador de Completo */}
                      {hasValue && !focusedField && !errors[field.id] && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300 pointer-events-none">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                    </div>

                    {errors[field.id] && (
                      <span className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                        <Info size={12} />
                        {errors[field.id]}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </fieldset>

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
