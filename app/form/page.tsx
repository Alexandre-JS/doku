"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { ArrowLeft, Check, ChevronRight, FileText, Layout, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DocumentPreview from "../../components/DocumentPreview";
import DynamicForm from "../../components/DynamicForm";
import PaymentModal from "../../components/PaymentModal";
import { ToastContainer } from "../../components/Toast";
import { useFormPersistence, useToast } from "../../src/hooks/useFormPersistence";
import { createBrowserSupabase } from "../../src/lib/supabase";
import { FormSection } from "../../src/types";
import LogoLoading from "../../components/LogoLoading";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutType } from "../../src/utils/pdfGenerator";
import {
  saveCheckoutSession,
  restoreCheckoutSession,
  clearCheckoutSession,
  initializeSessionWarning,
} from "../../src/utils/sessionManager";

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
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [templateData, setTemplateData] = useState<{ id: string; content: string; price: string; form_schema?: FormSection[]; title?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [toastList, setToastList] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  }>>([]);

  const searchParams = useSearchParams();
  const slug = searchParams.get("template");

  // Hook de persistência com notificação
  const {
    formData,
    setFormData,
    updateField,
    updateMultiple,
    clearSavedData,
    hasRestoredData,
  } = useFormPersistence(
    {
      full_name: "",
      bi_number: "",
      nuit: "",
      father_name: "",
      mother_name: "",
      target_authority: "",
      institution_name: "",
      position_name: "",
      address: "",
      date: new Date().toLocaleDateString("pt-PT"),
      current_date: new Date().toISOString().split("T")[0],
    },
    {
      storageKey: `doku_form_save_${slug || 'default'}`,
      debounceMs: 500,
      onRestore: (data) => {
        // Mostra toast de recuperação
        addToast(
          "✓ Retomamos o seu preenchimento de onde parou",
          "success",
          3500
        );
      },
    }
  );

  // Preenchimento automático baseado no perfil do utilizador (Auto-fill)
  useEffect(() => {
    const fetchUserProfileAndFill = async () => {
      const supabase = createBrowserSupabase();
      const { data: auth } = await supabase.auth.getUser();

      if (!auth?.user) return;
      setCurrentUser(auth.user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          full_name, 
          father_name, 
          mother_name, 
          bi_number, 
          nuit, 
          address_details,
          phone_number
        `)
        .eq("id", auth.user.id)
        .maybeSingle();

      if (error || !profile) return;

      const newUpdate: Partial<DocumentFormData> = {};
      let autoFilledCount = 0;

      // Mapeamento de chaves do perfil para IDs do formulário (incluindo variações comuns)
      const profileToFormMap: Array<{profileKey: string, formKeys: string[]}> = [
        { profileKey: "full_name", formKeys: ["full_name", "fullName", "nome_completo"] },
        { profileKey: "father_name", formKeys: ["father_name", "fatherName", "nome_pai"] },
        { profileKey: "mother_name", formKeys: ["mother_name", "motherName", "nome_mae"] },
        { profileKey: "bi_number", formKeys: ["bi_number", "biNumber", "num_bi"] },
        { profileKey: "nuit", formKeys: ["nuit", "num_nuit"] },
        { profileKey: "address_details", formKeys: ["address", "endereco", "morada"] },
        { profileKey: "phone_number", formKeys: ["phone", "phone_number", "telemovel"] },
      ];

      profileToFormMap.forEach(({ profileKey, formKeys }) => {
        const val = (profile as any)[profileKey];
        if (val) {
          formKeys.forEach(formKey => {
            // Só preenchemos se o campo estiver vazio ou se não houver dados restaurados significativos
            if (!formData[formKey]) {
              newUpdate[formKey] = val;
              autoFilledCount++;
            }
          });
        }
      });

      if (Object.keys(newUpdate).length > 0) {
        updateMultiple(newUpdate as Record<string, string>);
        addToast(
          "✨ Campos preenchidos automaticamente com base no seu perfil",
          "info",
          4500
        );
      }
    };

    // Pequeno delay para garantir que o useFormPersistence já inicializou
    const timer = setTimeout(() => {
      fetchUserProfileAndFill();
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // Executa apenas uma vez ao montar o componente

  // Função para adicionar toasts
  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToastList((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  // Função para remover toast
  const removeToast = useCallback((id: string) => {
    setToastList((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Restaurar sessão de checkout se existir
  useEffect(() => {
    const restoredSession = restoreCheckoutSession();
    
    if (restoredSession) {
      // Restaura os dados do formulário
      setFormData(restoredSession.formData as DocumentFormData);
      // Restaura o passo
      setCurrentStep(restoredSession.currentStep || 0);
      
      addToast(
        "✓ Sessão de checkout restaurada",
        "info",
        2500
      );
      
      console.log('[DOKU Checkout] Session restored from cookie');
    }

    // Inicializa aviso de expiração de sessão
    const cleanupWarning = initializeSessionWarning(() => {
      addToast(
        "⚠️ Sua sessão expirará em 5 minutos",
        "warning",
        4000
      );
    });

    return cleanupWarning;
  }, []);

  // Salvar sessão de checkout quando dados ou passo mudarem
  useEffect(() => {
    if (formData && Object.keys(formData).some((key) => formData[key])) {
      saveCheckoutSession({
        formData,
        currentStep,
        documentType: slug || undefined,
      });
    }
  }, [formData, currentStep, slug]);

  // Buscar template
  useEffect(() => {
    async function fetchTemplate() {
      if (!slug) {
        setLoading(false);
        return;
      }

      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("templates")
        .select("id, content, price, form_schema, title")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Erro ao buscar modelo:", error.message);
      } else {
        setTemplateData({
          id: data.id,
          content: data.content,
          price: data.price?.toString() || "0",
          form_schema: data.form_schema,
          title: data.title || undefined
        });
        
        // Salvar título e conteúdo no localStorage para uso em outras páginas
        if (data.title) {
          localStorage.setItem("doku_current_doc_title", data.title);
        }
        if (data.content) {
          localStorage.setItem("doku_current_template_content", data.content);
        }
      }
      setLoading(false);
    }

    fetchTemplate();
  }, [slug]);

  const handleFormChange = (newData: DocumentFormData) => {
    updateMultiple(newData);
  };

  const handleFormSubmit = (data: DocumentFormData) => {
    setFormData(data);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentSuccess = useCallback(() => {
    // Limpa dados salvos após sucesso
    clearSavedData();
    // Limpa sessão de checkout
    clearCheckoutSession();
    addToast(
      "✓ Documento gerado com sucesso! Dados removidos por segurança.",
      "success",
      3000
    );
  }, [clearSavedData, addToast]);

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-50/50 blur-[100px]" />
        <div className="absolute bottom-0 left-[20%] w-[50%] h-[50%] rounded-full bg-slate-100/30 blur-[120px]" />
      </div>

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
            {!currentUser && (
              <Link 
                href={`/auth/login?returnTo=/form?template=${slug}`}
                className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900"
              >
                Já tem conta? Entrar
              </Link>
            )}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Perfil Conectado</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1440px] px-6 lg:px-12 pt-4 pb-12">
        {/* Cabeçalho do Documento - Ocupa a largura total ou limitada para leitura */}
        <div className="mb-8 max-w-5xl animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Gerador Inteligente DOKU
            </div>
            
            <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              {templateData?.title || "Preencher Documento"}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tempo: 2 min</span>
              </div>
              
              <div className="h-4 w-px bg-slate-200" />
              
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShieldCheck size={12} strokeWidth={3} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Juridicamente Revisitado</span>
              </div>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FileText size={12} strokeWidth={3} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">PDF em Alta Definição</span>
              </div>
            </div>

            <p className="text-xl leading-relaxed text-slate-500 max-w-2xl font-medium">
              Complete os campos abaixo. Nosso sistema organiza seus dados automaticamente no padrão oficial de Moçambique.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Coluna da Esquerda: Formulário (Mais compacta) */}
          <div className={`lg:col-span-5 ${currentStep === 1 ? 'hidden lg:block' : ''}`}>
            <div className="space-y-8 pb-20">
              <div className="relative rounded-[2.5rem] border border-slate-200 bg-white p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-50" />
                <DynamicForm 
                  schema={templateData?.form_schema || []} 
                  initialData={formData} 
                  onChange={handleFormChange}
                  onNext={handleFormSubmit} 
                />
              </div>

              {/* Botão Flutuante Mobile para Ver Prévia */}
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
                <button
                  onClick={() => setShowMobilePreview(true)}
                  className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-2xl ring-1 ring-white/10 active:scale-95"
                >
                  <FileText size={18} className="text-emerald-400" />
                  Ver Documento
                  <div className="h-4 w-px bg-white/20 mx-1" />
                  <span className="text-slate-400">Gratis</span>
                </button>
              </div>

              <div className="flex items-start gap-5 rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-400 ring-1 ring-white/20">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-base font-bold text-white tracking-tight">Privacidade Total Garantida</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400 font-medium">
                    Seus dados pessoais nunca são armazenados. A geração do documento ocorre de forma efêmera e segura.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Preview (Documento) */}
          <div className={`lg:col-span-7 ${currentStep === 0 ? 'hidden lg:block' : ''}`}>
            <div className="lg:sticky lg:top-8 pb-10 h-[calc(100vh-64px)] max-h-[900px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative h-full w-full"
                >
                  {currentStep === 0 ? (
                    <div className="group/preview relative h-full w-full">
                      {/* Efeito Glow de Fundo */}
                      <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 rounded-[3rem] blur-2xl opacity-0 group-hover/preview:opacity-100 transition-opacity duration-700" />
                      
                      {/* Badge Superior */}
                      <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-900 border border-slate-700/50 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl">
                        Live Preview
                      </div>
                      
                      <div className="relative h-full rounded-[2.5rem] border border-slate-200 bg-[#EBEEF2] p-0 sm:p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-700 group-hover/preview:scale-[1.01] flex flex-col">
                        {/* Pontilhado técnico */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
                        
                        <DocumentPreview
                          userData={formData}
                          template={currentTemplate}
                          price={templateData?.price || "0"}
                          title={templateData?.title}
                          onBack={() => {}}
                          onConfirm={() => {}}
                          isReadOnly={true}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-full w-full">
                      {/* Badge Superior Revisão */}
                      <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-emerald-600 border border-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl">
                        Revisão Final
                      </div>
                      
                      <div className="relative h-full rounded-[2.5rem] border-2 border-emerald-100 bg-white p-0 sm:p-2 shadow-2xl overflow-hidden flex flex-col">
                         {/* Padrão sutil para revisão */}
                         <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                                 style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />

                        <DocumentPreview
                          userData={formData}
                          template={currentTemplate}
                          price={templateData?.price || "0 MT"}
                          title={templateData?.title}
                          onBack={() => setCurrentStep(0)}
                          onConfirm={() => setIsPaymentModalOpen(true)}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Preview Mobile */}
      <AnimatePresence>
        {showMobilePreview && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              onClick={() => setShowMobilePreview(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 top-12 rounded-t-[3rem] bg-slate-100 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Visualização</span>
                </div>
                <button 
                  onClick={() => setShowMobilePreview(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <DocumentPreview
                  userData={formData}
                  template={currentTemplate}
                  price={templateData?.price || "0"}
                  title={templateData?.title}
                  onBack={() => setShowMobilePreview(false)}
                  onConfirm={() => {
                    setShowMobilePreview(false);
                    handleFormSubmit(formData as DocumentFormData);
                  }}
                  isReadOnly={currentStep === 0}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        formData={formData}
        templateContent={currentTemplate}
        docTitle={templateData?.title || "Documento"}
        price={templateData?.price || "0"}
        layoutType={
          templateData?.title?.toLowerCase().includes('requerimento') ? 'OFFICIAL' :
          (templateData?.title?.toLowerCase().includes('declaração') || templateData?.title?.toLowerCase().includes('compromisso') || templateData?.title?.toLowerCase().includes('contrato')) ? 'DECLARATION' :
          (templateData?.title?.toLowerCase().includes('carta') || templateData?.title?.toLowerCase().includes('manifestação')) ? 'LETTER' :
          'OFFICIAL'
        }
        onSuccess={handlePaymentSuccess}
        userId={currentUser?.id}
        templateId={templateData?.id}
      />

      {/* Toast Container */}
      <ToastContainer 
        toasts={toastList}
        onClose={removeToast}
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

