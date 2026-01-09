"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Smartphone, CheckCircle2, ArrowRight, Loader2, Mail, Printer, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { generatePDF } from "../../src/utils/pdfGenerator";

export default function CheckoutPage() {
  const [step, setStep] = useState<"summary" | "payment" | "processing" | "success">("summary");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "emola">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [docTitle, setDocTitle] = useState("Documento");
  const [formData, setFormData] = useState<any>(null);
  const [templateContent, setTemplateContent] = useState("");
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    const savedTitle = localStorage.getItem("doku_current_doc_title");
    const savedData = localStorage.getItem("doku_form_data");
    const savedTemplate = localStorage.getItem("doku_current_template_content");
    const savedPrice = localStorage.getItem("doku_current_price");

    if (savedTitle) setDocTitle(savedTitle);
    if (savedData) setFormData(JSON.parse(savedData));
    if (savedTemplate) setTemplateContent(savedTemplate);
    if (savedPrice) {
      const cleanPrice = savedPrice.replace(/\s*MT/gi, '').trim();
      setPrice(Number(cleanPrice) || 0);
    }
  }, []);

  const handleConfirmData = () => {
    if (price === 0) {
      setStep("processing");
      // Simular um carregamento rápido antes de baixar
      setTimeout(() => {
        if (formData && templateContent) {
          generatePDF(formData, templateContent, docTitle);
        }
        setStep("success");
      }, 1000);
    } else {
      setStep("payment");
    }
  };

  const handlePayment = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      return alert("Por favor, insira um número de telefone válido.");
    }
    
    setStep("processing");
    
    // Simular processamento de pagamento (2 segundos)
    setTimeout(() => {
      if (formData && templateContent) {
        generatePDF(formData, templateContent, docTitle);
      }
      setStep("success");
    }, 2000);
  };

  if (step === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
        >
          <CheckCircle2 size={64} />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-900">Documento gerado e baixado com sucesso!</h1>
        <p className="mt-4 max-w-md text-slate-600">
          O seu documento oficial já deve estar na sua pasta de downloads.
        </p>

        <div className="mt-10 grid w-full max-w-md gap-4">
          <button className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95">
            <Mail size={20} />
            Enviar cópia para o meu e-mail
          </button>
          
          <div className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3 text-slate-900 font-bold mb-2">
              <Printer size={18} className="text-blue-600" />
              Instruções de Impressão
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dica: Imprima em papel A4 de 80g para um acabamento mais oficial. Certifique-se de que a impressora está configurada para "Tamanho Real".
            </p>
          </div>
        </div>

        <Link href="/" className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
          Voltar ao Início
          <ArrowRight size={16} />
        </Link>

        {/* Botão de Suporte Flutuante */}
        <a 
          href="https://wa.me/258867563555" 
          target="_blank"
          className="fixed bottom-8 right-8 flex items-center gap-3 rounded-full bg-emerald-500 px-6 py-4 font-bold text-white shadow-2xl transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
        >
          <MessageCircle size={24} />
          <span>Não baixou? Fale connosco agora</span>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-3xl items-center justify-between px-6 max-w-3xl">
          <button 
            onClick={() => step === "payment" ? setStep("summary") : window.history.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <span className="text-sm font-bold tracking-tight">Finalizar Documento</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <AnimatePresence mode="wait">
          {step === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <section>
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Resumo de Dados</h2>
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Nome Completo</p>
                      <p className="font-bold text-slate-900">{formData?.full_name || "Alexandre [Sobrenome]"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">NUIT</p>
                      <p className="font-bold text-slate-900">{formData?.nuit || "123 456 789"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Documento</p>
                      <p className="font-bold text-slate-900">{docTitle}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                    <p className="text-sm text-amber-800 font-medium leading-relaxed">
                      "Confirma que estes dados estão corretos? Não será possível editar após {price === 0 ? 'gerar o documento' : 'o pagamento'}."
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmData}
                    className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                  >
                    {price === 0 ? 'Baixar PDF Grátis' : 'Confirmar e Ir para Pagamento'}
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section>
                <h2 className="mb-4 text-lg font-bold text-slate-900">Método de Pagamento</h2>
                <div className="grid grid-cols-2 gap-4">
                  <PaymentCard
                    name="M-Pesa"
                    image="/m-pesa.png"
                    active={paymentMethod === "mpesa"}
                    onClick={() => setPaymentMethod("mpesa")}
                    color="bg-red-600"
                  />
                  <PaymentCard
                    name="e-Mola"
                    image="/e-mola.png"
                    active={paymentMethod === "emola"}
                    onClick={() => setPaymentMethod("emola")}
                    color="bg-orange-500"
                  />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <div className="mb-8">
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Número de Telefone {paymentMethod === "mpesa" ? "Vodacom" : "Movitel"}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 font-medium">+258</span>
                    <input
                      type="tel"
                      placeholder="8X XXX XXXX"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-16 pr-4 text-lg font-semibold focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                  <span className="font-bold text-slate-600">Total a pagar</span>
                  <span className="text-2xl font-black text-slate-900">
                    {price === 0 ? 'Grátis' : `${price} MT`}
                  </span>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98]"
                >
                  Pagar Agora
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span className="text-xs font-medium">Pagamento Seguro via {paymentMethod === "mpesa" ? "M-Pesa" : "e-Mola"}</span>
                </div>
              </section>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-8">
                <Loader2 size={80} className="text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone size={32} className="text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {price === 0 ? 'Gerando seu documento' : 'Processando Pagamento'}
              </h2>
              <p className="text-slate-500 max-w-xs mx-auto">
                {price === 0 
                  ? 'Aguarde um momento enquanto preparamos o seu documento oficial...' 
                  : 'Por favor, verifique o seu telemóvel e insira o seu PIN para confirmar a transação.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

interface PaymentCardProps {
  name: string;
  active: boolean;
  onClick: () => void;
  color: string;
  image: string;
}

function PaymentCard({ name, active, onClick, color, image }: PaymentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-3xl border-2 p-8 transition-all ${
        active ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100" : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <div className={`mb-4 flex h-16 w-full items-center justify-center overflow-hidden`}>
        {image ? (
          <img src={image} alt={name} className="h-full w-auto object-contain" />
        ) : (
          <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center text-white font-black text-sm`}>
            {name[0]}
          </div>
        )}
      </div>
      <span className={`text-sm font-bold ${active ? "text-blue-600" : "text-slate-600"}`}>{name}</span>
      {active && (
        <div className="absolute right-4 top-4 text-blue-600">
          <CheckCircle2 size={24} />
        </div>
      )}
    </button>
  );
}
