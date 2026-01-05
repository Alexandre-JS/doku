"use client";

import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "../../src/lib/supabase";
import UserNav from "../../components/UserNav";
import SearchBar from "../../components/SearchBar";
import Footer from "../../components/Footer";
import SuggestionBox from "../../components/SuggestionBox";
import FloatingSupport from "../../components/FloatingSupport";
import FloatingSuggestion from "../../components/FloatingSuggestion";

const CATEGORIES = ["Todos", "Emprego", "Estado", "Legal"];

const normalizeText = (text: string) => 
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

interface Template {
  id: string;
  title: string;
  category: string;
  price: string;
  popular: boolean;
  slug: string;
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}

function TemplatesContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    async function fetchTemplates() {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar modelos:", error.message, error.details, error.hint);
      } else {
        setTemplates(data || []);
      }
      setLoading(false);
    }

    fetchTemplates();
  }, []);

  const filteredTemplates = templates.map(t => ({
    ...t,
    category: t.category || (
      t.title.includes("Residência") ? "Legal" :
      t.title.includes("Compromisso de Honra") ? "Estado" :
      t.title.includes("Requerimento Geral") ? "Emprego" : "Outros"
    )
  })).filter((template) => {
    const matchesCategory = selectedCategory === "Todos" || template.category === selectedCategory;
    const matchesSearch = normalizeText(template.title).includes(normalizeText(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-doku-bg font-sans text-doku-blue">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-doku-bg"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Modelos Disponíveis</h1>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar className="w-64" />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Filter Chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-4 sm:pb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all min-h-[48px] ${
                selectedCategory === category
                  ? "bg-doku-blue text-white"
                  : "bg-white text-doku-blue/60 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-20 flex flex-col items-center justify-center text-doku-blue/40">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">Carregando modelos...</p>
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
      <FloatingSupport />
      <SuggestionBox isOpen={isSuggestionOpen} onClose={() => setIsSuggestionOpen(false)} />
    </div>
  );
}

function TemplateCard({ title, price, popular }: { title: string; price?: string; popular?: boolean }) {
  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-xl hover:border-doku-green/30 cursor-pointer">
      {/* Mini Preview / Image */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-doku-bg overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#143361 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        
        <div className="relative h-[80%] w-[70%] rounded-sm bg-white p-4 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-2 flex flex-col items-center justify-center">
          <img src="/logo-tra.png" alt="DOKU" className="mb-4 h-8 w-auto opacity-20 grayscale" />
          <div className="w-full space-y-2">
            <div className="h-1.5 w-3/4 rounded-full bg-slate-100"></div>
            <div className="h-1.5 w-full rounded-full bg-slate-100"></div>
            <div className="h-1.5 w-5/6 rounded-full bg-slate-100"></div>
            <div className="mt-4 h-1.5 w-1/2 rounded-full bg-slate-100"></div>
            <div className="h-1.5 w-full rounded-full bg-slate-100"></div>
          </div>
          {/* Seal/Stamp effect */}
          <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full border-2 border-doku-blue/10 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full bg-doku-blue/5" />
          </div>
        </div>

        {popular && (
          <span className="absolute left-4 top-4 rounded-full bg-doku-green px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Mais Usado
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-doku-green">Oficial</span>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="text-[10px] font-medium text-slate-400">PDF</span>
        </div>
        <h3 className="text-sm font-bold text-doku-blue line-clamp-2 group-hover:text-doku-green transition-colors">{title}</h3>
        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Preço</span>
            <span className="text-lg font-black text-doku-blue">
              {price ? `${price} MT` : "Grátis"}
            </span>
          </div>
          <div className="rounded-full bg-doku-bg p-2 text-doku-blue group-hover:bg-doku-green group-hover:text-white transition-all">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
