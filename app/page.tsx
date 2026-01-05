import Navbar from "../components/Navbar";
import TemplatesGrid from "../components/TemplatesGrid";
import Footer from "../components/Footer";
import PartnerTrustBar from "../components/PartnerTrustBar";
import FloatingSupport from "../components/FloatingSupport";
import Hero from "../components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-doku-bg font-sans text-doku-blue">
      <Navbar />

      <main>
        {/* Hero Section */}
        <Hero />

        <div className="mx-auto max-w-7xl px-6">
          {/* Partner Trust Bar */}
          <div className="py-12 sm:py-16">
            <PartnerTrustBar />
          </div>

          {/* Catálogo de Modelos */}
          <section className="pb-16 sm:pb-20">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-green">Explore Nossas Minutas</p>
              <h2 className="text-4xl font-black tracking-tight text-doku-blue sm:text-5xl">Modelos Disponíveis</h2>
              <p className="mt-4 max-w-2xl text-base text-doku-blue/60">
                Escolha entre nossa variedade de modelos oficiais prontos para uso imediato.
              </p>
            </div>

            <div className="mt-10">
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
