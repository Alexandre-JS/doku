"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Building2 } from "lucide-react";
import Link from "next/link";
import { createBrowserSupabase } from "../src/lib/supabase";
import LogoLoading from "./LogoLoading";
import { Template } from "../src/types";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

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
          console.error("Erro Supabase:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          setError(error.message);
        } else {
          const formattedTemplates = (templData || []).map((t: any) => ({
            ...t,
            category: t.categories, // Mapeia para o singular usado no componente
            companies: t.template_companies?.map((tc: any) => tc.companies).filter(Boolean) || []
          }));
          setTemplates(formattedTemplates);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LogoLoading size="md" />
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
            <div className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-doku-green/30 cursor-pointer">
              {/* Mini Preview / Image */}
              <div className="relative flex aspect-[4/3] items-center justify-center bg-doku-bg overflow-hidden">
                {/* Category Badge */}
                {template.category && (
                  <div className="absolute left-4 top-4 z-40">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-black uppercase tracking-wider text-doku-blue shadow-sm border border-slate-100">
                      {template.category.name}
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

                  {/* Document Body Simulation (Lorem Ipsum style) */}
                  <div className="w-full space-y-3">
                    <div className="h-2 w-1/2 rounded-sm bg-slate-100/50" />
                    <div className="space-y-1.5">
                      <p className="text-[5px] leading-[1.4] text-slate-300/60 line-clamp-6">
                        Excelentíssimo Senhor Administrador do Distrito de Maputo. Eu, abaixo assinado, venho por este meio requerer a Vossa Excelência que se digne autorizar a emissão do documento oficial referente ao processo mencionado, nos termos da lei vigente na República de Moçambique...
                      </p>
                    </div>
                    <div className="h-1.5 w-full rounded-sm bg-slate-50" />
                    <div className="h-1.5 w-5/6 rounded-sm bg-slate-50" />
                    <div className="h-1.5 w-full rounded-sm bg-slate-50" />
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
                        {template.price ? `${template.price}MT` : "GRÁTIS"}
                      </span>
                    </div>
                  </div>
                </div>

                {template.popular && (
                  <span className="absolute left-4 top-4 z-40 rounded-full bg-doku-green px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                    Mais Usado
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-doku-blue line-clamp-1 group-hover:text-doku-green transition-colors">{template.title}</h3>
                  <span className="text-[10px] font-black text-doku-green whitespace-nowrap bg-doku-green/5 px-2 py-0.5 rounded-md">
                    {template.price ? `${template.price}MT` : "GRÁTIS"}
                  </span>
                </div>
                
                {template.description && (
                  <p className="text-[11px] leading-relaxed text-slate-500 line-clamp-2 mb-4">
                    {template.description}
                  </p>
                )}

                <div className="mt-auto flex flex-col gap-3 border-t border-slate-50 pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aceites em:</p>
                  <div className="flex items-center justify-between">
                    {/* Company Avatars (Avatar Group) */}
                    <div className="flex -space-x-2.5 overflow-hidden p-1">
                      {template.companies && template.companies.length > 0 ? (
                        template.companies.slice(0, 3).map((company) => (
                          <Avatar 
                            key={company.id} 
                            className="h-6 w-6 border-2 border-white shadow-sm transition-transform hover:z-10 hover:scale-110"
                          >
                            <AvatarImage src={company.logo_url} alt={company.name} className="object-cover" />
                            <AvatarFallback className="bg-slate-50 text-[10px] font-bold text-slate-400">
                              {company.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center ring-2 ring-white">
                          <FileText size={10} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="rounded-full bg-doku-blue px-4 py-1.5 text-[10px] font-bold text-white shadow-md transition-all group-hover:bg-doku-green group-hover:scale-105">
                      GERAR
                    </div>
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
