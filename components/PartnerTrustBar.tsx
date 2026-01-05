"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PartnerTrustBar() {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full border-y border-slate-100 bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-6 lg:flex-row">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 lg:w-48">
            Minutas aceites em:
          </p>
          
          <div className="relative flex flex-1 items-center group w-full">
            {/* Botão Esquerdo */}
            <button 
              onClick={() => scroll("left")}
              className="absolute -left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm transition-all hover:bg-slate-50 hover:shadow-md md:flex"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </button>

            {/* Container de Logos com Scroll */}
            <div 
              ref={scrollRef}
              className="flex w-full items-center gap-12 overflow-x-auto scroll-smooth px-4 scrollbar-hide md:gap-16"
            >
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="group flex flex-shrink-0 items-center justify-center transition-all duration-700"
                  title={partner.fullName}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-8 w-auto object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-[360deg] sm:h-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden text-xs font-bold text-slate-400 transition-colors group-hover:text-doku-blue">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Botão Direito */}
            <button 
              onClick={() => scroll("right")}
              className="absolute -right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm transition-all hover:bg-slate-50 hover:shadow-md md:flex"
              aria-label="Próximo"
            >
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
