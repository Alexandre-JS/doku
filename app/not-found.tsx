import Link from "next/link";
import { FileQuestion, ChevronLeft, Home } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-doku-bg font-sans text-doku-blue flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Ilustração/Ícone */}
          <div className="relative mb-6 flex justify-center sm:mb-8">
            <div className="absolute inset-0 bg-doku-blue/5 blur-3xl rounded-full scale-150" />
            <div className="relative h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 rotate-3 sm:h-24 sm:w-24">
              <FileQuestion size={40} className="text-doku-blue/20 sm:size-[48px]" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-doku-green rounded-xl shadow-lg flex items-center justify-center -rotate-6 sm:-bottom-2 sm:-right-2 sm:h-10 sm:w-10">
              <span className="text-white font-black text-lg sm:text-xl">?</span>
            </div>
          </div>

          <h1 className="text-4xl font-black text-doku-blue mb-3 sm:text-5xl sm:mb-4">Em Breve</h1>
          <h2 className="text-lg font-bold text-doku-blue mb-3 sm:text-xl sm:mb-4">Estamos a afinar os detalhes</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2 sm:text-base sm:mb-10 sm:px-0">
            A DOKU está em constante evolução para garantir a máxima qualidade nos seus documentos. 
            Esta página está temporariamente indisponível enquanto implementamos melhorias técnicas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-doku-blue text-white rounded-xl font-bold transition-all hover:bg-doku-blue/90 hover:shadow-lg active:scale-95"
            >
              <Home size={18} />
              Ir para o Início
            </Link>
            <Link 
              href="/templates"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-doku-blue border border-slate-200 rounded-xl font-bold transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              Ver Modelos
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-400">
              Precisa de ajuda? <Link href="/faq" className="text-doku-blue font-semibold hover:underline">Fale com o suporte</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
