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
    <div 
      className={`flex flex-col items-center w-full h-full ${effectiveHideControls ? "bg-transparent p-0" : "bg-transparent pb-10"} select-none`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`
        .protect-document-content {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          pointer-events: none !important;
        }
        @media print {
          .no-print { display: none !important; }
        }
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          padding: 2.5cm 2cm !important;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.05);
          font-family: 'Times New Roman', serif;
          font-size: 14pt;
          line-height: 1.6;
          text-align: justify;
          word-wrap: break-word;
          box-sizing: border-box;
          position: relative;
        }
        @media (max-width: 210mm) {
          .a4-page {
            width: 100%;
            height: auto;
            padding: 1cm !important;
          }
        }
      `}</style>
      
      {/* Container de Visualização Direta */}
      <div className={`w-full flex-1 flex flex-col items-center py-4 overflow-y-auto no-scrollbar`}>
        
        {/* Folha A4 em Tamanho Real/Normal */}
        <div className="a4-page border border-slate-100 relative bg-white sm:mb-20">
          {/* Marca de Água Profissional - Posicionamento Centralizado e Fixo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 flex items-center justify-center">
            <div className="rotate-[-45deg] opacity-[0.03] select-none pointer-events-none">
              <span className="text-[120px] font-black tracking-[0.2em] text-slate-900 whitespace-nowrap">
                DOKUMOZ
              </span>
            </div>
          </div>

          {/* Corpo do Texto - Experiência de Folha Limpa */}
          <div 
            className="relative z-10 official-document-content protect-document-content"
            style={{ 
              color: '#1a1a1a'
            }}
            dangerouslySetInnerHTML={{ __html: renderPreviewHTML(template, userData) }}
          />

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
