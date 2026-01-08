"use client";

import { useState, useEffect, Suspense } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "../../src/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SuggestionBox from "../../components/SuggestionBox";
import FloatingSupport from "../../components/FloatingSupport";
import FloatingSuggestion from "../../components/FloatingSuggestion";
import LogoLoading from "../../components/LogoLoading";
import { Category, Company, Template } from "../../src/types";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";

const normalizeText = (text: string) => 
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-doku-bg">
        <LogoLoading size="lg" />
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}

function TemplatesContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "Todos";
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createBrowserSupabase();
      
      // 1. Fetch Categories that have at least one template
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, slug, templates!inner(id)");

      // 2. Fetch Templates with Category and Companies
      const { data: templData, error } = await supabase
        .from("templates")
        .select(`
          *,
          categories(*),
          template_companies(
            companies(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar modelos:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        // Flatten companies and map category
        const formattedTemplates = (templData || []).map((t: any) => ({
          ...t,
          category: t.categories,
          companies: t.template_companies?.map((tc: any) => tc.companies).filter(Boolean) || []
        }));
        setTemplates(formattedTemplates);
      }

      if (catData) setCategories(catData);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "Todos" || template.category?.name === selectedCategory;
    
    // Smart Search: Title, Category Name, Company Names
    const searchTerm = normalizeText(searchQuery);
    const matchesTitle = normalizeText(template.title).includes(searchTerm);
    const matchesCat = template.category ? normalizeText(template.category.name).includes(searchTerm) : false;
    const matchesCompany = template.companies?.some(c => normalizeText(c.name).includes(searchTerm));
    
    const matchesSearch = searchTerm === "" || matchesTitle || matchesCat || matchesCompany;
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-doku-bg font-sans text-doku-blue">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {/* Filter Chips */}
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-8 sm:pb-12">
          <button
            key="Todos"
            onClick={() => setSelectedCategory("Todos")}
            className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all min-h-[48px] ${
              selectedCategory === "Todos"
                ? "bg-doku-blue text-white"
                : "bg-white text-doku-blue/60 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all min-h-[48px] ${
                selectedCategory === category.name
                  ? "bg-doku-blue text-white"
                  : "bg-white text-doku-blue/60 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-20 flex flex-col items-center justify-center">
            <LogoLoading size="md" />
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTemplates.map((template) => (
              <Link key={template.id} href={`/form?template=${template.slug}`} className="flex">
                <TemplateCard {...template} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-doku-blue/40 shadow-sm">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-semibold text-doku-blue">Não encontramos esse modelo.</h3>
            <p className="mt-2 text-doku-blue/60">Sugira-nos o que você precisa!</p>
            <button 
              onClick={() => setIsSuggestionOpen(true)}
              className="mt-6 rounded-full bg-doku-blue px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-doku-blue/90 min-h-[48px]"
            >
              Sugerir Modelo
            </button>
          </div>
        )}
      </main>

      {/* Suggestion Trigger before Footer */}
      <div className="mx-auto mb-16 flex max-w-7xl justify-end px-6">
        <FloatingSuggestion onClick={() => setIsSuggestionOpen(true)} />
      </div>

      <Footer />

      {/* Floating Support - Robust Responsive Container */}
      <div 
        className="pointer-events-none fixed inset-0 z-[100]"
        style={{
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div 
          className="pointer-events-auto absolute bottom-4 right-4 sm:bottom-6 sm:right-6"
          style={{
            pointerEvents: 'auto'
          }}
        >
          <FloatingSupport />
        </div>
      </div>

      <SuggestionBox isOpen={isSuggestionOpen} onClose={() => setIsSuggestionOpen(false)} />
    </div>
  );
}

function TemplateCard({ title, description, price, popular, category, companies }: Template) {
  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-doku-green/30 cursor-pointer">
      {/* Mini Preview / Image */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-doku-bg overflow-hidden">
        {/* Category Badge - Top Left */}
        {category && (
          <div className="absolute left-4 top-4 z-40">
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-black uppercase tracking-wider text-doku-blue shadow-sm border border-slate-100 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-doku-green" />
              {category.name}
            </span>
          </div>
        )}

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#143361 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        
        {/* Page Fold Effect (Dog-ear) */}
        <div className="absolute right-0 top-0 z-30 h-10 w-10 overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-full bg-slate-100 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" 
            style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)', boxShadow: 'inset -2px 2px 4px rgba(0,0,0,0.1)' }} 
          />
          <div className="absolute right-0 top-0 h-full w-full bg-white/80 backdrop-blur-sm" 
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} 
          />
        </div>

        <div className="relative h-[85%] w-[75%] rounded-sm bg-white p-5 shadow-2xl transition-transform group-hover:scale-[1.02] group-hover:rotate-1 flex flex-col items-start overflow-hidden border border-slate-100">
          {/* Document Header Simulation */}
          <div className="mb-6 flex w-full items-center justify-between border-b border-slate-100 pb-4">
            <img src="/logo-tra.png" alt="DOKU" className="h-6 w-auto opacity-20 grayscale" />
            <div className="text-[6px] font-bold uppercase tracking-tighter text-slate-300 text-right">
              República de Moçambique <br />
              Ministério da Justiça
            </div>
          </div>

          {/* Document Body Simulation */}
          <div className="w-full space-y-3">
            <div className="h-2 w-1/2 rounded-sm bg-slate-100/50" />
            <div className="space-y-1.5">
              <p className="text-[5px] leading-[1.4] text-slate-300/60 line-clamp-6">
                Excelentíssimo Senhor Administrador do Distrito de Maputo. Eu, abaixo assinado, venho por este meio requerer a Vossa Excelência que se digne autorizar a emissão do documento oficial referente ao processo mencionado, nos termos da lei vigente na República de Moçambique...
              </p>
            </div>
            <div className="h-1.5 w-full rounded-sm bg-slate-50" />
            <div className="h-1.5 w-5/6 rounded-sm bg-slate-50" />
          </div>

          {/* Signature Area */}
          <div className="mt-auto w-full pt-6">
            <div className="mx-auto h-[1px] w-24 bg-slate-200" />
            <div className="mt-1 text-center text-[4px] font-bold uppercase text-slate-300">Assinatura do Requerente</div>
          </div>

          {/* Price Stamp/Seal */}
          <div className="absolute bottom-6 right-6 flex h-12 w-12 -rotate-12 items-center justify-center rounded-full border-2 border-dashed border-doku-green/30 bg-doku-green/5 p-1 transition-transform group-hover:rotate-0 group-hover:scale-110">
            <div className="flex flex-col items-center justify-center rounded-full border border-doku-green/20 px-1 py-0.5">
              <span className="text-[6px] font-bold text-doku-green/60 uppercase">Oficial</span>
              <span className="text-[10px] font-black text-doku-green">
                {price ? `${price}MT` : "GRÁTIS"}
              </span>
            </div>
          </div>
        </div>

        {popular && (
          <span className="absolute left-4 top-4 z-40 rounded-full bg-doku-green px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            Mais Usado
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-doku-blue line-clamp-1 group-hover:text-doku-green transition-colors">{title}</h3>
          <span className="text-[10px] font-black text-doku-green whitespace-nowrap bg-doku-green/5 px-2 py-0.5 rounded-md">
            {price ? `${price}MT` : "GRÁTIS"}
          </span>
        </div>
        
        {description && (
          <p className="text-[11px] leading-relaxed text-slate-500 line-clamp-2 mb-4">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
          {/* Company Logos (Avatar Group) */}
          <div className="flex -space-x-3 overflow-hidden p-1">
            {companies && companies.length > 0 ? (
              companies.slice(0, 4).map((company) => (
                <Avatar 
                  key={company.id} 
                  className="h-7 w-7 border-2 border-white shadow-sm transition-transform hover:z-10 hover:scale-110"
                >
                  <AvatarImage src={company.logo_url} alt={company.name} className="object-cover" />
                  <AvatarFallback className="bg-doku-blue/5 text-[8px] font-bold text-doku-blue">
                    {company.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))
            ) : (
              <div className="flex items-center gap-1.5 opacity-40">
                <Avatar className="h-6 w-6 border border-slate-100">
                  <AvatarFallback className="bg-slate-50">
                    <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </AvatarFallback>
                </Avatar>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Uso Geral</span>
              </div>
            )}
            {companies && companies.length > 4 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 border-2 border-white shadow-sm text-[8px] font-black text-slate-400 z-0">
                +{companies.length - 4}
              </div>
            )}
          </div>

          <div className="rounded-full bg-doku-blue px-4 py-1.5 text-[10px] font-bold text-white shadow-md transition-all group-hover:bg-doku-green group-hover:scale-105">
            GERAR AGORA
          </div>
        </div>
      </div>
    </div>
  );
}
