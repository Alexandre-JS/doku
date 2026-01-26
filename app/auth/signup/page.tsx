"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "../../../src/lib/supabase";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Lado Esquerdo: Marketing */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#143361]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-20" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div>
            <Link href="/">
              <img src="/logo-tra.png" alt="Documoz" className="h-10 w-auto brightness-200" />
            </Link>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-4xl font-black text-white leading-tight mb-6">
              Comece agora a <br />
              <span className="text-[#10b981]">poupar tempo real.</span>
            </h2>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Crie uma conta em menos de 1 minuto e tenha acesso a dezenas de modelos de documentos juridicamente válidos em Moçambique.
            </p>
            
            <div className="mt-10 space-y-4">
              {[
                "Modelos atualizados 2024",
                "Exportação em PDF instantânea",
                "Preenchimento automático inteligente"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-blue-100/90 font-medium">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-blue-200/60">
            <span>© 2026 Documoz</span>
            <span className="h-1 w-1 rounded-full bg-blue-200/20" />
            <span>Segurança de nível bancário</span>
          </div>
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Link href="/">
              <img src="/logo-tra.png" alt="Documoz" className="h-8 w-auto" />
            </Link>
          </div>
          
          <Suspense fallback={<div className="text-slate-400">Carregando...</div>}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

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
      const callbackUrl = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `/auth/callback?next=${encodeURIComponent(redirectTo)}`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
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
      const callbackUrl = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
      
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl,
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
      <div className="animate-in zoom-in-95 duration-500 text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-3xl bg-emerald-50 p-6 text-emerald-500 shadow-sm">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-black text-[#143361] mb-4 tracking-tight">Verifique o seu e-mail</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          Enviamos um link de confirmação para <strong className="text-[#143361]">{email}</strong>. Clique no link para ativar a sua conta.
        </p>
        <Link
          href="/auth/login"
          className="inline-block w-full rounded-2xl bg-[#143361] px-4 py-4 text-sm font-black text-white shadow-xl shadow-blue-900/10 transition-all hover:bg-[#1e4a8a]"
        >
          Voltar para Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#143361] tracking-tight mb-2">Criar Conta Grátis</h1>
        <p className="text-slate-500 font-medium">Junte-se ao Documoz e simplifique sua vida burocrática.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      {/* <button
        type="button"
        onClick={handleGoogleSignup}
        className="mb-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-[#143361] shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Cadastrar com Google
      </button>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
          <span className="bg-white px-4 text-slate-300">Ou cadastre com e-mail</span>
        </div>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            Endereço de E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-[#143361] font-bold placeholder:text-slate-400 focus:border-[#143361] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
            placeholder="exemplo@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              Escolha uma senha
            </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-[#143361] font-bold placeholder:text-slate-400 focus:border-[#143361] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
            placeholder="No mínimo 6 caracteres"
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#143361] px-4 py-4 text-sm font-black text-white shadow-xl shadow-blue-900/10 transition-all hover:bg-[#1e4a8a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "A criar conta..." : "Criar Minha Conta"}
        </button>
      </form>

      <p className="mt-10 text-center text-sm font-medium text-slate-500">
        Já tem uma conta?{" "}
        <Link href="/auth/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4">
          Faça login aqui
        </Link>
      </p>
    </div>
  );
}

