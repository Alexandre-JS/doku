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
        .select(`
          *,
          profiles (full_name)
        `)
        .order("created_at", { ascending: false });

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#143361] tracking-tight">Monitor de Vendas</h2>
          <p className="text-sm text-zinc-500 font-medium font-inter">Acompanhe a receita e as transações em tempo real.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-[#143361] shadow-sm hover:bg-zinc-50 transition-all">
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.name} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={10} />
                +Real-time
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.name}</p>
            <h3 className="mt-1 text-2xl font-black text-[#143361]">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                   type="text" 
                   placeholder="Pesquisar por telefone ou nome..."
                   className="w-full bg-zinc-50 border border-zinc-100 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#143361] transition-all"
                />
            </div>
        </div>
        <table className="w-full text-left border-collapse">
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
            {salesData.map((sale) => (
              <tr key={sale.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[#143361]">{sale.profiles?.full_name || sale.metadata?.full_name || "Convidado"}</p>
                  <p className="text-[10px] text-zinc-400 font-mono italic">{sale.metadata?.phone_number || "S/ Telefone"}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-zinc-600 truncate max-w-[200px]">{sale.metadata?.doc_title || "Documento"}</p>
                  <p className="text-[10px] text-zinc-400">{new Date(sale.created_at).toLocaleString('pt-PT')}</p>
                </td>
                <td className="px-6 py-4 text-sm font-black text-[#143361]">{sale.amount} MT</td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-500">{sale.mpesa_ref || "---"}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
