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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="mb-4 animate-spin" size={40} />
        <p className="text-sm font-medium">Carregando modelos...</p>
      </div>
    );
  }

  if (error || templates.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Search size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Nenhum modelo disponível no momento.</h3>
        <p className="mt-2 text-slate-500">Estamos trabalhando para adicionar novos modelos em breve!</p>
      </div>
    );
  }

  const displayedTemplates = limit ? templates.slice(0, limit) : templates;
  const hasMore = limit ? templates.length > limit : false;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayedTemplates.map((template) => (
          <Link key={template.id} href={`/form?template=${template.slug}`}>
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:scale-105 hover:border-blue-600 cursor-pointer shadow-sm">
              {/* Mini Preview */}
              <div className="relative flex aspect-[4/3] items-center justify-center bg-slate-100 p-6">
                <div className="h-full w-full rounded-sm bg-white p-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="h-2 w-3/4 rounded-full bg-slate-100"></div>
                    <div className="h-2 w-full rounded-full bg-slate-100"></div>
                    <div className="h-2 w-5/6 rounded-full bg-slate-100"></div>
                    <div className="mt-4 h-2 w-1/2 rounded-full bg-slate-100"></div>
                    <div className="h-2 w-full rounded-full bg-slate-100"></div>
                  </div>
                </div>
                {template.popular && (
                  <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Popular
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{template.title}</h3>
                <div className="mt-auto pt-3">
                  <span className="text-lg font-bold text-slate-900">{template.price || "Grátis"}</span>
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
            className="rounded-full border-2 border-slate-900 px-8 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-900 hover:text-white active:scale-95"
          >
            Ver mais modelos
          </Link>
        </div>
      )}
    </div>
  );
}
