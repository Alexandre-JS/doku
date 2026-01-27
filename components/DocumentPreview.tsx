"use client";

import React from "react";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";

interface DocumentPreviewProps {
  userData: Record<string, any>;
  template: string;
  price: string;
  onBack: () => void;
  onConfirm: () => void;
  hideControls?: boolean;
  isReadOnly?: boolean;
  title?: string;
  layoutType?: 'OFFICIAL' | 'DECLARATION' | 'LETTER';
  isPaid?: boolean;
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
  isPaid = false,
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
  const renderPreviewHTML = (html: string, userData: Record<string, any>) => {
    if (!html) return "";
    
    let processedHTML = html;

    // 1. Processar Loops {{#key}} ... {{/key}}
    const loopRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
    processedHTML = processedHTML.replace(loopRegex, (match, key, content) => {
      const list = userData[key];
      if (Array.isArray(list)) {
        return list.map(item => {
          let itemContent = content;
          for (const k in item) {
            const r = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g');
            itemContent = itemContent.replace(r, `<span class="text-blue-800 font-bold border-b border-blue-200">${item[k] || "..."}</span>`);
          }
          return itemContent;
        }).join("");
      }
      return "";
    });

    // 2. Processar variáveis simples
    const matches = processedHTML.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || [];
    
    matches.forEach(match => {
      const key = match.replace(/\{\{\s*|\s*\}\}/g, "").trim();
      const value = userData[key];

      if (typeof value === 'string' || typeof value === 'number') {
        const replacement = `
          <span class="text-blue-800 font-bold border-b border-blue-200 decoration-blue-200">
            ${value || `[${key.toUpperCase()}]`}
          </span>
        `;
        processedHTML = processedHTML.replaceAll(match, replacement);
      }
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
  const cleanPrice = price ? price.toString().replace(/\s*MT/gi, '').trim() : '0';
  const isFree = cleanPrice === '0' || cleanPrice === '';
  const getValue = (key: string) => {
    return userData[key] || 
           userData[key.toLowerCase()] || 
           userData[key.replace(/([A-Z])/g, "_$1").toLowerCase()] || 
           userData[key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())];
  };

  return (
    <div className={`flex flex-col items-center w-full h-full ${effectiveHideControls ? "bg-white" : "bg-slate-50/50"}`}>
      
      {/* Container do Documento com Scroll */}
      <div className="w-full flex-1 overflow-y-auto no-scrollbar py-4 px-2 sm:px-6 flex justify-center">
        
        {/* A4 Document Wrapper */}
        <div 
          className={`bg-white shadow-xl relative font-serif border border-slate-200 shrink-0 transition-transform duration-500 origin-top ${
            !isPaid && !isFree ? "select-none" : ""
          } scale-[0.4] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.85] xl:scale-100`}
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '30mm 25mm', 
            boxSizing: 'border-box',
            lineHeight: '1.5',
            color: '#1a1a1a', 
          }}
        >
          {/* Marca de Água Simplificada */}
          {!isPaid && !isFree && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              <div className="absolute inset-0 flex items-center justify-center rotate-[-45deg] opacity-[0.03]">
                <span className="text-[120px] font-black tracking-tighter whitespace-nowrap text-slate-900">
                  DOKUMOZ
                </span>
              </div>
            </div>
          )}

          {/* Conteúdo do Documento */}
          <div 
            className="text-[12pt] text-justify relative z-10"
            style={{ 
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              fontFamily: 'Times New Roman, serif'
            }}
            dangerouslySetInnerHTML={{ __html: renderPreviewHTML(template, userData) }}
          />

          {/* Overlay de Proteção Minimalista */}
          {!isPaid && !isFree && (
            <div className="absolute inset-x-0 bottom-0 top-[40%] z-20 pointer-events-none overflow-hidden">
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] [mask-image:linear-gradient(to_bottom,transparent,black_20%)]" />
               <div className="absolute inset-x-0 bottom-20 flex flex-col items-center justify-center p-10 text-center pointer-events-auto">
                  <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
                    <Lock size={18} className="text-emerald-400" />
                    <span className="text-sm font-bold tracking-tight">Efectue o pagamento para desbloquear</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Ações (Apenas se não for ReadOnly/Review) */}
      {!effectiveHideControls && (
        <div className="w-full border-t border-slate-200 bg-white p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total a Pagar</p>
              <div className="flex items-baseline gap-1">
                {isFree ? (
                  <span className="text-3xl font-black text-emerald-600">Grátis</span>
                ) : (
                  <>
                    <span className="text-3xl font-black text-slate-900">{cleanPrice}</span>
                    <span className="text-sm font-bold text-slate-500">MT</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={onBack}
                className="flex-1 sm:flex-none px-6 h-11 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                Editar
              </button>
              <button 
                onClick={onConfirm}
                className={`flex-1 sm:flex-none px-8 h-11 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  isFree ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {isFree ? (
                  <>
                    <CheckCircle2 size={16} />
                    Download Grátis
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Pagar e Baixar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
