"use client";

import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DocumentPreview from "../../components/DocumentPreview";
import DynamicForm from "../../components/DynamicForm";
import { createBrowserSupabase } from "../../src/lib/supabase";
import { FormField, FormSection } from "../../src/types";

const STEPS = ["Revisão"]; // Mantido apenas para compatibilidade mínima

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
  const [templateData, setTemplateData] = useState<{ content: string; price: string; form_schema?: FormSection[]; title?: string } | null>(null);
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
        .select("content_html, price, form_schema, title")
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
          form_schema: data.form_schema,
          title: data.title || undefined
        });
      }
      setLoading(false);
    }

    fetchTemplate();
  }, [slug]);

  // Removido: prefill de perfil (perfil ainda não implementado)

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
              <Link href="/">
                <img src="/logo-tra.png" alt="DOKU" className="h-8 w-auto" />
              </Link>
            </div>
          </header>

          <main className="mx-auto max-w-3xl px-6 py-12">
            {templateData?.form_schema ? (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900">
                    Preencha os dados
                    {templateData?.title && (
                      <span className="ml-2 text-slate-500 font-semibold">— {templateData.title}</span>
                    )}
                  </h1>
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
              <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-center">
                <h2 className="text-xl font-bold text-slate-900">Modelo sem form_schema</h2>
                <p className="text-slate-600 mt-2">Para usar formulários 100% dinâmicos, defina o campo <span className="font-mono">form_schema</span> neste template.</p>
                <Link href="/templates" className="mt-6 inline-block rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white">Voltar aos modelos</Link>
              </div>
            )}
          </main>
        </>
      ) : (
        <DocumentPreview
          userData={formData}
          template={currentTemplate}
          price={templateData?.price || "100 MT"}
          title={templateData?.title}
          layoutType={(templateData?.form_schema as any)?.layout_type}
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
