"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, Zap } from "lucide-react";

export default function ApliteFloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já fechou nesta sessão
    const closed = localStorage.getItem("aplite_cta_closed");
    if (closed) return;

    // Mostrar após 3 segundos para não sobrecarregar o usuário imediatamente
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    setIsClosed(true);
    localStorage.setItem("aplite_cta_closed", "true");
  };

  if (isClosed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="aplite-desktop"
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          className="fixed right-6 top-1/2 z-[90] hidden w-full max-w-[300px] -translate-y-1/2 lg:block"
        >
          <div className="group relative overflow-hidden rounded-3xl bg-indigo-600 p-5 shadow-2xl shadow-indigo-500/40 divide-y divide-white/10">
            {/* Botão Fechar */}
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={14} />
            </button>

            <a 
              href="https://aplite.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="pb-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-300 text-indigo-900">
                    <Sparkles size={18} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">
                    Destaque Profissional
                  </span>
                </div>
                
                <h4 className="text-sm font-bold leading-snug text-white">
                  Quer um Currículo Imbatível? <span className="text-yellow-300">A Aplite ajuda-te.</span>
                </h4>
                <p className="mt-2 text-xs text-indigo-100/80">
                  Analisa o teu CV com IA e aumenta as tuas chances de contratação hoje.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 text-xs font-bold text-white">
                <span className="flex items-center gap-1">
                  Otimizar Agora
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="flex h-6 items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[9px] uppercase">
                  <Zap size={10} fill="currentColor" className="text-yellow-300" />
                  Grátis
                </div>
              </div>
            </a>

            {/* Background Effect */}
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
          </div>

          {/* Versão mobile simplificada (opcional, mas o usuário pediu para não ocupar toda página) */}
        </motion.div>
      )}
      
      {/* Mobile Version (Compact) */}
      {isVisible && (
        <motion.div
           key="aplite-mobile"
           initial={{ x: 100 }}
           animate={{ x: 0 }}
           exit={{ x: 100 }}
           className="fixed right-4 top-1/2 z-[90] w-[200px] -translate-y-1/2 lg:hidden"
        >
          <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-3 shadow-xl border border-white/10">
             <button
                onClick={handleClose}
                className="absolute right-1.5 top-1.5 text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
              <a 
                href="https://aplite.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-yellow-300 text-indigo-900">
                     <Zap size={14} fill="currentColor" />
                  </div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-tight">IA na Aplite</h4>
                </div>
                <p className="text-[11px] leading-tight font-medium text-indigo-100">Otimiza teu CV agora 🚀</p>
              </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
