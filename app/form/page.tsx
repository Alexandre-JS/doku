"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { ArrowLeft, Check, ChevronRight, FileText, Layout, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DocumentPreview from "../../components/DocumentPreview";
import DocumentInlineEditor from "../../components/DocumentInlineEditor";
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
  [key: string]: any;
}

function FormContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [templateData, setTemplateData] = useState<{ id: string; content: string; price: string; form_schema?: FormSection[]; title?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'COMPLETED'>('PENDING');
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

  const handleFormChange = (newData: Record<string, any>) => {
    updateMultiple(newData as DocumentFormData);
  };

  const handleFormSubmit = (data: DocumentFormData) => {
    setFormData(data);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentSuccess = useCallback(() => {
    setPaymentStatus('COMPLETED');
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
        {/* Cabeçalho do Documento - Agora mais sutil por conta do Editor Inline */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              {templateData?.title || "Preencher Documento"}
            </h1>
            <p className="text-lg leading-relaxed text-slate-500 max-w-2xl mx-auto font-medium">
              O editor agora é o próprio documento. Clique sobre os espaços sublinhados para começar a preencher.
            </p>
          </div>
        </div>

        <div className="w-full">
          <DocumentInlineEditor
            template={templateData?.content || ""}
            schema={templateData?.form_schema}
            initialData={formData}
            onChange={handleFormChange}
            price={templateData?.price || "0"}
            isPaid={paymentStatus === 'COMPLETED'}
            onConfirm={() => setIsPaymentModalOpen(true)}
            title={templateData?.title}
          />
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
                  isPaid={paymentStatus === 'COMPLETED'}
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

