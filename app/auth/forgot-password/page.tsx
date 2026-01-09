"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "../../../src/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabase();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar recuperação de senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#143361]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div>
            <Link href="/">
              <img src="/logo-tra.png" alt="Documoz" className="h-10 w-auto brightness-200" />
            </Link>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-4xl font-black text-white leading-tight mb-6">
              Recupere o seu <br />
              <span className="text-emerald-400">acesso em minutos.</span>
            </h2>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Não se preocupe, acontece aos melhores. Introduza o seu e-mail e nós enviaremos instruções para criar uma nova senha.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-blue-200/60">
            <span>© 2026 Documoz</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[#143361] tracking-tight mb-2">Recuperar Senha</h1>
              <p className="text-slate-500 font-medium">Insira o e-mail associado à sua conta.</p>
            </div>

            {success ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-800">
                <p className="font-bold mb-2">E-mail enviado!</p>
                <p className="text-sm opacity-90 mb-4">Verifique a sua caixa de entrada para continuar.</p>
                <Link href="/auth/login" className="text-sm font-black underline">Voltar para Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Endereço de E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-[#143361] font-bold focus:border-[#143361] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                    placeholder="exemplo@email.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-[#143361] px-4 py-4 text-sm font-black text-white shadow-xl shadow-blue-900/10 transition-all hover:bg-[#1e4a8a] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "A processar..." : "Enviar Link de Recuperação"}
                  </button>
                  <Link href="/auth/login" className="text-center text-sm font-bold text-slate-400 hover:text-slate-600">
                    Cancelar e voltar
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
