import { Suspense } from "react";
import Link from "next/link";
import UserNav from "../components/UserNav";
import TemplatesGrid from "../components/TemplatesGrid";
import TypingText from "../components/TypingText";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
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

      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center">
          
          
          <TypingText 
            text="Seu documento oficial pronto em 2 minutos"
            as="h1"
            className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl"
            speed={70}
          />
          
          <TypingText 
            text="A plataforma mais rápida e segura para emitir, validar e gerenciar seus documentos oficiais sem burocracia."
            as="p"
            className="mt-6 max-w-2xl text-lg text-slate-600"
            speed={30}
            startDelay={3000}
          />

          <div className="mb-6 inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500"></span>
            +5.000 documentos gerados hoje
          </div>
        </section>

        {/* Catálogo de Modelos */}
        <section className="mt-24">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Explore Nossas Minutas</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Modelos Disponíveis</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Escolha entre nossa variedade de modelos oficiais prontos para uso imediato.
            </p>
          </div>

          <div className="mt-10">
            <TemplatesGrid limit={4} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
