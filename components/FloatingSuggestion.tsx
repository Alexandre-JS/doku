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
      className="relative flex w-full max-w-[320px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl transition-all hover:shadow-doku-green/10"
    >
      <div className="relative p-4" onClick={onClick}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute right-2 top-2 rounded-full p-1 text-slate-300 hover:bg-slate-50 hover:text-slate-500"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-doku-green/10 text-doku-green">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div className="pr-4">
            <p className="text-xs font-bold text-doku-blue">Não encontrou o que precisava?</p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              Diga-nos qual modelo você gostaria de ver aqui e nós criamos para você.
            </p>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-doku-green">
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
