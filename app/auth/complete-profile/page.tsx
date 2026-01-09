"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "../../../src/lib/supabase";
import Link from "next/link";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: "",
    nuit: "",
    bi_number: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    async function getUser() {
      const supabase = createBrowserSupabase();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push("/auth/login");
        return;
      }
      
      setUser(user);
      
      // Tentar buscar perfil existente
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          nuit: profile.nuit || "",
          bi_number: profile.bi_number || "",
          address: profile.address || "",
          phone: profile.phone || "",
        });
      }
      
      setLoading(false);
    }
    getUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const supabase = createBrowserSupabase();
      
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...formData, // email e role são mantidos ou ignorados pelo DB se não enviados aqui, mas melhor ser explícito se necessário
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      router.push("/templates");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar o seu perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#143361] border-t-transparent" />
          <p className="text-slate-500 font-bold animate-pulse">Preparando seu ambiente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Lado Esquerdo: Progresso/Intro */}
      <div className="hidden lg:flex lg:w-[400px] flex-col justify-between bg-[#143361] p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981] rounded-full blur-[100px] opacity-10 -mr-32 -mt-32" />
        
        <div>
          <img src="/logo-tra.png" alt="Documoz" className="h-8 brightness-200 mb-16" />
          
          <h1 className="text-3xl font-black mb-6 leading-tight">
            Quase lá! <br />
            <span className="text-[#10b981]">Complete seu perfil.</span>
          </h1>
          <p className="text-blue-100/70 font-medium">
            Estes dados serão usados para preencher automaticamente os seus documentos, poupando-lhe tempo em cada formulário.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex gap-4 items-start">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-xs">1</div>
            <div>
              <p className="font-black text-sm">Conta Criada</p>
              <p className="text-xs text-blue-100/60">Seu acesso foi garantido.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="h-8 w-8 rounded-full bg-blue-500/30 border border-blue-400/50 flex items-center justify-center font-black text-xs shadow-[0_0_15px_rgba(59,130,246,0.5)]">2</div>
            <div>
              <p className="font-black text-sm">Personalização</p>
              <p className="text-xs text-blue-100/60 font-medium">Configure seu auto-preenchimento.</p>
            </div>
          </div>
        </div>
        
        <div className="text-[10px] font-bold text-blue-100/40 uppercase tracking-widest">
          Privacidade Segura • Documoz 2026
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div className="flex-1 flex flex-col p-8 sm:p-16 overflow-y-auto">
        <div className="max-w-xl self-center w-full">
          <div className="mb-12">
            <h2 className="text-2xl font-black text-[#143361] mb-2 tracking-tight">Informações de Auto-fill</h2>
            <p className="text-slate-500 font-medium italic">Pode saltar este passo agora e completar mais tarde no seu perfil, mas recomendamos preencher já.</p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-[#143361] font-bold focus:border-[#143361] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  placeholder="Seu nome como consta no BI"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  NUIT (NIF)
                </label>
                <input
                  type="text"
                  value={formData.nuit}
                  onChange={(e) => setFormData({...formData, nuit: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-[#143361] font-bold focus:border-[#143361] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  placeholder="9 dígitos"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Número do BI
                </label>
                <input
                  type="text"
                  value={formData.bi_number}
                  onChange={(e) => setFormData({...formData, bi_number: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-[#143361] font-bold focus:border-[#143361] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  placeholder="Ex: 110100..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Morada / Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-[#143361] font-bold focus:border-[#143361] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  placeholder="Cidade, Bairro, Rua..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-[#143361] font-bold focus:border-[#143361] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  placeholder="+258..."
                />
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-2xl bg-[#143361] px-6 py-5 text-sm font-black text-white shadow-xl shadow-blue-900/10 transition-all hover:bg-[#1e4a8a] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? "A guardar..." : "Finalizar e Ver Modelos"}
              </button>
              <Link
                href="/templates"
                className="flex items-center justify-center px-6 py-5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Completar mais tarde
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
