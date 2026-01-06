"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { 
  Plus, 
  ChevronDown, 
  Menu, 
  X, 
  FileText, 
  Building2, 
  Briefcase, 
  Scale, 
  MessageCircle,
  Cloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserNav from "./UserNav";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    { name: "Imobiliário / DUAT", icon: <Building2 size={16} />, href: "/templates?category=Legal" },
    { name: "Trabalho / RH", icon: <Briefcase size={16} />, href: "/templates?category=Emprego" },
    { name: "Concursos Públicos", icon: <Scale size={16} />, href: "/templates?category=Estado" },
    { name: "Todos os Modelos", icon: <FileText size={16} />, href: "/templates" },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200" : "bg-white border-b border-slate-100"
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo-tra.png" alt="DOKU" className="h-8 w-auto transition-transform group-hover:scale-105 sm:h-9" />
            <div className="flex items-center gap-1.2 rounded-full bg-slate-100 px-1.5 py-0.5 ring-1 ring-slate-200 sm:gap-1.5 sm:px-2">
              <Cloud size={10} className="text-doku-blue/40" />
              <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500 sm:text-[10px]">Beta</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <div className="relative">
              <button 
                onMouseEnter={() => setIsTemplatesOpen(true)}
                onMouseLeave={() => setIsTemplatesOpen(false)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-doku-blue"
              >
                Modelos
                <ChevronDown size={14} className={`transition-transform duration-200 ${isTemplatesOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isTemplatesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseEnter={() => setIsTemplatesOpen(true)}
                    onMouseLeave={() => setIsTemplatesOpen(false)}
                    className="absolute left-0 top-full w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    {categories.map((cat) => (
                      <Link 
                        key={cat.name}
                        href={cat.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-doku-bg hover:text-doku-blue"
                      >
                        <span className="text-slate-400">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/precos" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-doku-blue">Preços</Link>
            <Link href="/faq" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-doku-blue">Suporte</Link>
          </nav>
        </div>

        {/* Center: Compact Search (Visible on scroll) */}
        <div className={`hidden flex-1 justify-center transition-all duration-500 lg:flex ${
          isScrolled ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}>
          <Suspense fallback={<div className="w-full max-w-xs h-10 bg-slate-100 rounded-full animate-pulse" />}>
            <SearchBar variant="nav" className="w-full max-w-xs" placeholder="Buscar documento..." />
          </Suspense>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link 
            href="/templates"
            className="hidden items-center gap-2 rounded-full bg-doku-green px-4 py-2 text-sm font-bold text-white shadow-lg shadow-doku-green/20 transition-all hover:bg-doku-green/90 hover:scale-105 active:scale-95 sm:flex"
          >
            <Plus size={18} />
            Criar Documento
          </Link>
          
          <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block" />
          
          <UserNav />

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[70] h-full w-full max-w-[320px] bg-white p-6 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <img src="/logo-tra.png" alt="DOKU" className="h-8 w-auto" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3">Navegação</p>
                  <Link href="/templates" className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50">
                    <FileText size={20} />
                    Modelos
                  </Link>
                  <Link href="/precos" className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50">
                    <Plus size={20} />
                    Preços
                  </Link>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3">Categorias</p>
                  {categories.map((cat) => (
                    <Link key={cat.name} href={cat.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
                      {cat.icon}
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <a 
                    href="https://wa.me/258840000000"
                    className="flex items-center justify-center gap-2 rounded-xl bg-doku-green py-4 text-sm font-bold text-white shadow-lg shadow-doku-green/20"
                  >
                    <MessageCircle size={20} />
                    Suporte via WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
