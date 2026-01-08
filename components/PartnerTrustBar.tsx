"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "../src/lib/supabase";
import { Company } from "../src/types";

export default function PartnerTrustBar() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      
      if (!error && data) {
        setCompanies(data);
      }
      setLoading(false);
    }
    fetchCompanies();
  }, []);

  // Só duplicamos se houver um número considerável de empresas para criar o efeito de scroll infinito
  // Se houver poucas, apenas mostramos a lista real centralizada
  const shouldAnimate = companies.length >= 6;
  const displayPartners = shouldAnimate ? [...companies, ...companies] : companies;

  if (loading) return (
    <div className="h-20 w-screen bg-slate-50 animate-pulse border-y border-slate-100 flex items-center justify-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Carregando parceiros...</p>
    </div>
  );

  return (
    <section 
      className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] border-y border-slate-100 bg-white/30 py-6 backdrop-blur-md sm:py-8 lg:py-10"
      style={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw'
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ width: '100%' }}>
        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:flex-row lg:gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap sm:text-[11px] sm:tracking-[0.2em] lg:w-48">
            Minutas aceites em:
          </p>
          
          <div className="relative flex-1 w-full overflow-hidden min-h-[2.5rem] sm:min-h-[3rem]">
            {/* Gradientes de desfoque nas bordas - Apenas se estiver animando */}
            {shouldAnimate && (
              <>
                <div className="absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white/50 to-transparent sm:w-12 lg:w-16" />
                <div className="absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white/50 to-transparent sm:w-12 lg:w-16" />
              </>
            )}

            <div 
              className={`flex items-center gap-6 sm:gap-8 lg:gap-10 py-2 sm:py-3 lg:py-4 ${!shouldAnimate ? 'justify-start md:justify-center' : ''}`}
              style={shouldAnimate ? {
                animation: 'scroll 50s linear infinite',
                display: 'flex',
                width: 'max-content'
              } : {}}
              onMouseEnter={(e) => {
                if (!shouldAnimate) return;
                const el = e.currentTarget as HTMLElement;
                el.style.animationPlayState = 'paused';
              }}
              onMouseLeave={(e) => {
                if (!shouldAnimate) return;
                const el = e.currentTarget as HTMLElement;
                el.style.animationPlayState = 'running';
              }}
            >
              {displayPartners.map((partner, index) => (
                <div
                  key={index}
                  className="flex flex-shrink-0 items-center justify-center h-8 sm:h-10 lg:h-12 transition-transform duration-300 hover:scale-110 hover:drop-shadow-md"
                  title={partner.name}
                  style={{
                    minWidth: 'auto',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="h-full w-auto max-w-[80px] sm:max-w-[100px] lg:max-w-[120px] object-contain object-center"
                    loading="lazy"
                    style={{
                      filter: 'grayscale(100%)',
                      transition: 'filter 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(0%)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(100%)';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          section {
            width: 100vw;
            margin-left: calc(-50vw + 50%);
          }
        }
      `}</style>
    </section>
  );
}
