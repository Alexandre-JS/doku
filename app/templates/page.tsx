"use client";

import { useState } from "react";
import { ArrowLeft, Search, FileText } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Todos", "Emprego", "Estado", "Legal"];

const TEMPLATES = [
  { id: 1, title: "Carta de Pedido de Emprego", category: "Emprego", price: "75 MT", popular: true },
  { id: 2, title: "Declaração de Residência", category: "Estado", price: "50 MT", popular: false },
  { id: 3, title: "Contrato de Arrendamento", category: "Legal", price: "150 MT", popular: true },
  { id: 4, title: "Procuração Simples", category: "Legal", price: "100 MT", popular: false },
  { id: 5, title: "Curriculum Vitae Moderno", category: "Emprego", price: "120 MT", popular: true },
  { id: 6, title: "Requerimento Geral", category: "Estado", price: "40 MT", popular: false },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === "Todos" || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Modelos Disponíveis</h1>
          </div>
          <div className="hidden sm:block relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar modelo..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-slate-400 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Filter Chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-4 sm:pb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all min-h-[48px] ${
                selectedCategory === category
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTemplates.map((template) => (
              <Link key={template.id} href="/form">
                <TemplateCard {...template} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Não encontramos esse modelo.</h3>
            <p className="mt-2 text-slate-500">Sugira-nos o que você precisa!</p>
            <button className="mt-6 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 min-h-[48px]">
              Sugerir Modelo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function TemplateCard({ title, price, popular }: { title: string; price: string; popular: boolean }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:scale-105 hover:border-blue-600 cursor-pointer">
      {/* Mini Preview */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-slate-100 p-6">
        <div className="h-full w-full rounded-sm bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <div className="h-2 w-3/4 rounded-full bg-slate-100"></div>
            <div className="h-2 w-full rounded-full bg-slate-100"></div>
            <div className="h-2 w-5/6 rounded-full bg-slate-100"></div>
            <div className="mt-4 h-2 w-1/2 rounded-full bg-slate-100"></div>
            <div className="h-2 w-full rounded-full bg-slate-100"></div>
          </div>
        </div>
        {popular && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Popular
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{title}</h3>
        <div className="mt-auto pt-3">
          <span className="text-lg font-bold text-slate-900">{price}</span>
        </div>
      </div>
    </div>
  );
}
