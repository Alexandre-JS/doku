import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/lib/supabase-server";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // O Middleware já protege esta rota, mas podemos buscar dados extras para a UI se necessário
  if (!user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-[#F4F7F9]">
      <Sidebar />
      
      <div className="flex-1 pl-64">
        {/* Topbar opcional */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Ambiente de Gestão</span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2 text-right">
              <span className="text-sm font-bold text-[#143361] leading-none">{profile?.full_name || user.email?.split('@')[0]}</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{profile?.role}</span>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-zinc-100 bg-zinc-200 shadow-sm overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="User" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
