"use client";

import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DocumentPreview from "../../components/DocumentPreview";
import DynamicForm from "../../components/DynamicForm";
import { createBrowserSupabase } from "../../src/lib/supabase";
import { FormField, FormSection } from "../../src/types";

const STEPS = ["Identidade", "Detalhes", "Revisão"];

function FormContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    full_name: "",
    bi_number: "",
    nuit: "",
    father_name: "",
    mother_name: "",
    target_authority: "",
    institution_name: "",
    position_name: "",
    address: "",
    date: new Date().toLocaleDateString('pt-PT'),
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [templateData, setTemplateData] = useState<{ content: string; price: string; form_schema?: FormSection[] } | null>(null);
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
        .from("document_templates")
        .select("content_html, price, form_schema")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Erro ao buscar modelo:", error.message, error.details, error.hint);
      } else {
        // Mapeia content_html para content para manter compatibilidade com o resto do código
        setTemplateData({
          content: data.content_html,
          price: data.price?.toString() || "0",
          form_schema: data.form_schema
        });
      }
      setLoading(false);
    }

    fetchTemplate();
  }, [slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors.includes(name)) {
      setErrors((prev: string[]) => prev.filter((err) => err !== name));
    }
  };

  const validateStep = () => {
    const newErrors: string[] = [];
    if (currentStep === 0) {
      if (!formData.full_name) newErrors.push("full_name");
      if (!formData.bi_number) newErrors.push("bi_number");
      if (!formData.nuit) newErrors.push("nuit");
      if (!formData.father_name) newErrors.push("father_name");
      if (!formData.mother_name) newErrors.push("mother_name");
      if (!formData.address) newErrors.push("address");
    } else if (currentStep === 1) {
      if (!formData.target_authority) newErrors.push("target_authority");
      if (!formData.institution_name) newErrors.push("institution_name");
      if (!formData.position_name) newErrors.push("position_name");
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

  const currentTemplate = templateData?.content || `REQUERIMENTO DE EMPREGO\n\nExmo Senhor {{target_authority}},\n\nEu, {{full_name}}, titular do BI nº {{bi_number}} e NUIT {{nuit}}, residente em {{address}}, venho por este meio mui respeitosamente solicitar a V. Excia que se digne autorizar a minha admissão ao concurso para a vaga de {{position_name}} nesta prestigiada instituição.\n\nMais informo que reuni todos os requisitos necessários para o desempenho das funções, conforme atestam os documentos em anexo.\n\nNestes termos, pede deferimento.\n\nMaputo, {{date}}`;

  const handleDynamicSubmit = (data: any) => {
    setFormData(data);
    // Aqui os dados poderiam ser passados pelo parseDocument(currentTemplate, data) 
    // para gerar o texto final, mas o DocumentPreview já faz isso com destaque (highlight)
    setCurrentStep(2); // Pula para a revisão
  };

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
            {templateData?.form_schema ? (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900">Preencha os dados</h1>
                  <p className="text-slate-500 mt-2">Insira as informações necessárias para gerar seu documento.</p>
                </div>
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                  <DynamicForm 
                    schema={templateData.form_schema} 
                    initialData={formData} 
                    onNext={handleDynamicSubmit} 
                  />
                </div>
              </div>
            ) : (
              <>
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
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          error={errors.includes("full_name")}
                          placeholder="Ex: João Alberto"
                        />
                        <div className="grid gap-6 sm:grid-cols-2">
                          <InputField
                            label="Número do BI"
                            name="bi_number"
                            value={formData.bi_number}
                            onChange={handleInputChange}
                            error={errors.includes("bi_number")}
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
                          name="father_name"
                          value={formData.father_name}
                          onChange={handleInputChange}
                          error={errors.includes("father_name")}
                          placeholder="Nome completo do pai"
                        />
                        <InputField
                          label="Nome da Mãe"
                          name="mother_name"
                          value={formData.mother_name}
                          onChange={handleInputChange}
                          error={errors.includes("mother_name")}
                          placeholder="Nome completo da mãe"
                        />
                        <InputField
                          label="Endereço Residencial"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          error={errors.includes("address")}
                          placeholder="Bairro, Rua, Casa nº"
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
                          name="target_authority"
                          value={formData.target_authority}
                          onChange={handleInputChange}
                          error={errors.includes("target_authority")}
                          placeholder="Ex: Exmo. Senhor Director"
                        />
                        <InputField
                          label="Nome da Instituição"
                          name="institution_name"
                          value={formData.institution_name}
                          onChange={handleInputChange}
                          error={errors.includes("institution_name")}
                          placeholder="Ex: Ministério da Educação"
                        />
                        <InputField
                          label="Vaga / Cargo Pretendido"
                          name="position_name"
                          value={formData.position_name}
                          onChange={handleInputChange}
                          error={errors.includes("position_name")}
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
              </>
            )}
          </main>
        </>
      ) : (
        <DocumentPreview
          userData={formData}
          template={currentTemplate}
          price={templateData?.price || "100 MT"}
          onBack={() => setCurrentStep(templateData?.form_schema ? 0 : 1)}
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
