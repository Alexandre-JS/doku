"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";

interface FloatingSuggestionProps {
  onClick: () => void;
}

export default function FloatingSuggestion({ onClick }: FloatingSuggestionProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative flex w-full max-w-sm cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl transition-all hover:shadow-doku-green/10 sm:max-w-[320px]"
    >
      <div className="relative p-3 sm:p-4" onClick={onClick}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute right-2 top-2 rounded-full p-1 text-slate-300 hover:bg-slate-50 hover:text-slate-500"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-doku-green/10 text-doku-green sm:h-10 sm:w-10">
            <Sparkles size={16} className="animate-pulse sm:size-[20px]" />
          </div>
          <div className="pr-3 sm:pr-4">
            <p className="text-[11px] font-bold text-doku-blue sm:text-xs">Não encontrou o que precisava?</p>
            <p className="mt-1 text-[9px] leading-relaxed text-slate-500 sm:text-[10px]">
              Diga-nos qual modelo você gostaria de ver aqui e nós criamos para você.
            </p>
          </div>
        </div>
        
        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-doku-green sm:mt-3 sm:text-[10px]">
          <span>Sugerir Novo Modelo</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.span>
        </div>
      </div>
      
      {/* Progress bar decorativa */}
      <div className="h-1 w-full bg-slate-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2 }}
          className="h-full bg-doku-green/30"
        />
      </div>
    </motion.div>
  );
}
