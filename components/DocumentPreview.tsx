"use client";

import React from "react";
import { ArrowLeft, Lock, CreditCard } from "lucide-react";

interface DocumentPreviewProps {
  userData: Record<string, string>;
  template: string;
  price: string;
  onBack: () => void;
  onConfirm: () => void;
}

export default function DocumentPreview({
  userData,
  template,
  price,
  onBack,
  onConfirm,
}: DocumentPreviewProps) {
  
  // Função para processar o template e destacar dados do usuário
  const renderPreview = (template: string, userData: Record<string, string>) => {
    // Divide a string nos placeholders {{key}}
    const parts = template.split(/(\{\{[^{}]+\}\})/g);
    
    return parts.map((part, index) => {
      // Verifica se a parte atual é um placeholder
      if (part.startsWith("{{") && part.endsWith("}}")) {
        const key = part.slice(2, -2).trim();
        // Retorna o valor do usuário ou o placeholder original se não encontrado
        return (
          <span key={index} className="text-blue-700 font-bold">
            {userData[key] || part}
          </span>
        );
      }
      // Retorna o texto normal
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-32">
      {/* Top Message */}
      <div className="mx-auto mb-6 max-w-4xl text-center">
        <h2 className="text-xl font-bold text-slate-900">Revise seu documento antes de finalizar</h2>
        <p className="text-sm text-slate-500">Verifique se todas as informações destacadas em azul estão corretas.</p>
      </div>

      {/* Document Container */}
      <div className="relative mx-auto max-w-4xl">
        <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-sm bg-white p-12 shadow-lg sm:p-20">
          
          {/* Watermark Layer */}
          <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-2 grid-rows-5 gap-20 opacity-10 select-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center whitespace-nowrap text-lg font-black rotate-[-35deg] text-slate-400"
              >
                DOKU - PRÉ-VISUALIZAÇÃO
              </div>
            ))}
          </div>

          {/* Document Content Area */}
          <div 
            className="relative z-0 h-full w-full select-none pointer-events-none text-slate-800 leading-relaxed"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <div className="mb-10 text-center">
              <h1 className="text-xl font-bold uppercase tracking-widest border-b-2 border-slate-900 inline-block pb-1">
                Documento Oficial
              </h1>
            </div>

            <div className="whitespace-pre-wrap font-serif text-base sm:text-lg">
              {renderPreview(template, userData)}
            </div>

            <div className="mt-24 flex flex-col items-end opacity-50">
              <div className="h-[1px] w-40 bg-slate-400"></div>
              <p className="mt-1 text-[10px] uppercase tracking-tighter">Assinado Digitalmente via DOKU</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 p-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex h-12 items-center gap-2 rounded-xl px-4 font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Voltar para editar</span>
              <span className="sm:hidden">Voltar</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total a pagar</span>
              <span className="text-xl font-black text-slate-900">{price}</span>
            </div>
          </div>

          <button
            onClick={onConfirm}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
          >
            <Lock size={20} />
            Pagar para Desbloquear PDF
          </button>
        </div>
      </div>
    </div>
  );
}
