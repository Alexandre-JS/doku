"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Database,
  ArrowUpRight,
  Clock,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { motion } from "framer-motion";

export default function AdminDashboardHome() {
  const supabase = createBrowserSupabase();
  const [stats, setStats] = useState({
    templates: 0,
    variables: 0,
    sales: 0,
    activeUsers: 0
  });

  useEffect(() => {
    async function fetchStats() {
      const [templ, vars] = await Promise.all([
        supabase.from("templates").select("id", { count: "exact" }),
        supabase.from("global_variables").select("id", { count: "exact" })
      ]);

      setStats({
        templates: templ.count || 0,
        variables: vars.count || 0,
        sales: 42, // Mock por agora
        activeUsers: 156 // Mock
      });
    }
    fetchStats();
  }, [supabase]);

  const cards = [
    { name: "Total de Minutas", value: stats.templates, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Variáveis Globais", value: stats.variables, icon: Database, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Vendas (Mês)", value: `${stats.sales}`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Utilizadores Ativos", value: stats.activeUsers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#143361] tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-zinc-500 font-medium">Bem-vindo ao painel de controlo da plataforma DOKU.</p>
        </div>
        <div className="flex gap-2">
            <button className="rounded-xl bg-white border border-zinc-200 px-4 py-2 text-xs font-bold text-[#143361] shadow-sm hover:bg-zinc-50 transition-all">Exportar Relatório</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.name}
            className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all cursor-default"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={20} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={10} />
                +12.5%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">{card.name}</p>
              <h3 className="mt-1 text-3xl font-black text-[#143361]">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 mt-8">
        {/* Recent Activity */}
        <div className="lg:col-span-8 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-[#143361] tracking-tight flex items-center gap-2">
                 <Clock size={20} className="text-zinc-400" />
                 Actividade Recente
              </h3>
              <button className="text-xs font-bold text-[#143361] hover:underline">Ver tudo</button>
           </div>
           
           <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:border-[#143361]/20 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-zinc-200 text-[#143361]">
                         <FileText size={16} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-[#143361]">Nova Minuta Publicada</p>
                         <p className="text-xs text-zinc-500 font-medium font-inter">"Contrato de Arrendamento Comercial" adicionado por Alexandre.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Há 2 horas</span>
                      <ChevronRight size={14} className="text-zinc-300 group-hover:text-[#143361] transition-colors" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[2rem] bg-[#143361] p-8 text-white shadow-xl shadow-blue-100">
               <h3 className="text-lg font-bold mb-4">Suporte Admin</h3>
               <p className="text-sm text-blue-100 font-medium mb-6">Precisa de ajuda com o sistema ou quer solicitar novas funcionalidades?</p>
               <a 
                 href="https://wa.me/258867563555" 
                 className="flex items-center justify-center gap-2 w-full py-4 bg-[#00A86B] rounded-2xl font-bold text-sm shadow-lg hover:bg-emerald-600 transition-all active:scale-95"
               >
                 Contactar Developer
               </a>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-8">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Atalhos Úteis</h3>
               <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all border border-zinc-100">
                     <Plus size={16} className="text-[#143361]" />
                     <span className="text-[10px] font-bold text-[#143361]">Nova Minuta</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all border border-zinc-100">
                     <Database size={16} className="text-[#143361]" />
                     <span className="text-[10px] font-bold text-[#143361]">Variáveis</span>
                  </button>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function Plus({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
