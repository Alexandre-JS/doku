"use client";

import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Check, ChevronRight, FileText, Layout, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DocumentPreview from "../../components/DocumentPreview";
import DynamicForm from "../../components/DynamicForm";
import PaymentModal from "../../components/PaymentModal";
import { createBrowserSupabase } from "../../src/lib/supabase";
import { FormSection } from "../../src/types";
import LogoLoading from "../../components/LogoLoading";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutType } from "../../src/utils/pdfGenerator";

const STEPS = [
  { id: "data", title: "Dados", icon: FileText },
  { id: "review", title: "Revisão", icon: Layout },
  { id: "payment", title: "Pagamento", icon: ShieldCheck },
];

interface DocumentFormData {
  full_name: string;
  bi_number: string;
  nuit: string;
  father_name: string;
  mother_name: string;
  target_authority: string;
  institution_name: string;
  position_name: string;
  address: string;
  date: string;
  [key: string]: string;
}

function FormContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [formData, setFormData] = useState<DocumentFormData>({
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
  const [templateData, setTemplateData] = useState<{ content: string; price: string; form_schema?: FormSection[]; title?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("template");

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem("doku_form_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Erro ao carregar dados salvos:", e);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que mudarem (persistência)
  useEffect(() => {
    localStorage.setItem("doku_form_data", JSON.stringify(formData));
  }, [formData]);

  // Pre-preencher data actual se estiver vazia
  useEffect(() => {
    if (!formData.current_date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, current_date: today }));
    }
  }, [formData.current_date]);

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
        console.error("Erro ao buscar modelo:", error.message);
      } else {
        setTemplateData({
          content: data.content_html,
          price: data.price?.toString() || "0",
          form_schema: data.form_schema,
          title: data.title || undefined
        });
        
        // Salvar título e conteúdo no localStorage para uso em outras páginas
        if (data.title) {
          localStorage.setItem("doku_current_doc_title", data.title);
        }
        if (data.content_html) {
          localStorage.setItem("doku_current_template_content", data.content_html);
        }
      }
      setLoading(false);
    }

    fetchTemplate();
  }, [slug]);

  const handleFormChange = (newData: DocumentFormData) => {
    setFormData(newData);
  };

  const handleFormSubmit = (data: DocumentFormData) => {
    setFormData(data);
    setCurrentStep(1); // Vai para a revisão
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LogoLoading size="lg" />
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

  const currentTemplate = templateData?.content || "";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/templates" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft size={20} />
              <span className="hidden text-sm font-medium sm:inline">Voltar</span>
            </Link>
            <Link href="/">
              <img src="/logo-tra.png" alt="DOKU" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Stepper Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === idx;
              const isCompleted = currentStep > idx;
              
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                    isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : 
                    isCompleted ? "bg-green-50 text-green-600" : "text-slate-400"
                  }`}>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isActive ? "border-white/20 bg-white/10" : 
                      isCompleted ? "border-green-200 bg-green-100" : "border-slate-200"
                    }`}>
                      {isCompleted ? <Check size={12} /> : <Icon size={12} />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">{step.title}</span>
                  </div>
                  {idx < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total a pagar</p>
              <p className="text-sm font-black text-slate-900">{templateData?.price || "0"} MT</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Coluna da Esquerda: Formulário */}
          <div className={`lg:col-span-5 ${currentStep === 1 ? 'hidden lg:block' : ''}`}>
            <div className="sticky top-24 space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {templateData?.title || "Preencher Documento"}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Preencha os campos abaixo. O documento será atualizado em tempo real ao lado.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <DynamicForm 
                  schema={templateData?.form_schema || []} 
                  initialData={formData} 
                  onChange={handleFormChange}
                  onNext={handleFormSubmit} 
                />
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-blue-50 p-4 text-blue-700">
                <ShieldCheck size={20} className="shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                  Seus dados estão seguros e serão usados apenas para gerar este documento. Não armazenamos informações sensíveis permanentemente.
                </p>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Preview */}
          <div className={`lg:col-span-7 ${currentStep === 0 ? 'hidden lg:block' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                {currentStep === 0 ? (
                  <div className="relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-slate-900 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl">
                      Visualização em Tempo Real
                    </div>
                    <div className="pointer-events-none opacity-80 scale-[0.95] origin-top transition-all duration-500">
                      <DocumentPreview
                        userData={formData}
                        template={currentTemplate}
                        price={templateData?.price || "0 MT"}
                        title={templateData?.title}
                        onBack={() => {}}
                        onConfirm={() => {}}
                        isReadOnly={true}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-transparent to-slate-50/80">
                      <button 
                        onClick={() => handleFormSubmit(formData)}
                        className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-2xl ring-1 ring-slate-200 transition-all hover:scale-105 active:scale-95"
                      >
                        Revisar Documento Completo
                        <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <DocumentPreview
                    userData={formData}
                    template={currentTemplate}
                    price={templateData?.price || "0 MT"}
                    title={templateData?.title}
                    onBack={() => setCurrentStep(0)}
                    onConfirm={() => setIsPaymentModalOpen(true)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        formData={formData}
        templateContent={currentTemplate}
        docTitle={templateData?.title || "Documento"}
        price={templateData?.price ? `${templateData.price} MT` : "0 MT"}
        layoutType={
          templateData?.title?.toLowerCase().includes('requerimento') ? 'OFFICIAL' :
          (templateData?.title?.toLowerCase().includes('declaração') || templateData?.title?.toLowerCase().includes('compromisso') || templateData?.title?.toLowerCase().includes('contrato')) ? 'DECLARATION' :
          (templateData?.title?.toLowerCase().includes('carta') || templateData?.title?.toLowerCase().includes('manifestação')) ? 'LETTER' :
          'OFFICIAL'
        }
      />
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LogoLoading size="lg" />
      </div>
    }>
      <FormContent />
    </Suspense>
  );
}

