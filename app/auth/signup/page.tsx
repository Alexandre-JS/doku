"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "../../../src/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/templates";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignup = async () => {
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}${redirectTo}`
        : redirectTo;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Não foi possível iniciar o cadastro com Google.");
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao iniciar cadastro com Google.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || "Não foi possível criar a conta.");
        setLoading(false);
        return;
      }

      // Após signup, tentar login automático para simplificar fluxo
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Se não conseguir logar automaticamente, apenas manda para login
        router.push(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
        return;
      }

      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/95 text-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-50 mb-2">Criar conta</h1>
        <p className="text-sm text-slate-400 mb-8">
          Comece a gerar documentos personalizados com poucos cliques.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-50 shadow-sm transition hover:border-slate-500 hover:bg-slate-800"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white text-[10px] font-bold text-slate-900">
            G
          </span>
          Continuar com Google
        </button>

        <div className="mb-4 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          <span>ou use seu e-mail</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Já tem conta?{" "}
          <Link href="/auth/login" className="font-medium text-blue-400 hover:text-blue-300">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
