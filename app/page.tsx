import { Search, Briefcase, Landmark, TrendingUp, Scale } from "lucide-react";
import Link from "next/link";
import UserNav from "../components/UserNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold">
              D
            </div>
            <span className="text-xl font-bold tracking-tight">DOKU</span>
          </div>
          <UserNav />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500"></span>
            +5.000 documentos gerados hoje
          </div>
          
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Seu documento oficial pronto em 2 minutos
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            A plataforma mais rápida e segura para emitir, validar e gerenciar seus documentos oficiais sem burocracia.
          </p>

          {/* Search Bar */}
          <div className="mt-10 w-full max-w-[600px]">
            <div className="relative flex items-center rounded-full bg-white p-2 shadow-lg ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-slate-400">
              <div className="flex items-center pl-4 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="O que você precisa hoje?"
                className="w-full border-none bg-transparent px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
              />
              <Link href="/templates" className="rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 min-h-[48px] flex items-center">
                Buscar
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="mt-24">
          <h2 className="mb-10 text-center text-2xl font-semibold text-slate-900">
            Explore por categorias
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <Link href="/templates">
              <CategoryCard 
                icon={<Briefcase className="text-blue-600" />} 
                title="Emprego" 
                description="Contratos e declarações"
              />
            </Link>
            <Link href="/templates">
              <CategoryCard 
                icon={<Landmark className="text-amber-600" />} 
                title="Estado" 
                description="Certidões e impostos"
              />
            </Link>
            <Link href="/templates">
              <CategoryCard 
                icon={<TrendingUp className="text-emerald-600" />} 
                title="Negócios" 
                description="Abertura e gestão"
              />
            </Link>
            <Link href="/templates">
              <CategoryCard 
                icon={<Scale className="text-purple-600" />} 
                title="Legal" 
                description="Procurações e termos"
              />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-slate-500">
          <p>© 2025 DOKU. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function CategoryCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md hover:border-slate-300 cursor-pointer">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-white">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
