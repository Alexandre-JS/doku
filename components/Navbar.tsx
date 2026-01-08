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
import { createBrowserSupabase } from "../src/lib/supabase";

interface NavCategory {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const chunkArray = (arr: any[], size: number) => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [companies, setCompanies] = useState<{ name: string; logo_url: string; href: string }[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const supabase = createBrowserSupabase();
      
      // Fetch categories with at least one template
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, slug, templates!inner(id)");

      if (catData) {
        const getIcon = (name: string) => {
          const n = name.toLowerCase();
          if (n.includes("imob") || n.includes("duat") || n.includes("casa")) return <Building2 size={16} />;
          if (n.includes("trab") || n.includes("rh") || n.includes("emprego")) return <Briefcase size={16} />;
          if (n.includes("conc") || n.includes("esta") || n.includes("publ")) return <Scale size={16} />;
          return <FileText size={16} />;
        };

        const mapped = catData.map((cat: any) => ({
          name: cat.name,
          icon: getIcon(cat.name),
          href: `/templates?category=${cat.name}`
        }));

        setCategories([
          ...mapped,
          { name: "Todos os Modelos", icon: <FileText size={16} />, href: "/templates" }
        ]);
      } else {
        setCategories([
          { name: "Todos os Modelos", icon: <FileText size={16} />, href: "/templates" }
        ]);
      }

      // Fetch companies
      const { data: compData } = await supabase
        .from("companies")
        .select("name, logo_url")
        .limit(10);
      
      if (compData) {
        setCompanies(compData.map(c => ({
          name: c.name,
          logo_url: c.logo_url,
          href: `/templates?search=${encodeURIComponent(c.name)}`
        })));
      }
    }

    fetchData();
  }, []);

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
                    className="absolute left-0 top-full flex gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl w-max"
                  >
                    {chunkArray(categories, 5).map((column, colIdx) => (
                      <div key={colIdx} className="w-64 space-y-1">
                        {column.map((cat) => (
                          <Link 
                            key={cat.name}
                            href={cat.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-doku-bg hover:text-doku-blue"
                          >
                            <span className="text-slate-400">{cat.icon}</span>
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onMouseEnter={() => setIsCompaniesOpen(true)}
                onMouseLeave={() => setIsCompaniesOpen(false)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-doku-blue"
              >
                Empresas
                <ChevronDown size={14} className={`transition-transform duration-200 ${isCompaniesOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isCompaniesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseEnter={() => setIsCompaniesOpen(true)}
                    onMouseLeave={() => setIsCompaniesOpen(false)}
                    className="absolute left-0 top-full flex gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl w-max"
                  >
                    {companies.length > 0 ? (
                      chunkArray(companies, 5).map((column, colIdx) => (
                        <div key={colIdx} className="w-64 space-y-1">
                          {column.map((company) => (
                            <Link 
                              key={company.name}
                              href={company.href}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-doku-bg hover:text-doku-blue"
                            >
                              <img src={company.logo_url} alt={company.name} className="h-5 w-5 rounded-md object-contain grayscale" />
                              {company.name}
                            </Link>
                          ))}
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-xs text-slate-400">Nenhuma empresa encontrada</p>
                    )}
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
                  <Link href="/templates" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50">
                    <FileText size={20} />
                    Modelos
                  </Link>
                  <Link href="/precos" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50">
                    <Plus size={20} />
                    Preços
                  </Link>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3">Categorias</p>
                  {categories.map((cat) => (
                    <Link key={cat.name} href={cat.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
                      {cat.icon}
                      {cat.name}
                    </Link>
                  ))}
                </div>

                {companies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3">Empresas</p>
                    {companies.map((company) => (
                      <Link key={company.name} href={company.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
                        <img src={company.logo_url} alt={company.name} className="h-5 w-5 rounded-md object-contain grayscale" />
                        {company.name}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100">
                  <a 
                    href="https://wa.me/258867563555"
                    className="flex items-center justify-center gap-2 rounded-xl bg-doku-green py-4 text-sm font-bold text-white shadow-lg shadow-doku-green/20 transition-all hover:bg-doku-green/90 active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.053 3.754 1.579 5.86 1.579h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
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
