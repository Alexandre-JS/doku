"use client";

import React from "react";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";

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
  const cleanPrice = price ? price.toString().replace(/\s*MT/gi, '').trim() : '0';
  const isFree = cleanPrice === '0' || cleanPrice === '';
  const getValue = (key: string) => {
    return userData[key] || 
           userData[key.toLowerCase()] || 
           userData[key.replace(/([A-Z])/g, "_$1").toLowerCase()] || 
           userData[key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())];
  };

  return (
    <div className={`flex flex-col items-center w-full h-full ${effectiveHideControls ? "bg-transparent p-0" : "bg-transparent pb-10"}`}>
      
      {/* Container de Escalonamento Inteligente com Scroll Interno */}
      <div className={`w-full flex-1 flex justify-center p-4 sm:p-8 overflow-y-auto overflow-x-hidden no-scrollbar ${!effectiveHideControls ? "bg-slate-100/40 rounded-[2.5rem]" : ""}`}>
        
        {/* Wrapper do Escalonamento: Resolve o problema de "Folha esticada" */}
        <div className="flex justify-center w-full min-h-min py-6 sm:py-10">
          <div 
            className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative origin-top scale-[0.38] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] xl:scale-[0.95] 2xl:scale-100 transition-all duration-700 font-serif border border-slate-200 shrink-0"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '25mm 22mm 20mm 25mm', 
              boxSizing: 'border-box',
              lineHeight: '1.6',
              color: '#1e293b', 
            }}
          >
          {/* Marca de Água Profissional */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-[0.03]">
            <div className="absolute inset-[-50%] flex flex-wrap items-center justify-center content-center rotate-[-30deg]">
              {Array(80).fill(null).map((_, i) => (
                <span key={i} className="m-12 text-3xl font-black tracking-widest whitespace-nowrap text-slate-800 uppercase">
                  DOKU PREVIEW
                </span>
              ))}
            </div>
          </div>

          {/* Corpo do Texto - Agora ÚNICA fonte de verdade */}
          <div 
            className="text-[12pt] text-justify relative z-10 official-document-content"
            style={{ 
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: renderPreviewHTML(template, userData) }}
          />

          </div>
        </div>
      </div>

      {/* Seção Final de Ações */}
      {!effectiveHideControls && (
        <div className="mt-12 mb-20 w-full max-w-3xl px-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_30px_60px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {isFree ? "Acesso ao Modelo" : "Total a Pagar"}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  {isFree ? (
                    <span className="text-4xl font-black text-emerald-600">Grátis</span>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-slate-900">{cleanPrice}</span>
                      <span className="text-sm font-bold text-slate-500">MT</span>
                    </>
                  )}
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
                  className={`w-full sm:w-auto px-10 h-12 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    isFree ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {isFree ? (
                    <>
                      <CheckCircle2 size={16} />
                      Baixar PDF Grátis
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
