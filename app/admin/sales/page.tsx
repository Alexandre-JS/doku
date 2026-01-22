"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  ArrowUpRight, 
  Search,
  Download,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { DashboardHeader, AdminPageContainer, StatsCard } from "@/components/admin/DashboardComponents";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function AdminSalesPage() {
  const supabase = createBrowserSupabase();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedSales: 0,
    averageTicket: 0
  });

  useEffect(() => {
    async function fetchSales() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar vendas:", error);
      }

      if (!error && data) {
        setSalesData(data);
        const completed = data.filter(s => s.status === 'COMPLETED');
        const total = completed.reduce((acc, s) => acc + (s.amount || 0), 0);
        setStats({
          totalRevenue: total,
          completedSales: completed.length,
          averageTicket: completed.length > 0 ? total / completed.length : 0
        });
      }
      setLoading(false);
    }
    fetchSales();
  }, [supabase]);

  const statCards = [
    { name: "Receita Total", value: `${stats.totalRevenue.toLocaleString()} MT`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Vendas Concluídas", value: stats.completedSales.toString(), icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Ticket Médio", value: `${Math.round(stats.averageTicket)} MT`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <AdminPageContainer>
      <DashboardHeader 
        title="Monitor de Vendas" 
        description="Acompanhe a receita e as transações em tempo real."
      >
        <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-bold text-[#143361] shadow-sm hover:bg-zinc-50 transition-all font-inter">
          <Download size={18} />
          Exportar CSV
        </button>
      </DashboardHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-3 mb-8">
        {statCards.map((stat, i) => (
          <StatsCard 
            key={stat.name}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bg={stat.bg}
            index={i}
            trend="+Real-time"
          />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl md:rounded-[2rem] border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                   type="text" 
                   placeholder="Pesquisar por telefone ou nome..."
                   className="w-full bg-zinc-50 border border-zinc-100 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#143361] transition-all"
                />
            </div>
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
                    <Filter size={14} />
                    Filtrar
                </button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Cliente / Telefone</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Documento</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Referência</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-zinc-100 rounded-full w-full" /></td>
                  </tr>
                ))
              ) : salesData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-sm font-bold text-zinc-500">Nenhuma venda registada.</p>
                  </td>
                </tr>
              ) : (
                salesData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#143361]">{sale.profiles?.full_name || sale.metadata?.full_name || "Convidado"}</p>
                      <p className="text-[10px] text-zinc-400 font-mono italic">{sale.metadata?.phone_number || "S/ Telefone"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-zinc-600 truncate max-w-[200px]">{sale.metadata?.doc_title || "Documento"}</p>
                      <p className="text-[10px] text-zinc-400">
                        {format(new Date(sale.created_at), "dd MMM yyyy, HH:mm", { locale: pt })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-[#143361]">{sale.amount} MT</td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">{sale.mpesa_ref || sale.payment_reference || "---"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        sale.status === 'COMPLETED' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {sale.status === 'COMPLETED' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageContainer>
  );
}
