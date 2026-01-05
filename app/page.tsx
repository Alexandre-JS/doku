import { Suspense } from "react";
import Link from "next/link";
import UserNav from "../components/UserNav";
import TemplatesGrid from "../components/TemplatesGrid";
import TypingText from "../components/TypingText";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer";
import DocumentTypingSim from "../components/DocumentTypingSim";
import PartnerTrustBar from "../components/PartnerTrustBar";
import FloatingSupport from "../components/FloatingSupport";

export default function Home() {
  return (
    <div className="min-h-screen bg-doku-bg font-sans text-doku-blue">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8 flex-1">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-tra.png" alt="DOKU" className="h-10 w-auto" />
            </Link>
            
            <Suspense fallback={<div className="h-10 w-full max-w-sm animate-pulse rounded-full bg-slate-100" />}>
              <SearchBar className="max-w-sm" />
            </Suspense>
          </div>
          <UserNav />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[3.5fr_6.5fr]">
          {/* Lado Esquerdo: Texto */}
          <div className="flex flex-col items-start text-left">
            <div className="mb-6 inline-flex items-center rounded-full bg-doku-green/10 px-4 py-1.5 text-sm font-medium text-doku-green ring-1 ring-doku-green/20">
              <span className="relative mr-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-doku-green opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-doku-green"></span>
              </span>
              +5.000 documentos gerados hoje
            </div>

            <h1 className="text-3xl font-black tracking-tight text-doku-blue sm:text-5xl lg:text-5xl">
              DOKU: Documentos Oficiais em <span className="text-doku-green">Segundos.</span>
            </h1>
            
            <p className="mt-6 max-w-xl text-base leading-relaxed text-doku-blue/70 sm:text-lg">
              Diga adeus às filas e às papelarias. Gere o seu requerimento pronto a imprimir agora mesmo.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link 
                href="/templates" 
                className="inline-flex h-12 items-center justify-center rounded-xl bg-doku-green px-6 text-sm font-bold text-white transition-all hover:bg-doku-green/90 hover:shadow-lg active:scale-95"
              >
                Começar Agora — Grátis
              </Link>
              <Link 
                href="/faq" 
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-doku-blue/60 transition-all hover:bg-slate-50 active:scale-95"
              >
                Como funciona?
              </Link>
            </div>
          </div>

          {/* Lado Direito: A Animação */}
          <div className="relative hidden lg:block w-full">
            <div className="relative mx-auto w-full max-w-[700px] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200/50">
              {/* Browser Mockup Header */}
              <div className="mb-4 flex items-center gap-2 px-2 border-b border-slate-100 pb-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="ml-4 h-6 w-full max-w-[250px] rounded-md bg-doku-bg px-3 text-[10px] flex items-center text-slate-400">
                  doku.co.mz/gerador-inteligente
                </div>
              </div>
              <div className="scale-110 py-8">
                <DocumentTypingSim />
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-doku-green/10 text-doku-green">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-doku-blue">Pronto a Imprimir</p>
                  <p className="text-[9px] text-slate-500">PDF Oficial</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Trust Bar */}
        <div className="my-16 sm:my-24">
          <PartnerTrustBar />
        </div>

        {/* Catálogo de Modelos */}
        <section className="mt-16 sm:mt-24">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-doku-green">Explore Nossas Minutas</p>
            <h2 className="text-3xl font-black tracking-tight text-doku-blue">Modelos Disponíveis</h2>
            <p className="mt-2 max-w-2xl text-sm text-doku-blue/60">
              Escolha entre nossa variedade de modelos oficiais prontos para uso imediato.
            </p>
          </div>

          <div className="mt-10">
            <TemplatesGrid limit={4} />
          </div>
        </section>
      </main>

      <Footer />
      <FloatingSupport />
    </div>
  );
}
