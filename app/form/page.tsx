"use client";

import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DocumentPreview from "../../components/DocumentPreview";
import { createBrowserSupabase } from "../../src/lib/supabase";

const STEPS = ["Identidade", "Detalhes", "Revisão"];

function FormContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    biNumber: "",
    nuit: "",
    fatherName: "",
    motherName: "",
    targetAuthority: "",
    institutionName: "",
    positionName: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [templateData, setTemplateData] = useState<{ content: string; price: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("template");

  useEffect(() => {
    async function fetchTemplate() {
      if (!slug) {
        setLoading(false);
        return;
      }

      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("templates")
        .select("content, price")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Erro ao buscar modelo:", error.message, error.details, error.hint);
      } else {
        setTemplateData(data);
      }
      setLoading(false);
    }

    fetchTemplate();
  }, [slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors.includes(name)) {
      setErrors((prev) => prev.filter((err) => err !== name));
    }
  };

  const validateStep = () => {
    const newErrors: string[] = [];
    if (currentStep === 0) {
      if (!formData.name) newErrors.push("name");
      if (!formData.biNumber) newErrors.push("biNumber");
      if (!formData.nuit) newErrors.push("nuit");
      if (!formData.fatherName) newErrors.push("fatherName");
      if (!formData.motherName) newErrors.push("motherName");
    } else if (currentStep === 1) {
      if (!formData.targetAuthority) newErrors.push("targetAuthority");
      if (!formData.institutionName) newErrors.push("institutionName");
      if (!formData.positionName) newErrors.push("positionName");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-sm font-medium text-slate-500">Carregando modelo...</p>
        </div>
      </div>
    );
  }

  if (!templateData && slug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">Modelo não encontrado</h2>
        <p className="mt-2 text-slate-600">O modelo solicitado não existe ou foi removido.</p>
        <Link href="/templates" className="mt-6 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white">
          Voltar aos modelos
        </Link>
      </div>
    );
  }

  const currentTemplate = templateData?.content || `Exmo Senhor {{targetAuthority}},\n\nEu, {{name}}, titular do BI nº {{biNumber}} e NUIT {{nuit}}, venho por este meio solicitar ...\n\nAtenciosamente,\n{{name}}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentStep < 2 ? (
        <>
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
              <Link href="/templates" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Voltar aos modelos</span>
              </Link>
              <span className="text-sm font-bold tracking-tight">DOKU</span>
            </div>
          </header>

          <main className="mx-auto max-w-3xl px-6 py-12">
            {/* Stepper */}
            <div className="mb-12">
              <div className="relative flex justify-between">
                {STEPS.map((step, index) => (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        index <= currentStep
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {index < currentStep ? <Check size={20} /> : index + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold uppercase tracking-wider ${
                        index <= currentStep ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
                {/* Progress Line */}
                <div className="absolute top-5 left-0 h-[2px] w-full bg-slate-200 -z-0">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Informações de Identidade</h2>
                  <div className="grid gap-6">
                    <InputField
                      label="Nome Completo"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={errors.includes("name")}
                      placeholder="Ex: João Alberto"
                    />
                    <div className="grid gap-6 sm:grid-cols-2">
                      <InputField
                        label="Número do BI"
                        name="biNumber"
                        value={formData.biNumber}
                        onChange={handleInputChange}
                        error={errors.includes("biNumber")}
                        placeholder="000000000A"
                      />
                      <InputField
                        label="NUIT"
                        name="nuit"
                        value={formData.nuit}
                        onChange={handleInputChange}
                        error={errors.includes("nuit")}
                        placeholder="123456789"
                      />
                    </div>
                    <InputField
                      label="Nome do Pai"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      error={errors.includes("fatherName")}
                      placeholder="Nome completo do pai"
                    />
                    <InputField
                      label="Nome da Mãe"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      error={errors.includes("motherName")}
                      placeholder="Nome completo da mãe"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Detalhes do Destinatário</h2>
                  <div className="grid gap-6">
                    <InputField
                      label="Autoridade de Destino"
                      name="targetAuthority"
                      value={formData.targetAuthority}
                      onChange={handleInputChange}
                      error={errors.includes("targetAuthority")}
                      placeholder="Ex: Exmo. Senhor Director"
                    />
                    <InputField
                      label="Nome da Instituição"
                      name="institutionName"
                      value={formData.institutionName}
                      onChange={handleInputChange}
                      error={errors.includes("institutionName")}
                      placeholder="Ex: Ministério da Educação"
                    />
                    <InputField
                      label="Vaga / Cargo Pretendido"
                      name="positionName"
                      value={formData.positionName}
                      onChange={handleInputChange}
                      error={errors.includes("positionName")}
                      placeholder="Ex: Técnico de Informática"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-8">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`rounded-full px-8 py-3 text-sm font-semibold transition-all min-h-[48px] ${
                    currentStep === 0
                      ? "invisible"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Voltar
                </button>
                <button
                  onClick={handleNext}
                  className="rounded-full bg-blue-600 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 min-h-[48px]"
                >
                  Continuar
                </button>
              </div>
            </div>
          </main>
        </>
      ) : (
        <DocumentPreview
          userData={formData}
          template={currentTemplate}
          price={templateData?.price || "100 MT"}
          onBack={() => setCurrentStep(1)}
          onConfirm={() => router.push("/checkout")}
        />
      )}
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    }>
      <FormContent />
    </Suspense>
  );
}

function InputField({ label, name, value, onChange, error, placeholder }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-slate-600">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`rounded-xl border bg-white px-4 py-3 text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
          error
            ? "border-red-500 ring-1 ring-red-500"
            : "border-slate-200 focus:border-blue-600 focus:ring-blue-600"
        }`}
      />
      {error && <span className="text-xs font-medium text-red-500">Este campo é obrigatório</span>}
    </div>
  );
}
