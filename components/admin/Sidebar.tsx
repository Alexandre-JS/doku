"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Settings2, 
  Building2, 
  TrendingUp, 
  Users, 
  LogOut,
  ChevronRight,
  Database
} from "lucide-react";
import { motion } from "framer-motion";
import { createBrowserSupabase } from "@/src/lib/supabase";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Minutas", href: "/admin/templates", icon: FileText },
  { name: "Variáveis", href: "/admin/variables", icon: Database },
  { name: "Empresas", href: "/admin/settings", icon: Building2 }, // Usando o settings existente que tem empresas
  { name: "Vendas", href: "/admin/sales", icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh(); // Garante que o middleware seja reavaliado
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-zinc-200 bg-white z-[100]">
      <div className="flex flex-col h-full p-6">
        {/* Logo */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="h-8 w-8 bg-[#143361] rounded-xl flex items-center justify-center text-white">
            <span className="font-black text-sm">D</span>
          </div>
          <span className="font-black text-lg tracking-tight text-[#143361]">DOKU <span className="text-zinc-400 font-medium text-xs">Admin</span></span>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-blue-50 text-[#143361]" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 h-6 w-1 rounded-r-full bg-[#143361]"
                  />
                )}
                <Icon size={18} className={isActive ? "text-[#143361]" : "text-zinc-400 group-hover:text-zinc-600"} />
                {item.name}
                <ChevronRight size={14} className={`ml-auto opacity-0 transition-opacity ${isActive ? "" : "group-hover:opacity-100 text-zinc-300"}`} />
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-zinc-100 pt-6">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Terminar Sessão
          </button>
        </div>
      </div>
    </aside>
  );
}
