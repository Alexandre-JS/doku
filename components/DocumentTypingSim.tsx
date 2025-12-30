"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const DOCUMENTS = [
  {
    id: "requerimento",
    parts: [
      { text: "EXMO. SENHOR DIRECTOR DO INSTITUTO NACIONAL DE TRANSPORTES TERRESTRES", align: "justify", bold: true },
      { text: "\n\n", align: "left" },
      { text: "Maputo", align: "right", bold: true },
      { text: "\n\n", align: "left" },
      { text: "Eu, Alexandre José da Silva, de nacionalidade Moçambicana, portador do BI nº 110100234567M, residente no Bairro da Polana Caniço B, venho mui respeitosamente requerer a V. Excia se digne autorizar a renovação da minha carta de condução...", align: "justify", bold: false }
    ]
  },
  {
    id: "declaracao",
    parts: [
      { text: "DECLARAÇÃO DE COMPROMISSO DE HONRA", align: "center", bold: true },
      { text: "\n\n", align: "left" },
      { text: "Eu, Maria Lurdes dos Santos, solteira, maior, natural de Xai-Xai, residente em Maputo, declaro por minha honra que nunca fui condenada em processo-crime por factos que constituam crime contra o Estado, nem por factos que...", align: "justify", bold: false }
    ]
  },
  {
    id: "contrato",
    parts: [
      { text: "CONTRATO DE ARRENDAMENTO", align: "center", bold: true },
      { text: "\n\n", align: "left" },
      { text: "Entre: João Manuel, na qualidade de Senhorio, e Pedro Augusto, na qualidade de Arrendatário, é celebrado o presente contrato que se rege pelas cláusulas seguintes: O imóvel situa-se na Av. Eduardo Mondlane, nº 123...", align: "justify", bold: false }
    ]
  }
];

export default function DocumentTypingSim() {
  const [docIndex, setDocIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentDoc = DOCUMENTS[docIndex];
  const fullText = currentDoc.parts.map(p => p.text).join("");

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charCount < fullText.length) {
      const nextChar = fullText[charCount];
      const delay = nextChar === " " ? 15 : nextChar === "." || nextChar === "," ? 150 : 30;
      
      timeout = setTimeout(() => {
        setCharCount(prev => prev + 1);
      }, delay);
    } else if (!isDeleting && charCount === fullText.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 4000);
    } else if (isDeleting) {
      setCharCount(0);
      setIsDeleting(false);
      setDocIndex((prev) => (prev + 1) % DOCUMENTS.length);
    }

    return () => clearTimeout(timeout);
  }, [charCount, isDeleting, docIndex, fullText]);

  // Helper to get displayed text for each part
  const getPartContent = (partIndex: number) => {
    let offset = 0;
    for (let i = 0; i < partIndex; i++) {
      offset += currentDoc.parts[i].text.length;
    }
    
    const partText = currentDoc.parts[partIndex].text;
    const start = Math.max(0, charCount - offset);
    return partText.slice(0, start);
  };

  return (
    <div className="relative flex items-center justify-center p-4 sm:p-8">
      {/* A4 Sheet Mockup */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative aspect-[1/1.414] w-full max-w-[280px] bg-white p-6 shadow-2xl ring-1 ring-slate-200"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Document Content */}
        <div className="h-full overflow-hidden text-[8px] leading-[1.5] text-slate-800 sm:text-[9px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={docIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              {currentDoc.parts.map((part, idx) => {
                const content = getPartContent(idx);
                if (!content && idx > 0 && getPartContent(idx-1).length < currentDoc.parts[idx-1].text.length) return null;
                
                const isLastActivePart = content.length > 0 && content.length < part.text.length;
                const isEndOfDoc = idx === currentDoc.parts.length - 1 && content.length === part.text.length;

                return (
                  <div 
                    key={idx} 
                    className={`whitespace-pre-wrap ${part.bold ? 'font-bold' : ''}`}
                    style={{ 
                      textAlign: part.align as any,
                    }}
                  >
                    {content}
                    {(isLastActivePart || (isEndOfDoc && !isDeleting)) && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="ml-0.5 inline-block h-3 w-[1px] bg-doku-blue align-middle"
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decorative elements to look like a real app */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-doku-blue/10" />
      </motion.div>

      {/* Background decorative circles */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-doku-blue/5 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-doku-green/5 blur-3xl" />
    </div>
  );
}
