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
  LayoutDashboard,
  Plus,
  ArrowRight
} from "lucide-react";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { motion } from "framer-motion";
import { DashboardHeader, StatsCard, AdminPageContainer } from "@/components/admin/DashboardComponents";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export default function AdminDashboard() {
  const supabase = createBrowserSupabase();
  const [stats, setStats] = useState({
    templates: 0,
    variables: 0,
    sales: 0,
    dailyDocs: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Configurar Presence Realtime
    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Contamos todos os IDs únicos presentes no estado
        const count = Object.keys(state).length;
        console.log('[DOKU-Realtime] Presenças detetadas:', count, state);
        setOnlineCount(count);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[DOKU-Realtime] Inscrito no canal de presença');
        }
      });

    async function fetchStats() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [templ, vars, orders, daily, recentOrders, recentTemplates] = await Promise.all([
        supabase.from("templates").select("id", { count: "exact" }),
        supabase.from("global_variables").select("id", { count: "exact" }),
        supabase.from("orders").select("id", { count: "exact" }).eq("status", "COMPLETED"),
        supabase.from("orders")
          .select("id", { count: "exact" })
          .eq("status", "COMPLETED")
          .gte("created_at", today.toISOString()),
        supabase.from("orders")
          .select("id, created_at, amount, status, metadata")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("templates")
          .select("id, created_at, title")
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      setStats({
        templates: templ.count || 0,
        variables: vars.count || 0,
        sales: orders.count || 0,
        dailyDocs: daily.count || 0
      });

      // Combine and sort activities
      const combined = [
        ...(recentOrders.data || []).map((o: any) => ({ ...o, type: 'order' })),
        ...(recentTemplates.data || []).map((t: any) => ({ ...t, type: 'template' }))
      ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);

      setRecentActivity(combined);
    }

    fetchStats();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  const cards = [
    { name: "Total de Minutas", value: stats.templates, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Variáveis Globais", value: stats.variables, icon: Database, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Total de Vendas", value: stats.sales, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Online (Tempo Real)", value: onlineCount, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <AdminPageContainer>
      {/* Header */}
      <DashboardHeader 
        title="Painel de Controlo" 
        description="Gestão centralizada da plataforma DOKU."
      >
        <button className="rounded-xl bg-white border border-zinc-200 px-4 py-2 text-xs font-bold text-[#143361] shadow-sm hover:bg-zinc-50 transition-all">
          Exportar Relatório
        </button>
      </DashboardHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <StatsCard 
            key={card.name}
            name={card.name}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bg={card.bg}
            index={i}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 mt-8">
        {/* Recent Activity */}
        <div className="lg:col-span-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-200 bg-white p-6 md:p-8 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-[#143361] tracking-tight flex items-center gap-2">
                 <Clock size={20} className="text-zinc-400" />
                 Atividade Recente
              </h3>
              <Link href="/admin/sales" className="text-xs font-bold text-[#143361] hover:underline flex items-center gap-1">
                Ver tudo <ArrowRight size={12} />
              </Link>
           </div>
           
           <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <Link 
                    key={activity.id} 
                    href={activity.type === 'template' ? `/admin/templates/${activity.id}` : '/admin/sales'}
                    className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:border-[#143361]/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 shrink-0 rounded-full bg-white flex items-center justify-center border border-zinc-200 ${
                          activity.type === 'template' 
                            ? 'text-blue-500' 
                            : activity.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {activity.type === 'template' ? <Plus size={16} /> : <FileText size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#143361] truncate">
                            {activity.type === 'template' 
                              ? 'Nova Minuta Criada'
                              : (activity.metadata?.full_name || activity.metadata?.nome_completo || 'Usuário Anônimo')
                            }
                          </p>
                          <p className="text-xs text-zinc-500 font-medium truncate">
                            {activity.type === 'template'
                              ? activity.title
                              : (activity.metadata?.doc_title || activity.metadata?.template_name || 'Documento gerado')
                            }
                          </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          {activity.type === 'order' && (
                            <p className="text-xs font-bold text-[#143361]">
                              {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(activity.amount)}
                            </p>
                          )}
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: pt })}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-zinc-300 group-hover:text-[#143361] transition-colors" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-400 italic">
                  Nenhuma atividade recente encontrada.
                </div>
              )}
           </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[1.5rem] md:rounded-[2rem] bg-[#143361] p-8 text-white shadow-xl shadow-blue-100">
               <h3 className="text-lg font-bold mb-2">Suporte Admin</h3>
               <p className="text-sm text-blue-100/80 font-medium mb-6">Precisa de ajuda com o sistema ou suporte técnico?</p>
               <a 
                 href="https://wa.me/258867563555" 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 w-full py-4 bg-[#00A86B] rounded-2xl font-bold text-sm shadow-lg hover:bg-emerald-600 transition-all active:scale-95"
               >
                 Contactar Developer
               </a>
            </div>

            <div className="rounded-[1.5rem] md:rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Atalhos Rápidos</h3>
               <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href="/admin/templates/new"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-all border border-zinc-100"
                  >
                     <Plus size={20} className="text-[#143361]" />
                     <span className="text-[10px] font-bold text-[#143361] uppercase">Nova Minuta</span>
                  </Link>
                  <Link 
                    href="/admin/variables"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-all border border-zinc-100"
                  >
                     <Database size={20} className="text-[#143361]" />
                     <span className="text-[10px] font-bold text-[#143361] uppercase">Variáveis</span>
                  </Link>
               </div>
            </div>
        </div>
      </div>
    </AdminPageContainer>
  );
}
