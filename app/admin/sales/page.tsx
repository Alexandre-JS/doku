"use client";

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

export default function AdminSalesPage() {
  const stats = [
    { name: "Receita Total", value: "128,450 MT", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Vendas Concluídas", value: "342", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Ticket Médio", value: "375 MT", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const sales = [
    { id: "#8742", customer: "Alexandre Dev", product: "Contrato de Arrendamento", value: "450 MT", status: "Pago", date: "Há 10 min", method: "M-Pesa" },
    { id: "#8741", customer: "Carlos Muhongo", product: "Procuração de Venda", value: "600 MT", status: "Pago", date: "Há 1 hora", method: "M-Pesa" },
    { id: "#8740", customer: "Marta Sitoe", product: "Currículo Moderno", value: "250 MT", status: "Pendente", date: "Há 3 horas", method: "e-Mola" },
    { id: "#8739", customer: "David Langa", product: "Requerimento DUAT", value: "800 MT", status: "Pago", date: "Ontem", method: "M-Pesa" },
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
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={10} />
                +8.2%
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
                   placeholder="Pesquisar transação..."
                   className="w-full bg-zinc-50 border border-zinc-100 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#143361] transition-all"
                />
            </div>
            <div className="flex gap-2">
                <button className="p-2.5 rounded-xl bg-zinc-50 text-zinc-400 hover:text-[#143361] transition-all border border-zinc-100">
                    <Filter size={18} />
                </button>
            </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Cliente</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Produto</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Valor</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Método</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-6 py-4 text-xs font-mono font-bold text-[#143361]">{sale.id}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[#143361]">{sale.customer}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">{sale.date}</p>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-600">{sale.product}</td>
                <td className="px-6 py-4 text-sm font-black text-[#143361]">{sale.value}</td>
                <td className="px-6 py-4">
                   <span className="text-[10px] font-bold px-2 py-1 rounded bg-zinc-100 text-zinc-500 border border-zinc-200 uppercase tracking-tighter">
                      {sale.method}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    sale.status === 'Pago' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {sale.status}
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
