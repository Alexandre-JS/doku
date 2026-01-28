import Navbar from "../components/Navbar";
import TemplatesGrid from "../components/TemplatesGrid";
import Footer from "../components/Footer";
import PartnerTrustBar from "../components/PartnerTrustBar";
import FloatingSupport from "../components/FloatingSupport";
import Hero from "../components/Hero";
import { Suspense } from "react";
import LogoLoading from "../components/LogoLoading";

export default function Home() {
  return (
    <div className="min-h-screen bg-doku-bg font-sans text-doku-blue">
      <Navbar />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Partner Trust Bar - Full Width with Robust Responsive Container */}
        <div className="w-full overflow-x-hidden" style={{ 
          minWidth: '100%',
          maxWidth: '100vw'
        }}>
          <PartnerTrustBar />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Catálogo de Modelos */}
          <section className="pb-16 sm:pb-20">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-green">Explore Nossas Minutas</p>
              <h2 className="font-display text-4xl font-black tracking-tight text-doku-blue sm:text-5xl">Modelos Disponíveis</h2>
              <p className="mt-4 max-w-2xl text-base text-doku-blue/60">
                Escolha entre nossa variedade de modelos oficiais prontos para uso imediato.
              </p>
            </div>

            <div className="mt-10">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-20">
                  <LogoLoading size="md" />
                </div>
              }>
                <TemplatesGrid limit={4} />
              </Suspense>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Floating Support - Robust Responsive Container */}
      <div 
        className="pointer-events-none fixed inset-0 z-[100]"
        style={{
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div 
          className="pointer-events-auto absolute bottom-4 right-4 sm:bottom-6 sm:right-6"
          style={{
            pointerEvents: 'auto'
          }}
        >
          <FloatingSupport />
        </div>
      </div>
    </div>
  );
}
