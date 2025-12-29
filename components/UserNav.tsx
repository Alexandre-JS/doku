"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "../src/lib/supabase";

interface UserInfo {
  id: string;
  email: string | null;
  full_name?: string | null;
}

export default function UserNav() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserSupabase();

    const loadUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        const meta = data.user.user_metadata as any;
        setUser({
          id: data.user.id,
          email: data.user.email ?? null,
          full_name: meta?.full_name || meta?.name || null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  };

  const initial = (user?.full_name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm ring-1 ring-blue-500/40 hover:bg-blue-500"
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 text-slate-50 shadow-xl z-50"
          >
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-0.5">Logado como</p>
              <p className="text-sm font-medium truncate">{user.full_name || user.email}</p>
            </div>
            <nav className="py-1 text-sm">
              <Link
                href="/profile"
                className="block px-4 py-2.5 hover:bg-slate-800/80"
                onClick={() => setOpen(false)}
              >
                Meu Perfil
              </Link>
              <Link
                href="/templates"
                className="block px-4 py-2.5 hover:bg-slate-800/80"
                onClick={() => setOpen(false)}
              >
                Meus Documentos
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2.5 text-left text-red-300 hover:bg-red-500/10"
              >
                Sair
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
