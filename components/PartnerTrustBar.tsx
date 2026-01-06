"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PartnerTrustBar() {
  const partners = [
    { name: "AT", logo: "/AT globo.png", fullName: "Autoridade Tributária" },
    { name: "INSS", logo: "/inss-logo-2023.webp", fullName: "Instituto Nacional de Segurança Social" },
    { name: "CM Beira", logo: "/Conselho-Municipal-Beira-CMB.png", fullName: "Conselho Municipal da Beira" },
    { name: "INATRO", logo: "/inatro.webp", fullName: "Instituto Nacional dos Transportes Rodoviários" },
    { name: "CIM", logo: "/cimentos-de-mocambique-Logo.png", fullName: "Cimentos de Moçambique" },
    { name: "BIM", logo: "/bim.png", fullName: "Millennium BIM" },
    { name: "BCI", logo: "/bci.png", fullName: "Banco Comercial e de Investimentos" },
    { name: "Standard Bank", logo: "/standard_bank_logo.webp", fullName: "Standard Bank" },
    { name: "Cornelder", logo: "/cornelder.png", fullName: "Cornelder de Moçambique" },
    { name: "CFM", logo: "/cfm.jpeg", fullName: "Portos e Caminhos de Ferro de Moçambique" },
    { name: "EdM", logo: "/edm.png", fullName: "Eletricidade de Moçambique" },
    { name: "FIPAG", logo: "/adrm.jpg", fullName: "Fundo de Investimento e Património do Abastecimento de Água" },
  ];

  // Duplicar a lista para o efeito infinito
  const infinitePartners = [...partners, ...partners, ...partners];

  return (
    <section className="w-full border-y border-slate-100 bg-white/30 py-6 backdrop-blur-md sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:flex-row lg:gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 sm:text-[11px] sm:tracking-[0.2em] lg:w-48">
            Minutas aceites em:
          </p>
          
          <div className="relative flex-1 overflow-hidden">
            {/* Gradientes de desfoque nas bordas */}
            <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white/50 to-transparent sm:w-16 lg:w-20 lg:from-white/30" />
            <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white/50 to-transparent sm:w-16 lg:w-20 lg:from-white/30" />

            <div className="flex animate-scroll items-center gap-8 whitespace-nowrap py-3 sm:gap-12 sm:py-4 lg:gap-16">
              {infinitePartners.map((partner, index) => (
                <div
                  key={index}
                  className="group flex flex-shrink-0 items-center justify-center transition-all duration-500"
                  title={partner.fullName}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-6 w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-[360deg] sm:h-8 lg:h-10"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          display: flex;
          width: max-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
