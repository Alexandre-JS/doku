"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Smartphone, CheckCircle2, Loader2, Mail, Printer, MessageCircle, ArrowRight } from "lucide-react";
import { generatePDF, LayoutType } from "../src/utils/pdfGenerator";
import { clearSensitiveData } from "../src/utils/cookieManager";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  templateContent: string;
  docTitle: string;
  price: string;
  layoutType?: LayoutType;
  onSuccess?: () => void;
}

export default function PaymentModal({ isOpen, onClose, formData, templateContent, docTitle, price, layoutType, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"summary" | "payment" | "processing" | "success">("summary");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "emola">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [userEmail, setUserEmail] = useState(formData?.email || "");

  // Resetar o modal ao abrir
  useEffect(() => {
    if (isOpen) {
      setStep("summary");
      setPhoneNumber("");
      setError("");
      setUserEmail(formData?.email || "");
    }
  }, [isOpen]);

  const handleConfirmData = () => setStep("payment");

  const handleSendEmail = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }

    setIsSendingEmail(true);
    try {
      // Gerar o PDF sem baixar
      const doc = generatePDF(formData, templateContent, docTitle, layoutType, false);
      const pdfBase64 = doc.output('datauristring');

      const response = await fetch('/api/send-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          email: userEmail,
          docTitle: docTitle
        }),
      });

      if (response.ok) {
        alert("E-mail enviado com sucesso!");
      } else {
        const data = await response.json();
        alert(data.error || "Falha ao enviar e-mail. Tente novamente.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Erro ao enviar e-mail.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendWhatsApp = () => {
    const message = encodeURIComponent(`Olá! Acabei de gerar meu documento "${docTitle}" no Doku e gostaria de uma cópia por aqui.`);
    window.open(`https://wa.me/258847563555?text=${message}`, '_blank');
  };

  const handlePayment = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError("Por favor, insira um número de telefone válido.");
      return;
    }
    
    setError("");
    setStep("processing");
    
    // Simular processamento de pagamento (2 segundos)
    setTimeout(() => {
      if (formData && templateContent) {
        generatePDF(formData, templateContent, docTitle, layoutType);
      }
      setStep("success");
      
      // Limpar cookies sensíveis após sucesso
      clearSensitiveData();
      console.log('[DOKU Security] Cleared sensitive cookies after PDF generation');
      
      // Chamar callback de sucesso
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step !== "processing" ? onClose : undefined}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-4 sm:p-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {step === "success" ? "Documento Pronto!" : "Finalizar Documento"}
            </h3>
            <p className="text-[10px] text-slate-500 sm:text-xs">Passo {step === "summary" ? "1" : step === "payment" ? "2" : "3"} de 3</p>
          </div>
          {step !== "processing" && (
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {step === "summary" && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="rounded-2xl bg-slate-50 p-4 space-y-4 ring-1 ring-slate-100 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nome Completo</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{formData?.full_name || "Alexandre [Sobrenome]"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NUIT</p>
                      <p className="text-sm font-bold text-slate-900">{formData?.nuit || "123 456 789"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Documento</p>
                    <p className="text-sm font-bold text-slate-900">{docTitle}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 p-3 border border-amber-100 sm:p-4">
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed sm:text-xs">
                    "Confirma que estes dados estão corretos? Não será possível editar após o pagamento."
                  </p>
                </div>

                <button
                  onClick={handleConfirmData}
                  className="btn-primary"
                >
                  Confirmar e Ir para Pagamento
                </button>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`btn-mpesa group relative overflow-hidden ${paymentMethod === "mpesa" ? "ring-2 ring-red-600 ring-offset-2" : "opacity-80 grayscale-[0.5]"}`}
                  >
                     <span className="text-lg">Pagar com</span>
                    <img src="/m-pesa.png" alt="M-Pesa" className="h-10 w-auto brightness-0 invert" />
                   
                    {paymentMethod === "mpesa" && <CheckCircle2 size={24} className="ml-auto" />}
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod("emola")}
                    className={`btn-emola group relative overflow-hidden ${paymentMethod === "emola" ? "ring-2 ring-orange-600 ring-offset-2" : "opacity-80 grayscale-[0.5]"}`}
                  >
                    <span className="text-lg">Pagar com</span>
                    <img src="/e-mola.png" alt="e-Mola" className="h-10 w-auto brightness-0 invert" />
                    
                    {paymentMethod === "emola" && <CheckCircle2 size={24} className="ml-auto" />}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Número {paymentMethod === "mpesa" ? "Vodacom" : "Movitel"}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 font-bold">+258</span>
                    <input
                      type="tel"
                      placeholder="8X XXX XXXX"
                      className={`w-full h-16 rounded-xl border ${error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} py-4 pl-16 pr-4 text-lg font-bold focus:border-doku-blue focus:outline-none focus:ring-1 focus:ring-doku-blue`}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (error) setError("");
                      }}
                    />
                  </div>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-red-500 ml-1"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                  <span className="font-bold text-slate-600">Total</span>
                  <span className="text-xl font-black text-slate-900">{price}</span>
                </div>

                <button
                  onClick={handlePayment}
                  className="btn-primary"
                >
                  Pagar Agora
                </button>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative mb-6">
                  <Loader2 size={64} className="text-blue-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Smartphone size={24} className="text-blue-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Processando Pagamento</h2>
                <p className="text-sm text-slate-500 max-w-[240px] mx-auto">
                  Verifique o seu telemóvel e insira o seu PIN para confirmar.
                </p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-4"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Sucesso!</h2>
                <p className="mt-2 text-sm text-slate-600">Documento gerado e baixado com sucesso!</p>

                <div className="mt-8 w-full space-y-5">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">E-mail para Recebimento</p>
                    <input 
                      type="email"
                      placeholder="seu-email@exemplo.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-left">Enviar cópia digital</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button 
                        onClick={handleSendEmail}
                        disabled={isSendingEmail}
                        className="flex items-center justify-center gap-2 rounded-xl bg-doku-blue py-3.5 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingEmail ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Mail size={18} />
                        )}
                        <span className="text-sm">{isSendingEmail ? "Enviando..." : "Por E-mail"}</span>
                      </button>
                      <button 
                        onClick={handleSendWhatsApp}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-[#20bd5a] active:scale-95"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.053 3.754 1.579 5.86 1.579h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span className="text-sm">Por WhatsApp</span>
                      </button>
                    </div>
                    
                    <div className="mt-4 rounded-xl bg-blue-50 p-3 text-left ring-1 ring-blue-100 sm:p-4">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-[11px] mb-1 sm:text-xs">
                        <Printer size={12} className="sm:size-[14px]" />
                        Dica de Mestre
                      </div>
                      <p className="text-[10px] text-blue-800 leading-relaxed sm:text-[11px]">
                        Imprima em papel A4 de 80g para um acabamento mais oficial.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={onClose}
                    className="mt-6 text-sm font-bold text-slate-400 hover:text-doku-blue transition-colors flex items-center gap-2 mx-auto active:scale-95"
                  >
                    Fechar e Voltar ao Editor
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Support */}
        {step !== "success" && (
          <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Pagamento 100% Seguro</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating Support Button (Only on Success) */}
      {step === "success" && (
        <motion.a 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          href="https://wa.me/258847563555" 
          target="_blank"
          className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3.5 font-bold text-white shadow-2xl transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95 z-[110] sm:bottom-8 sm:right-8 sm:gap-3 sm:px-6 sm:py-4"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.053 3.754 1.579 5.86 1.579h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-sm sm:inline sm:text-base">Não baixou? Fale connosco</span>
        </motion.a>
      )}
    </div>
  );
}
