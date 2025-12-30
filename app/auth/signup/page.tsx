"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "../../../src/lib/supabase";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/templates";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGoogleSignup = async () => {
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const redirectUrl = typeof window !== "undefined"
        ? window.location.origin + redirectTo
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
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined"
            ? window.location.origin + "/auth/callback?next=" + redirectTo
            : undefined,
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Não foi possível criar a conta.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl px-8 py-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-500/20 p-3 text-green-500">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-50 mb-2">Verifique seu e-mail</h1>
        <p className="text-slate-400 mb-8">
          Enviamos um link de confirmação para <strong>{email}</strong>. Por favor, verifique a sua caixa de entrada para ativar a sua conta.
        </p>
        <Link
          href="/auth/login"
          className="inline-block w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          Ir para Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-50 mb-2">Criar Conta</h1>
      <p className="text-sm text-slate-400 mb-8">
        Junte-se a milhares de profissionais e comece a criar documentos oficiais em segundos.
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
        Cadastrar com Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-500">Ou use o seu e-mail</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="exemplo@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Criando conta..." : "Criar Minha Conta"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Já tem uma conta?{" "}
        <Link href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300">
          Fazer login
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/95 text-slate-50">
      <Suspense fallback={<div className="text-slate-400">Carregando...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
