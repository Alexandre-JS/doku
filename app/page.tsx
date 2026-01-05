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
import Hero from "../components/Hero";

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

      <main>
        {/* Hero Section */}
        <Hero />

        <div className="mx-auto max-w-7xl px-6">
          {/* Partner Trust Bar */}
          <div className="py-24 sm:py-32">
            <PartnerTrustBar />
          </div>

          {/* Catálogo de Modelos */}
          <section className="pb-24 sm:pb-32">
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-green">Explore Nossas Minutas</p>
              <h2 className="text-4xl font-black tracking-tight text-doku-blue sm:text-5xl">Modelos Disponíveis</h2>
              <p className="mt-4 max-w-2xl text-base text-doku-blue/60">
                Escolha entre nossa variedade de modelos oficiais prontos para uso imediato.
              </p>
            </div>

            <div className="mt-12">
              <TemplatesGrid limit={4} />
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <FloatingSupport />
    </div>
  );
}
