"use client";

import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";
import { Suspense } from "react";
import SearchBar from "./SearchBar";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 lg:py-32">
      {/* Geometric Pattern Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20" 
        style={{ 
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800" />
      
      {/* Radial Light Effects */}
      <div className="absolute left-1/2 top-1/2 z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-doku-green/10 blur-[120px]" />
      <div className="absolute right-0 top-0 z-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Side: Search & Content */}
          <div className="relative z-10 flex flex-col items-start lg:z-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center rounded-full bg-doku-green/10 px-4 py-1.5 text-sm font-medium text-doku-green ring-1 ring-doku-green/20"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Inteligência Artificial para seus documentos
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-black tracking-tight text-white sm:text-6xl"
            >
              O que você quer <br />
              <span className="text-doku-green">resolver hoje?</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400"
            >
              Encontre e gere documentos oficiais, contratos e requerimentos em segundos. 
              Simples, rápido e juridicamente seguro.
            </motion.p>

            {/* Central Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 w-full max-w-2xl"
            >
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-doku-green to-emerald-500 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
                <div className="relative">
                  <Suspense fallback={<div className="h-16 w-full animate-pulse rounded-full bg-slate-800" />}>
                    <SearchBar 
                      variant="hero" 
                      placeholder="Ex: Requerimento de DUAT, Contrato de Aluguer..." 
                      className="w-full"
                    />
                  </Suspense>
                </div>
              </div>

              {/* Quick Access Tags */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-500">Acesso rápido:</span>
                {[
                  { name: 'BIM', color: 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10' },
                  { name: 'INSS', color: 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10' },
                  { name: 'DUAT', color: 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10' },
                  { name: 'Aluguer', color: 'border-slate-500/50 text-slate-300 hover:bg-slate-500/10' },
                  { name: 'Trabalho', color: 'border-slate-500/50 text-slate-300 hover:bg-slate-500/10' }
                ].map((tag) => (
                  <Link 
                    key={tag.name}
                    href={`/templates?search=${tag.name}`}
                    className={`rounded-lg border px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${tag.color}`}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Side: Floating Gallery */}
          <div className="absolute inset-0 z-0 lg:relative lg:z-10 lg:h-[500px] lg:block">
            {/* Mobile Overlay Effect */}
            <div className="absolute inset-0 z-0 bg-slate-900/60 lg:hidden" />

            <div className="absolute inset-0 flex items-center justify-center opacity-30 lg:static lg:h-full lg:opacity-100">
              {/* Card 1: Requerimento */}
              <motion.div 
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [-6, -4, -6]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute left-0 top-10 z-30 w-56 -rotate-6 rounded-xl bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] lg:w-64 lg:p-4"
              >
                <div className="h-72 w-full rounded-lg bg-slate-50 p-4 lg:h-80">
                  <div className="h-4 w-3/4 rounded bg-slate-200 mb-4" />
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded bg-slate-100" />
                    <div className="h-2 w-full rounded bg-slate-100" />
                    <div className="h-2 w-5/6 rounded bg-slate-100" />
                  </div>
                  <div className="mt-20 flex justify-end">
                    <div className="h-8 w-24 rounded bg-doku-green/20" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-doku-green" />
                  <span className="text-[10px] font-bold text-slate-900">REQUERIMENTO OFICIAL</span>
                </div>
              </motion.div>

              {/* Card 2: Contrato */}
              <motion.div 
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [3, 5, 3]
                }}
                transition={{ 
                  duration: 7, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute left-1/2 top-1/2 z-20 w-56 -translate-x-1/2 -translate-y-1/2 rotate-3 rounded-xl bg-white/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm lg:w-64 lg:p-4"
              >
                <div className="h-72 w-full rounded-lg bg-slate-50 p-4 lg:h-80">
                  <div className="h-4 w-1/2 rounded bg-slate-200 mb-4" />
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded bg-slate-100" />
                    <div className="h-2 w-full rounded bg-slate-100" />
                    <div className="h-2 w-full rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-slate-900">CONTRATO DE ALUGUER</span>
                </div>
              </motion.div>

              {/* Card 3: Declaração */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [8, 10, 8]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-10 right-0 z-10 w-56 rotate-8 rounded-xl bg-white/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm lg:w-64 lg:p-4"
              >
                <div className="h-72 w-full rounded-lg bg-slate-50 p-4 lg:h-80">
                  <div className="h-4 w-2/3 rounded bg-slate-200 mb-4" />
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded bg-slate-100" />
                    <div className="h-2 w-full rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-slate-900">DECLARAÇÃO DE HONRA</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
