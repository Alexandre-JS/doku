"use client";

import { useEffect, useState } from "react";
import { usePathname, redirect } from "next/navigation";
import Image from "next/image";
import { createBrowserSupabase } from "@/src/lib/supabase";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, Bell } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createBrowserSupabase();
  const pathname = usePathname();

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect("/auth/login?redirectTo=/admin");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user?.id)
        .single();
      
      setProfile(profile);
    }
    getUserData();
  }, [supabase]);

  // Close sidebar on navigation change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F4F7F9]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-bold text-zinc-400 uppercase tracking-wider">Painel Administrativo</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            <div className="h-8 w-px bg-zinc-200 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end text-right hidden md:flex">
                <span className="text-sm font-bold text-[#143361] leading-none">{profile?.full_name || user?.email?.split('@')[0]}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{profile?.role}</span>
              </div>
              <div className="h-10 w-10 shrink-0 rounded-full border-2 border-zinc-100 bg-zinc-200 shadow-sm overflow-hidden ring-2 ring-white">
                 <Image 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                   alt="User" 
                   width={40} 
                   height={40} 
                 />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
