import { ChevronRight, Zap, Trophy, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../src/lib/supabase";
import { Template } from "../src/types";

// Cached function to fetch popular templates
const getPopularTemplates = async () => {
    const { data: templData, error } = await supabase
      .from("templates")
      .select(`
        *,
        categories(*),
        template_companies(
          companies(*)
        )
      `)
      .eq("popular", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    
    console.log(`[DEBUG] Encontrados ${templData?.length || 0} templates populares.`);
    
    return (templData || []).map((t) => ({
      ...t,
      category: t.categories as unknown as Template['category'],
      companies: (t.template_companies as any[])?.map((tc) => tc.companies).filter(Boolean) || []
    })) as Template[];
};

export default async function PopularTemplates() {
  try {
    const templates = await getPopularTemplates();

    if (templates.length === 0) {
      return (
        <section className="py-10 text-center text-slate-400">
          <p className="text-sm">Nenhum modelo em destaque no momento.</p>
        </section>
      );
    }

    return (
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-doku-blue/5 px-4 py-1.5 ring-1 ring-doku-blue/10">
              <Trophy size={14} className="text-yellow-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-doku-blue">Destaques</span>
            </div>
            <h2 className="text-3xl font-black text-doku-blue sm:text-4xl">Mais Usados</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-500">
              Estes são os documentos mais solicitados esta semana. Atualizados de acordo com as últimas normas de 2026.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => {
              const isTop3 = index < 3;
              const cleanPrice = template.price ? template.price.toString().replace(/\s*MT/gi, '').trim() : '0';
              const isFree = cleanPrice === '0' || cleanPrice === '';

              return (
                <div 
                  key={template.id}
                  className={`group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-2 transition-all hover:border-doku-green/30 ${
                    isTop3 ? 'shadow-2xl shadow-slate-200 hover:-translate-y-2' : 'shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Rank Badge */}
                    <div className="absolute -right-4 -top-4 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-amber-100/50 transition-transform group-hover:scale-110">
                      <span className="bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-4xl font-black italic text-transparent">
                        {index + 1}
                      </span>
                      <div className="absolute -bottom-1 whitespace-nowrap rounded-full bg-amber-500 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-sm ring-2 ring-white">
                        Lugar
                      </div>
                    </div>

                    {/* Header/Category */}
                    <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-50 p-6">
                      <div className="absolute right-4 top-4">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-doku-blue shadow-sm">
                          {template.category?.name}
                        </span>
                      </div>

                      <div className="flex h-full flex-col justify-end gap-3">
                         <h3 className="text-xl font-black text-doku-blue line-clamp-1 group-hover:text-doku-green transition-colors">
                          {template.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>5 min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShieldCheck size={14} />
                            <span>Oficial</span>
                          </div>
                        </div>
                      </div>

                      {/* Background Icon Watermark */}
                      <div className="absolute bottom-4 right-4 opacity-5">
                        <Zap size={100} />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="mb-6 text-sm leading-relaxed text-slate-500 line-clamp-3">
                        {template.description || "Geração automatizada deste documento com validade legal em todo o território de Moçambique."}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Investimento</span>
                          <span className="text-2xl font-black text-doku-blue">
                            {isFree ? "Grátis" : `${cleanPrice} MT`}
                          </span>
                        </div>
                        
                        <Link 
                          href={`/form?template=${template.slug}`}
                          className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black transition-all active:scale-95 ${
                            isTop3 
                              ? "bg-doku-green text-white shadow-lg shadow-doku-green/30 hover:bg-doku-green/90" 
                              : "bg-doku-blue text-white hover:bg-doku-blue/90"
                          }`}
                        >
                          Gerar Agora
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link 
              href="/templates" 
              className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-doku-blue hover:text-doku-green transition-colors"
            >
              Explorar Catálogo Completo
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Erro ao carregar modelos populares:", error instanceof Error ? error.message : error);
    return (
      <section className="py-10 text-center text-slate-400">
        <p className="text-sm">Ocorreu um erro ao carregar os modelos populares. Por favor, tente novamente mais tarde.</p>
      </section>
    );
  }
}
