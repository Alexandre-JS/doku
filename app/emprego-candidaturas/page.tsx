"use client";

import { useState, useEffect, Suspense } from "react";
import { Search, Briefcase, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createBrowserSupabase } from "../../src/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SuggestionBox from "../../components/SuggestionBox";
import FloatingSupport from "../../components/FloatingSupport";
import FloatingSuggestion from "../../components/FloatingSuggestion";
import LogoLoading from "../../components/LogoLoading";
import { Category, Template } from "../../src/types";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";

export default function EmpregoCandidaturasPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-doku-bg">
        <LogoLoading size="lg" />
      </div>
    }>
      <EmpregoContent />
    </Suspense>
  );
}

function EmpregoContent() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  useEffect(() => {
    async function fetchEmpregoTemplates() {
      const supabase = createBrowserSupabase();
      
      // Busca templates que pertençam a categorias relacionadas a trabalho/emprego
      // Ou que tenham termos relacionados no título/descrição
      const { data: templData, error } = await supabase
        .from("templates")
        .select(`
          *,
          categories(*),
          template_companies(
            companies(*)
          )
        `)
        .or('title.ilike.%emprego%,title.ilike.%trabalho%,title.ilike.%candidatura%,title.ilike.%cv%,title.ilike.%curriculum%,title.ilike.%admissão%,title.ilike.%concurso%,title.ilike.%estágio%,title.ilike.%ingresso%,title.ilike.%contratação%')
        .order("usage_count", { ascending: false });

      if (!error && templData) {
        const formattedTemplates = templData.map((t: any) => ({
          ...t,
          category: t.categories as Category,
          companies: t.template_companies?.map((tc: any) => tc.companies).filter(Boolean) || []
        })) as Template[];
        setTemplates(formattedTemplates);
      }
      setLoading(false);
    }

    fetchEmpregoTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-doku-bg font-sans text-doku-blue">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
        {/* Hero Section para a Categoria */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-doku-blue text-white shadow-xl shadow-doku-blue/20">
            <Briefcase size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-doku-blue sm:text-6xl">
            Emprego & <span className="text-doku-green">Candidaturas</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-slate-500 leading-relaxed">
            Aumente suas chances de sucesso com modelos profissionais de CVs, cartas de apresentação 
             e requerimentos de emprego validados para o mercado moçambicano.
          </p>
        </div>

        {/* Banner Aplite */}
        <div className="mb-16 overflow-hidden rounded-[3rem] bg-gradient-to-br from-doku-blue to-[#0a1a35] p-8 text-white shadow-2xl relative group">
          <div className="absolute -top-10 -right-10 p-8 opacity-10 transition-transform group-hover:scale-110">
            <Briefcase size={200} />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="max-w-xl text-center md:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-doku-green/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-doku-green">
                <Zap size={14} fill="currentColor" />
                Destaque sua Carreira
              </div>
              <h2 className="text-3xl font-black sm:text-4xl text-white mb-4">
                Seu <span className="text-doku-green">Currículo</span> está pronto para o mercado?
              </h2>
              <p className="text-lg text-slate-300">
                A <strong>Aplite</strong> ajuda você a descobrir o potencial do seu currículo para cada vaga. Vá além do modelo e garanta que sua história brilhe.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-4">
              <a 
                href="https://aplite.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-[2rem] bg-white px-8 py-5 text-lg font-black text-doku-blue transition-all hover:scale-105 hover:bg-doku-green hover:text-white shadow-xl shadow-white/5"
              >
                Otimizar na Aplite
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </a>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Parceiro Oficial DOKU</p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-12 flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-doku-green animate-pulse" />
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              {templates.length} Modelos Disponíveis
            </span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LogoLoading size="md" />
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Link key={template.id} href={`/form?template=${template.slug}`} className="flex group">
                <div className="relative flex w-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-doku-green/30">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-doku-bg text-doku-blue group-hover:bg-doku-green group-hover:text-white transition-colors">
                      <Briefcase size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-doku-green uppercase bg-doku-green/5 px-3 py-1 rounded-full">
                      <Zap size={12} fill="currentColor" />
                      {template.usage_count || 0} usos
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-doku-blue mb-3 group-hover:text-doku-green transition-colors">
                    {template.title}
                  </h3>
                  
                  <p className="text-sm leading-relaxed text-slate-500 line-clamp-2 mb-8">
                    {template.description || "Modelo profissional pronto para preenchimento e download instantâneo."}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">v{template.version || '1.0'}</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-doku-blue group-hover:gap-3 transition-all">
                      Gerar Agora
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-300">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-doku-blue">Ainda não temos modelos nesta categoria.</h3>
            <p className="mt-2 text-slate-500 max-w-sm">No momento estamos preparando os melhores modelos de emprego para você. Enquanto isso, você pode otimizar seu currículo atual na Aplite.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setIsSuggestionOpen(true)}
                className="rounded-full bg-slate-100 px-10 py-4 text-sm font-black text-doku-blue transition-all hover:bg-slate-200"
              >
                Sugerir um Modelo
              </button>
              <a 
                href="https://aplite.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-doku-blue px-10 py-4 text-sm font-black text-white transition-all hover:bg-doku-blue/90 shadow-lg shadow-doku-blue/20"
              >
                Visitar Aplite
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <FloatingSupport />
      <SuggestionBox isOpen={isSuggestionOpen} onClose={() => setIsSuggestionOpen(false)} />
    </div>
  );
}
