"use client";

import { ArrowRight, Briefcase, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ApliteBanner() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-20 lg:mb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#4338ca] p-8 sm:p-12 shadow-2xl shadow-indigo-500/20"
      >
        {/* Decorative Elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
              <Sparkles size={14} className="text-yellow-300" />
              Novo Parceiro de Carreira
            </div>
            
            <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl lg:max-w-xl">
              Seu Currículo está <span className="text-yellow-300 italic">Destaque</span> no mercado?
            </h2>
            
            <p className="mt-6 text-lg text-indigo-100 sm:text-xl lg:max-w-2xl">
              Utilize a Inteligência Artificial da <strong>Aplite</strong> para analisar e otimizar seu CV para cada vaga. Vá além do DOKU e conquiste sua vaga dos sonhos.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <a 
                href="https://aplite.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-black text-[#4f46e5] transition-all hover:scale-105 hover:bg-yellow-300 hover:text-indigo-950 shadow-xl shadow-black/10"
              >
                Analisar meu CV Grátis
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </a>
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-200">
                <Zap size={16} className="text-yellow-300" fill="currentColor" />
                DOKU + APLITE
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="flex h-64 w-64 items-center justify-center rounded-[3rem] bg-indigo-400/20 backdrop-blur-sm border border-white/20 p-8 shadow-inner shadow-white/10">
              <div className="relative">
                <Briefcase size={100} className="text-white drop-shadow-2xl" />
                <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300 text-indigo-950 shadow-lg animate-bounce">
                  <Zap size={20} fill="currentColor" />
                </div>
              </div>
            </div>
            {/* Float badges */}
            <div className="absolute -left-10 top-10 rotate-[-12deg] rounded-2xl bg-white p-3 text-xs font-bold text-indigo-600 shadow-xl">
              AI Powered ⚡️
            </div>
            <div className="absolute -right-6 bottom-10 rotate-[12deg] rounded-2xl bg-indigo-950 p-3 text-xs font-bold text-white shadow-xl border border-white/10">
              Carreira 🚀
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
