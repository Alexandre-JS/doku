"use client";

import React from "react";
import { ArrowLeft, Lock } from "lucide-react";

interface DocumentPreviewProps {
  userData: Record<string, string>;
  template: string;
  price: string;
  onBack: () => void;
  onConfirm: () => void;
  hideControls?: boolean;
  isReadOnly?: boolean;
  title?: string;
  layoutType?: 'OFFICIAL' | 'DECLARATION' | 'LETTER';
}

export default function DocumentPreview({
  userData,
  template,
  price,
  onBack,
  onConfirm,
  hideControls = false,
  isReadOnly = false,
  title,
  layoutType: propLayoutType,
}: DocumentPreviewProps) {
  
  const effectiveHideControls = hideControls || isReadOnly;
  
  // Inferir o layout se não for passado explicitamente
  const layoutType = propLayoutType || (
    title?.toLowerCase().includes('requerimento') ? 'OFFICIAL' :
    (title?.toLowerCase().includes('declaração') || title?.toLowerCase().includes('compromisso')) ? 'DECLARATION' :
    (title?.toLowerCase().includes('carta') || title?.toLowerCase().includes('manifestação')) ? 'LETTER' :
    'OFFICIAL' // Default
  );

  // Função para processar o template e destacar dados do usuário com formatação
  const renderPreviewHTML = (html: string, userData: Record<string, string>) => {
    if (!html) return "";
    
    // Substitui cada placeholder {{key}} pelo valor formatado
    let processedHTML = html;
    const matches = html.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || [];
    
    matches.forEach(match => {
      const key = match.replace(/\{\{\s*|\s*\}\}/g, "").trim();
      const value = userData[key] || 
                    userData[key.toLowerCase()] || 
                    userData[key.replace(/([A-Z])/g, "_$1").toLowerCase()] || 
                    userData[key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())];

      const replacement = `
        <span class="text-blue-800 font-bold border-b border-blue-200 decoration-blue-200">
          ${value || `[${key.toUpperCase()}]`}
        </span>
      `;
      
      processedHTML = processedHTML.replaceAll(match, replacement);
    });
    
    return processedHTML;
  };

  // Detecta se o template já inclui placeholders ou texto formal para cabeçalho/rodapé
  const plainText = typeof template === 'string' ? template.replace(/<[^>]*>/g, '') : '';
  
  const templateHasHeader = typeof template === 'string' && (
    /\{\{\s*(target_authority|destinatary_role|institution_name|target_location|address|subject)\s*\}\}/i.test(template) ||
    /EXMO|EXCELENTÍSSIMO|ILUSTRÍSSIMO|SENHOR|DIRECTOR/i.test(plainText.substring(0, 200).toUpperCase())
  );

  const templateHasFooter = typeof template === 'string' && (
    /\{\{\s*(current_city|current_date|target_location)\s*\}\}/i.test(template) ||
    /Pede\s*Deferimento|ASSINATURA|DECLARANTE|REQUERENTE/i.test(plainText.substring(plainText.length - 300).toUpperCase())
  );

  // Verifica se o template já começa com um título (ex: REQUERIMENTO, DECLARAÇÃO)
  const hasTitleInContent = typeof template === 'string' && 
    /^\s*(REQUERIMENTO|DECLARAÇÃO|COMPROMISSO|CONTRATO|CERTIDÃO|GUIA|EDITAL)/i.test(plainText.trim());

  // Verifica se é uma declaração ou contrato (que não levam "Exmo Senhor" ou "Assunto" automático)
  const isDeclarationOrContract = hasTitleInContent && !plainText.trim().toUpperCase().startsWith('REQUERIMENTO') ||
    title?.toLowerCase().includes('declaração') || 
    title?.toLowerCase().includes('compromisso') ||
    title?.toLowerCase().includes('contrato');

  const getValue = (key: string) => {
    return userData[key] || 
           userData[key.toLowerCase()] || 
           userData[key.replace(/([A-Z])/g, "_$1").toLowerCase()] || 
           userData[key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())];
  };

  return (
    <div className={`flex flex-col items-center w-full h-full ${effectiveHideControls ? "bg-transparent p-0" : "bg-transparent pb-10"}`}>
      
      {/* Container de Escalonamento Inteligente com Scroll Interno */}
      <div className={`w-full flex-1 flex justify-center p-4 sm:p-6 overflow-y-auto no-scrollbar ${!effectiveHideControls ? "bg-slate-100/30 rounded-[2.5rem]" : ""}`}>
        <div 
          className="bg-white shadow-[0_50px_100px_rgba(0,0,0,0.12)] relative origin-top scale-[0.45] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] xl:scale-[0.98] transition-all duration-700 font-serif border border-slate-100 mb-4 shrink-0"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '25mm 22mm 20mm 25mm', 
            lineHeight: '1.6',
            color: '#1e293b', 
          }}
        >
        {/* Marca de Água Profissional - Repetida e atrás do texto */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-[0.04]">
          <div className="absolute inset-[-50%] flex flex-wrap items-center justify-center content-center rotate-[-30deg]">
            {Array(120).fill(null).map((_, i) => (
              <span key={i} className="m-10 text-4xl font-black tracking-widest whitespace-nowrap text-slate-900">
                DOKU PREVIEW
              </span>
            ))}
          </div>
        </div>

        {/* LAYOUT: LETTER & OFFICIAL - Data no Topo Direito (Estilo mais comum) */}
        {(layoutType === 'LETTER' || layoutType === 'OFFICIAL') && (
          <div className="mb-12 text-right text-[12pt] font-medium italic relative z-10">
            {getValue('current_city') || getValue('target_location') || "Maputo"}, aos {getValue('current_date') || new Date().toLocaleDateString('pt-PT')}
          </div>
        )}

        {/* Cabeçalho de Endereçamento (OFFICIAL e LETTER) */}
        {(layoutType === 'OFFICIAL' || layoutType === 'LETTER') && !templateHasHeader && !isDeclarationOrContract && (
          <div className="mb-10 text-[12pt] relative z-10 text-left">
            <p className="font-bold uppercase leading-tight italic">Exmo(a) Senhor(a)</p>
            <p className="font-bold uppercase leading-tight">{getValue('destinatary_role') || getValue('target_authority') || '________________'}</p>
            <p className="font-bold uppercase leading-tight">{getValue('institution_name') || ''}</p>
            
            <p className="mt-8 font-bold uppercase underline underline-offset-4">
              {getValue('target_location') || getValue('address') || "MAPUTO"}
            </p>

            {/* Assunto logo abaixo para ambos */}
            {(getValue('subject') || title) && (
              <div className="mt-10 font-bold uppercase">
                <span className="underline underline-offset-4">Assunto: {getValue('subject') || title}</span>
              </div>
            )}
          </div>
        )}

        {/* Título para DECLARATION */}
        {layoutType === 'DECLARATION' && !templateHasHeader && (
          <div className="mb-12 text-center text-[14pt] font-bold uppercase underline relative z-10">
            {title || "DECLARAÇÃO"}
          </div>
        )}

        {/* Corpo do Texto - Suporta HTML do Quill */}
        <div 
          className={`text-[12pt] text-justify relative z-10 official-document-content ${layoutType === 'OFFICIAL' ? 'indent-12' : ''}`}
          dangerouslySetInnerHTML={{ __html: renderPreviewHTML(template, userData) }}
        />

        {/* Fecho: Pede Deferimento (Só OFFICIAL) */}
        {layoutType === 'OFFICIAL' && !templateHasFooter && (
          <div className="mt-12 text-center text-[12pt] relative z-10">
            Pede deferimento.
          </div>
        )}

        {/* Local e Data (OFFICIAL e DECLARATION) */}
        {(layoutType === 'OFFICIAL' || layoutType === 'DECLARATION') && !templateHasFooter && (
          <div className="mt-12 text-[12pt] text-center relative z-10">
            {getValue('current_city') || getValue('target_location') || "__________"}, aos {getValue('current_date') || new Date().toLocaleDateString('pt-PT')}.
          </div>
        )}

        {/* Linha de Assinatura */}
        {!templateHasFooter && (
          <div className="mt-8 flex flex-col items-center relative z-10">
            <p className="text-[12pt] font-bold uppercase mb-8">{getValue('full_name') || ''}</p>
            <div className="w-64 border-t border-black mb-2"></div>
            <p className="text-[10pt] text-slate-500">
              {layoutType === 'DECLARATION' ? '(Assinatura do Declarante)' : '(Assinatura do Requerente)'}
            </p>
          </div>
        )}
      </div>
      </div>

      {/* Seção Final de Ações */}
      {!effectiveHideControls && (
        <div className="mt-12 mb-20 w-full max-w-3xl px-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_30px_60px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total a Pagar</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{price.replace(' MT', '')}</span>
                  <span className="text-sm font-bold text-slate-500">MT</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={onBack}
                  className="w-full sm:w-auto px-8 h-12 rounded-xl border border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Editar
                </button>
                <button 
                  onClick={onConfirm}
                  className="w-full sm:w-auto px-10 h-12 rounded-xl bg-slate-900 font-bold text-white shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Lock size={16} />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
