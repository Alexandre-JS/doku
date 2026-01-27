"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, CheckCircle2, ShieldCheck, ChevronRight, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FormSection } from "../src/types";

/**
 * Componente interno para gerir a escrita em campos editáveis sem perder o foco/cursor
 */
const EditableField = ({ 
  value, 
  onValueChange, 
  onFocus, 
  onBlur, 
  placeholder, 
  isFocused, 
  hasError,
  className,
  dataPlaceholder
}: any) => {
  const ref = useRef<HTMLSpanElement>(null);

  // Sincroniza o conteúdo apenas quando o campo NÃO tem foco
  // Isso evita que o React "limpe" a posição do cursor enquanto escreves
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value || "";
    }
  }, [value]);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onValueChange(e.currentTarget.textContent || "")}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
      data-placeholder={dataPlaceholder}
    >
      {/* O conteúdo inicial é injetado via ref no useEffect e montagem */}
    </span>
  );
};

interface DocumentInlineEditorProps {
  template: string;
  schema?: FormSection[];
  initialData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onTemplateChange?: (newHtml: string) => void;
  price: string;
  isPaid?: boolean;
  isFree?: boolean; // Adicionado
  onConfirm: () => void;
  title?: string;
}

export default function DocumentInlineEditor({
  template: initialTemplate,
  schema,
  initialData,
  onChange,
  onTemplateChange,
  price,
  isPaid = false,
  isFree: isFreeProp = false, // Renomeado para evitar conflito
  onConfirm,
  title,
}: DocumentInlineEditorProps) {
  const [formData, setFormData] = useState(initialData);
  const [template, setTemplate] = useState(initialTemplate);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsMounted(true);
    setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    setTemplate(initialTemplate);
  }, [initialTemplate]);

  const validateField = (key: string, value: string) => {
    if (key === 'bi_number' || key === 'biNumber') {
      const biRegex = /^\d{12}[A-Z]$/i;
      if (value && !biRegex.test(value)) {
        return "BI inválido (12 números + 1 letra)";
      }
    }
    if (key === 'nuit') {
      const nuitRegex = /^\d{9}$/;
      if (value && !nuitRegex.test(value)) {
        return "NUIT inválido (9 dígitos)";
      }
    }
    return null;
  };

  const handleInputChange = (key: string, value: string) => {
    const error = validateField(key, value);
    setErrors(prev => ({ ...prev, [key]: error || "" }));

    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleRepeaterChange = (sectionId: string, index: number, fieldId: string, value: string) => {
    const sectionData = [...(formData[sectionId] || [])];
    if (!sectionData[index]) sectionData[index] = {};
    sectionData[index] = { ...sectionData[index], [fieldId]: value };
    
    const newData = { ...formData, [sectionId]: sectionData };
    setFormData(newData);
    onChange(newData);
  };

  const addRepeaterItem = (sectionId: string) => {
    const sectionData = [...(formData[sectionId] || []), {}];
    const newData = { ...formData, [sectionId]: sectionData };
    setFormData(newData);
    onChange(newData);
  };

  const removeRepeaterItem = (sectionId: string, index: number) => {
    const sectionData = [...(formData[sectionId] || [])];
    sectionData.splice(index, 1);
    const newData = { ...formData, [sectionId]: sectionData };
    setFormData(newData);
    onChange(newData);
  };

  const cleanPrice = price ? price.toString().replace(/\s*MT/gi, '').trim() : '0';
  const isFree = isFreeProp || cleanPrice === '0' || cleanPrice === '';

  // Helper para buscar config no schema
  const getFieldConfig = (id: string) => {
    if (!schema) return null;
    for (const section of schema) {
      const field = section.fields?.find(f => f.id === id);
      if (field) return field;
    }
    return null;
  };

  /**
   * Converte um nó do DOM para um elemento React, processando variáveis {{key}}
   */
  const domToReact = (node: Node, currentData: any, domPath: string = "", repeaterPath: string = ""): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const segments = text.split(/(\{\{\s*[a-zA-Z0-9_]+\s*\}\})/g);

      return segments.map((segment, idx) => {
        const varMatch = segment.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/);
        if (varMatch) {
          const key = varMatch[1].trim();
          const config = getFieldConfig(key);
          const value = currentData[key] || "";
          const isFocused = focusedField === `${domPath}.${key}`;
          const hasError = errors[key];

          return (
            <span key={`${domPath}-${key}-${idx}`} className="relative inline-block align-baseline group/field">
              {config?.type === 'date' ? (
                <input
                  type="date"
                  value={value}
                  onChange={(e) => {
                    if (repeaterPath) {
                      const [pKey, pIdx] = repeaterPath.replace(']', '').split('[');
                      handleRepeaterChange(pKey, parseInt(pIdx), key, e.target.value);
                    } else {
                      handleInputChange(key, e.target.value);
                    }
                  }}
                  onFocus={() => setFocusedField(`${domPath}.${key}`)}
                  onBlur={() => setFocusedField(null)}
                  className={`
                    min-w-[140px] bg-transparent border-b-2 transition-all duration-300
                    focus:outline-none font-serif text-inherit px-0.5
                    ${value ? 'border-transparent text-blue-900 font-bold' : 'border-slate-200 text-slate-300 italic'}
                    ${isFocused ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02] z-50 rounded-sm' : ''}
                    ${hasError ? 'border-red-400 bg-red-400/10' : ''}
                  `}
                />
              ) : (
                <EditableField
                  value={value}
                  onValueChange={(newValue: string) => {
                    if (repeaterPath) {
                      const [pKey, pIdx] = repeaterPath.replace(']', '').split('[');
                      handleRepeaterChange(pKey, parseInt(pIdx), key, newValue);
                    } else {
                      handleInputChange(key, newValue);
                    }
                  }}
                  onFocus={() => setFocusedField(`${domPath}.${key}`)}
                  onBlur={() => setFocusedField(null)}
                  className={`
                    inline-block min-w-[40px] max-w-full bg-transparent border-b-2 transition-all duration-300
                    focus:outline-none font-serif text-inherit px-0.5 outline-none
                    ${value ? 'border-transparent text-blue-900 font-bold' : 'border-slate-200 text-slate-300 italic'}
                    ${isFocused ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02] z-50 rounded-sm' : ''}
                    ${hasError ? 'border-red-400 bg-red-400/10' : ''}
                    empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:italic
                  `}
                  dataPlaceholder={`[${config?.label || key.replace(/_/g, ' ')}]`}
                />
              )}
            </span>
          );
        }
        
        // Texto Estático: Tornar editável se for um bloco significativo
        return (
          <span 
            key={`${domPath}-static-${idx}`}
            contentEditable={!isPaid}
            suppressContentEditableWarning
            className="hover:bg-slate-50 transition-colors px-0.5 rounded-sm outline-none focus:bg-emerald-50/30"
            onBlur={(e) => {
              // Aqui poderíamos implementar a lógica de atualizar o template,
              // mas requer um mapeamento complexo do HTML. 
              // Por agora, permitimos a edição visual imediata.
            }}
          >
            {segment}
          </span>
        );
      });
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      const attribs: any = {};

      Array.from(el.attributes).forEach(attr => {
        if (attr.name === 'class') {
          attribs.className = attr.value;
        } else if (attr.name === 'style') {
          attribs.style = el.style.cssText;
        } else {
          attribs[attr.name] = attr.value;
        }
      });

      // Recursividade para filhos
      const children = Array.from(node.childNodes).map((child, i) => domToReact(child, currentData, `${domPath}-${i}`, repeaterPath));
      
      return React.createElement(tagName, { ...attribs, key: `${domPath}-${tagName}` }, children);
    }

    return null;
  };

  // Função para renderizar o conteúdo HTML respeitando a árvore do DOM
  const renderRichContent = (html: string, currentData: any = formData, domPath: string = "", repeaterPath: string = "") => {
    if (!html || typeof window === 'undefined') return null;

    // Processar loops antes
    const partsWithLoops = html.split(/(\{\{#\w+\}\}[\s\S]*?\{\{\/\w+\}\})/g);

    return partsWithLoops.map((part, pIdx) => {
      const loopMatch = part.match(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/);
      
      if (loopMatch) {
        const key = loopMatch[1];
        const innerTemplate = loopMatch[2];
        const items = Array.isArray(currentData[key]) ? currentData[key] : [{}];

        return (
          <div key={`loop-${key}-${pIdx}`} className="my-4 p-4 border-2 border-dashed border-slate-100 rounded-2xl relative group/loop">
            <div className="absolute -top-3 left-4 bg-white px-2 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{key.replace(/_/g, ' ')}</span>
              <button 
                type="button"
                onClick={() => addRepeaterItem(key)}
                className="p-1 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="Adicionar item"
              >
                <Plus size={10} />
              </button>
            </div>
            {items.map((item: any, iIdx: number) => (
              <div key={`${key}-${iIdx}`} className="relative mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0 border-slate-50">
                {items.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeRepeaterItem(key, iIdx)}
                    className="absolute -right-2 top-0 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/loop:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                {/* Aqui passamos o repeaterPath para os filhos do loop */}
                {renderRichContent(innerTemplate, item, `${domPath}-${key}-${iIdx}`, `${key}[${iIdx}]`)}
              </div>
            ))}
          </div>
        );
      }

      // Para conteúdo normal, usamos o parser DOM
      const parser = new DOMParser();
      const doc = parser.parseFromString(part, 'text/html');
      return Array.from(doc.body.childNodes).map((node, i) => domToReact(node, currentData, `${domPath}-${pIdx}-${i}`, repeaterPath));
    });
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-slate-50/50">
      
      {/* Container de Escrita Focada */}
      <div className={`w-full flex-1 overflow-y-auto no-scrollbar py-12 px-4 flex justify-center transition-all duration-700 ${focusedField ? 'bg-slate-900/5' : ''}`}>
        
        {/* Folha A4 Principal */}
        <div 
          className={`
            bg-white shadow-2xl relative font-serif border border-slate-200 shrink-0 transition-all duration-500 origin-top
            ${!isPaid && !isFree ? "select-none" : ""} 
            scale-[0.45] sm:scale-[0.65] md:scale-[0.8] lg:scale-[0.9] xl:scale-100
            ${focusedField ? 'shadow-emerald-500/10' : ''}
            doku-document-container
          `}
          style={{
            width: '210mm',
            minHeight: '297mm',
            boxSizing: 'border-box',
            color: '#1a1a1a', 
          }}
        >
          <style>{`
            .doku-document-container { 
              font-family: 'Times New Roman', serif;
              overflow: hidden;
            }
            .doku-document-container .ql-editor { 
              font-size: 14pt; 
              line-height: 1.6;
              padding: 2.5cm 2cm !important;
              min-height: 297mm;
              box-sizing: border-box;
              text-align: justify;
              word-wrap: break-word;
              overflow-wrap: break-word;
              white-space: pre-wrap;
            }
            .doku-document-container .ql-editor p { margin-bottom: 0.5em; }
            .doku-document-container .ql-align-center { text-align: center; }
            .doku-document-container .ql-align-right { text-align: right; }
            .doku-document-container .ql-align-justify { text-align: justify; }
            .doku-document-container strong { font-weight: bold; }
            .doku-document-container em { font-style: italic; }
            .doku-document-container h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
            .doku-document-container h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
          `}</style>
          
          {/* Efeito de Foco/Proteção Documental */}
          <div className={`absolute inset-0 z-0 transition-opacity duration-700 pointer-events-none ${focusedField ? 'opacity-40 blur-[1px]' : 'opacity-0'}`} />

          {/* Marca de Água para visualização não paga */}
          {!isPaid && !isFree && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              <div className="absolute inset-0 flex items-center justify-center rotate-[-45deg] opacity-[0.02]">
                <span className="text-[140px] font-black tracking-widest text-slate-900">DOKUMOZ</span>
              </div>
            </div>
          )}

          {/* Editor Inline */}
          <div className="relative z-10 font-serif antialiased ql-editor">
            {renderRichContent(template)}
          </div>

          {/* Overlay de Proteção (Somente se não pago e não focado em nada importante) */}
          {!isPaid && !isFree && !focusedField && (
            <div className="absolute inset-x-0 bottom-0 top-[45%] z-20 pointer-events-none overflow-hidden">
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[3px] [mask-image:linear-gradient(to_bottom,transparent,black_20%)]" />
               <div className="absolute inset-x-0 bottom-24 flex flex-col items-center justify-center p-10 text-center pointer-events-auto">
                  <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Lock size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black tracking-tight uppercase">Visualização Protegida</p>
                      <p className="text-[11px] text-slate-400">Pague para baixar o original</p>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé de Ações Flutuante (Minimalista) */}
      <footer className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-200 py-6 px-12">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total do Pedido</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{isFree ? '0' : cleanPrice}</span>
              <span className="text-sm font-bold text-slate-500">MT</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider italic">Encriptação de Ponta-a-Ponta</span>
             </div>

             <button 
              onClick={onConfirm}
              className={`group flex items-center gap-3 px-10 h-14 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${
                isFree ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              <span className="tracking-tight">{isFree ? 'Finalizar e Baixar' : 'Confirmar e Pagar'}</span>
              <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                <ChevronRight size={18} />
              </div>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
