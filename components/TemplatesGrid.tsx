"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { createBrowserSupabase } from "../src/lib/supabase";

interface Template {
  id: string;
  title: string;
  slug: string;
  price?: string;
  popular?: boolean;
  category?: string;
}

interface TemplatesGridProps {
  limit?: number;
}

export default function TemplatesGrid({ limit }: TemplatesGridProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const supabase = createBrowserSupabase();
        const { data, error } = await supabase
          .from("document_templates")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao buscar modelos:", error);
          setError(error.message);
        } else {
          setTemplates(data || []);
        }
      } catch (err: any) {
        console.error("Erro inesperado:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-doku-blue/40">
        <Loader2 className="mb-4 animate-spin" size={40} />
        <p className="text-sm font-medium">Carregando modelos...</p>
      </div>
    );
  }

  if (error || templates.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-doku-bg text-doku-blue/40">
          <Search size={32} />
        </div>
        <h3 className="text-lg font-semibold text-doku-blue">Nenhum modelo disponível no momento.</h3>
        <p className="mt-2 text-doku-blue/60">Estamos trabalhando para adicionar novos modelos em breve!</p>
      </div>
    );
  }

  const displayedTemplates = limit ? templates.slice(0, limit) : templates;
  const hasMore = limit ? templates.length > limit : false;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayedTemplates.map((template) => (
          <Link key={template.id} href={`/form?template=${template.slug}`} className="flex">
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

                {template.popular && (
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
                <h3 className="text-sm font-bold text-doku-blue line-clamp-2 group-hover:text-doku-green transition-colors">{template.title}</h3>
                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Preço</span>
                    <span className="text-lg font-black text-doku-blue">
                      {template.price ? `${template.price} MT` : "Grátis"}
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
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Link 
            href="/templates" 
            className="rounded-full border-2 border-doku-blue px-8 py-3 text-sm font-bold text-doku-blue transition-all hover:bg-doku-blue hover:text-white active:scale-95"
          >
            Ver mais modelos
          </Link>
        </div>
      )}
    </div>
  );
}
