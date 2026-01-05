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
  const renderPreview = (template: string, userData: Record<string, string>) => {
    if (!template) return null;
    
    // Divide o template nos placeholders {{key}}
    const parts = template.split(/(\{\{[^{}]+\}\})/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        const key = part.slice(2, -2).trim();
        
        // Tenta encontrar o valor, suportando variações de camelCase e snake_case
        const value = userData[key] || 
                      userData[key.toLowerCase()] || 
                      userData[key.replace(/([A-Z])/g, "_$1").toLowerCase()] || // biNumber -> bi_number
                      userData[key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())]; // bi_number -> biNumber

        // Pulo do Gato: Se for request_details, aplicamos uma formatação mais formal
        if (key === 'request_details' || key === 'requestDetails') {
          return (
            <span key={index} className="text-blue-800 font-medium italic whitespace-pre-wrap">
              {value || `[${key.toUpperCase()}]`}
            </span>
          );
        }

        return (
          <span key={index} className="text-blue-800 font-bold border-b border-blue-200">
            {value || `[${key.toUpperCase()}]`}
          </span>
        );
      }
      return part;
    });
  };

  // Detecta se o template já inclui placeholders para cabeçalho/rodapé
  const templateHasHeaderPlaceholders = typeof template === 'string' && /\{\{\s*(target_authority|destinatary_role|institution_name|target_location|address|subject)\s*\}\}/i.test(template);
  const templateHasFooterPlaceholders = typeof template === 'string' && /\{\{\s*(current_city|current_date|target_location)\s*\}\}/i.test(template);

  // Verifica se o template já começa com um título (ex: REQUERIMENTO, DECLARAÇÃO)
  const hasTitleInContent = typeof template === 'string' && 
    /^\s*(REQUERIMENTO|DECLARAÇÃO|COMPROMISSO|CONTRATO|CERTIDÃO|GUIA|EDITAL)/i.test(template.trim());

  // Verifica se é uma declaração ou contrato (que não levam "Exmo Senhor" ou "Assunto" automático)
  const isDeclarationOrContract = hasTitleInContent && !template.trim().toUpperCase().startsWith('REQUERIMENTO') ||
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
    <div className={`flex flex-col items-center ${effectiveHideControls ? 'bg-transparent p-0' : 'bg-slate-100 p-8 pb-32 min-h-screen'}`}>
      {!effectiveHideControls && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">
            Revisão do Documento
            {title && (
              <span className="ml-2 text-slate-500 font-semibold">— {title}</span>
            )}
          </h2>
          <p className="text-sm text-slate-500">Verifique se as margens e os dados estão corretos.</p>
        </div>
      )}

      {/* Simulador de Papel A4 */}
      <div 
        className="bg-white shadow-2xl relative overflow-hidden mx-auto"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '30mm 20mm 20mm 30mm', // Margens oficiais
          fontFamily: '"Times New Roman", Times, serif',
          lineHeight: '1.5',
          color: '#1e293b' // slate-800
        }}
      >
        {/* Marca de Água */}
        <div className="absolute inset-0 flex flex-wrap justify-center items-center opacity-[0.04] pointer-events-none rotate-[-45deg] select-none text-6xl font-black z-10">
           {Array(20).fill("DOKU PREVIEW ").join(" ")}
        </div>

        {/* LAYOUT: LETTER - Data no Topo Direito */}
        {layoutType === 'LETTER' && (
          <div className="mb-8 text-right text-[12pt]">
            {getValue('target_location') || "Maputo"}, {new Date().toLocaleDateString('pt-PT')}
          </div>
        )}

        {/* Cabeçalho de Endereçamento (OFFICIAL e LETTER) */}
        {(layoutType === 'OFFICIAL' || layoutType === 'LETTER') && !templateHasHeaderPlaceholders && !isDeclarationOrContract && (
          <div className="mb-12 text-[12pt] relative z-0">
            <p className="font-bold">Exmo Senhor {getValue('destinatary_role') || getValue('target_authority') || '________________'}</p>
            <p className="font-bold uppercase">{getValue('institution_name') || '________________'}</p>
            <p className="underline">{getValue('target_location') || getValue('address') || '________________'}</p>
          </div>
        )}

        {/* LAYOUT: LETTER - Saudação */}
        {layoutType === 'LETTER' && (
          <div className="mb-6 text-[12pt]">
            Exmo. Senhor,
          </div>
        )}

        {/* Assunto (Só OFFICIAL) */}
        {layoutType === 'OFFICIAL' && !templateHasHeaderPlaceholders && !hasTitleInContent && (
          <div className="mb-8 text-center text-[13pt] font-bold uppercase underline relative z-0">
            Assunto: {getValue('subject') || "Requerimento Geral"}
          </div>
        )}

        {/* Título para DECLARATION */}
        {layoutType === 'DECLARATION' && (
          <div className="mb-12 text-center text-[14pt] font-bold uppercase underline relative z-0">
            {title || "DECLARAÇÃO"}
          </div>
        )}

        {/* Corpo do Texto */}
        <div className={`text-[12pt] text-justify whitespace-pre-line relative z-0 ${layoutType === 'OFFICIAL' ? 'indent-12' : ''}`}>
          {renderPreview(template, userData)}
        </div>

        {/* Fecho: Pede Deferimento (Só OFFICIAL) */}
        {layoutType === 'OFFICIAL' && (
          <div className="mt-12 text-center text-[12pt] font-bold italic">
            Pede Deferimento.
          </div>
        )}

        {/* Fecho: Atenciosamente (Só LETTER) */}
        {layoutType === 'LETTER' && (
          <div className="mt-12 text-[12pt]">
            Com os melhores cumprimentos,
          </div>
        )}

        {/* Local e Data (OFFICIAL e DECLARATION) */}
        {(layoutType === 'OFFICIAL' || layoutType === 'DECLARATION') && !templateHasFooterPlaceholders && (
          <div className="mt-16 text-[12pt] text-center relative z-0">
            {getValue('target_location') || "Maputo"}, {new Date().toLocaleDateString('pt-PT')}
          </div>
        )}

        {/* Linha de Assinatura */}
        <div className="mt-20 flex flex-col items-center relative z-0">
          <div className="w-64 border-t border-black mb-2"></div>
          <p className="text-[12pt] font-bold uppercase">{getValue('full_name') || '________________'}</p>
          <p className="text-[10pt] text-slate-500">
            {layoutType === 'DECLARATION' ? '(Assinatura do Declarante)' : '(Assinatura do Requerente)'}
          </p>
        </div>
      </div>

      {/* Botões de Ação Fixos na Base */}
      {!effectiveHideControls && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-center items-center gap-6 shadow-inner z-50">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total a pagar</span>
            <span className="text-xl font-black text-slate-900">{price} MT</span>
          </div>
          
          <button 
            onClick={onBack}
            className="px-8 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Voltar a Editar
          </button>
          
          <button 
            onClick={onConfirm}
            className="px-12 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Lock size={18} />
            Confirmar e Gerar
          </button>
        </div>
      )}
    </div>
  );
}
