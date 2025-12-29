"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "../../src/lib/supabase";
import { Loader2, CheckCircle2 } from "lucide-react";

type ProfileForm = {
  full_name: string;
  father_name: string;
  mother_name: string;
  bi_number: string;
  bi_date_issue: string;
  bi_local_issue: string;
  nuit: string;
  birth_date: string;
  province: string;
  district: string;
  neighborhood: string;
  address_details: string;
  phone_number: string;
};

const emptyForm: ProfileForm = {
  full_name: "",
  father_name: "",
  mother_name: "",
  bi_number: "",
  bi_date_issue: "",
  bi_local_issue: "",
  nuit: "",
  birth_date: "",
  province: "",
  district: "",
  neighborhood: "",
  address_details: "",
  phone_number: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();

    const loadProfile = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();

      if (!auth?.user) {
        router.replace("/auth/login?redirectTo=/profile");
        return;
      }

      setUserId(auth.user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, father_name, mother_name, bi_number, bi_date_issue, bi_local_issue, nuit, birth_date, province, district, neighborhood, address_details, phone_number")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = result not found; ignoramos nesse caso
        console.error("Erro ao carregar perfil:", error.message);
        setError("Não foi possível carregar seus dados de perfil.");
      }

      if (profile) {
        setForm({
          full_name: profile.full_name || "",
          father_name: profile.father_name || "",
          mother_name: profile.mother_name || "",
          bi_number: profile.bi_number || "",
          bi_date_issue: profile.bi_date_issue || "",
          bi_local_issue: profile.bi_local_issue || "",
          nuit: profile.nuit || "",
          birth_date: profile.birth_date || "",
          province: profile.province || "",
          district: profile.district || "",
          neighborhood: profile.neighborhood || "",
          address_details: profile.address_details || "",
          phone_number: profile.phone_number || "",
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);
    const supabase = createBrowserSupabase();

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: form.full_name || null,
      father_name: form.father_name || null,
      mother_name: form.mother_name || null,
      bi_number: form.bi_number || null,
      bi_date_issue: form.bi_date_issue || null,
      bi_local_issue: form.bi_local_issue || null,
      nuit: form.nuit || null,
      birth_date: form.birth_date || null,
      province: form.province || null,
      district: form.district || null,
      neighborhood: form.neighborhood || null,
      address_details: form.address_details || null,
      phone_number: form.phone_number || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Erro ao salvar perfil:", error.message);
      setError("Não foi possível salvar seu perfil. Tente novamente.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
          <p className="text-sm text-slate-500 mt-1">
            Atualize seus dados pessoais. Essas informações podem ser usadas para preencher automaticamente seus documentos.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Identidade */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Identidade</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Nome completo"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
              />
              <Field
                label="Nome do pai"
                name="father_name"
                value={form.father_name}
                onChange={handleChange}
              />
              <Field
                label="Nome da mãe"
                name="mother_name"
                value={form.mother_name}
                onChange={handleChange}
              />
              <Field
                label="Data de nascimento"
                name="birth_date"
                type="date"
                value={form.birth_date}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Documentação */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Documentação</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Número do BI"
                name="bi_number"
                value={form.bi_number}
                onChange={handleChange}
              />
              <Field
                label="NUIT"
                name="nuit"
                value={form.nuit}
                onChange={handleChange}
              />
              <Field
                label="Data de emissão do BI"
                name="bi_date_issue"
                type="date"
                value={form.bi_date_issue}
                onChange={handleChange}
              />
              <Field
                label="Local de emissão do BI"
                name="bi_local_issue"
                value={form.bi_local_issue}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Endereço */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Endereço</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Província"
                name="province"
                value={form.province}
                onChange={handleChange}
              />
              <Field
                label="Distrito"
                name="district"
                value={form.district}
                onChange={handleChange}
              />
              <Field
                label="Bairro / Localidade"
                name="neighborhood"
                value={form.neighborhood}
                onChange={handleChange}
              />
              <Field
                label="Endereço detalhado"
                name="address_details"
                value={form.address_details}
                onChange={handleChange}
              />
              <Field
                label="Telefone"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
              />
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>

      {/* Toast simples */}
      {showToast && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/40">
          <CheckCircle2 className="h-4 w-4" />
          <span>Perfil atualizado com sucesso.</span>
        </div>
      )}
    </div>
  );
}

type FieldProps = {
  label: string;
  name: keyof ProfileForm;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Field({ label, name, value, type = "text", onChange }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}
