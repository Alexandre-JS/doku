"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Smartphone, CheckCircle2, Loader2, Mail, Printer, MessageCircle, ArrowRight } from "lucide-react";
import { generatePDF, LayoutType } from "../src/utils/pdfGenerator";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  templateContent: string;
  docTitle: string;
  price: string;
  layoutType?: LayoutType;
}

export default function PaymentModal({ isOpen, onClose, formData, templateContent, docTitle, price, layoutType }: PaymentModalProps) {
  const [step, setStep] = useState<"summary" | "payment" | "processing" | "success">("summary");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "emola">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  // Resetar o modal ao abrir
  useEffect(() => {
    if (isOpen) {
      setStep("summary");
      setPhoneNumber("");
      setError("");
    }
  }, [isOpen]);

  const handleConfirmData = () => setStep("payment");

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
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {step === "success" ? "Documento Pronto!" : "Finalizar Documento"}
            </h3>
            <p className="text-xs text-slate-500">Passo {step === "summary" ? "1" : step === "payment" ? "2" : "3"} de 3</p>
          </div>
          {step !== "processing" && (
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "summary" && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="rounded-2xl bg-slate-50 p-6 space-y-4 ring-1 ring-slate-100">
                  <div className="grid grid-cols-2 gap-4">
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

                <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    "Confirma que estes dados estão corretos? Não será possível editar após o pagamento."
                  </p>
                </div>

                <button
                  onClick={handleConfirmData}
                  className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
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
                <div className="grid grid-cols-2 gap-3">
                  <PaymentCard
                    name="M-Pesa"
                    image="/m-pesa.png"
                    active={paymentMethod === "mpesa"}
                    onClick={() => setPaymentMethod("mpesa")}
                  />
                  <PaymentCard
                    name="e-Mola"
                    image="/e-mola.png"
                    active={paymentMethod === "emola"}
                    onClick={() => setPaymentMethod("emola")}
                  />
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
                      className={`w-full rounded-2xl border ${error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} py-4 pl-16 pr-4 text-lg font-bold focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600`}
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

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                  <span className="font-bold text-slate-600">Total</span>
                  <span className="text-xl font-black text-slate-900">{price}</span>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98]"
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

                <div className="mt-8 w-full space-y-3">
                  <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700">
                    <Mail size={18} />
                    Enviar para meu e-mail
                  </button>
                  
                  <div className="rounded-2xl bg-blue-50 p-4 text-left ring-1 ring-blue-100">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                      <Printer size={14} />
                      Dica de Mestre
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Imprima em papel A4 de 80g para um acabamento mais oficial.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  Fechar e Voltar ao Editor
                  <ArrowRight size={14} />
                </button>
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
          href="https://wa.me/258840000000" 
          target="_blank"
          className="fixed bottom-8 right-8 flex items-center gap-3 rounded-full bg-emerald-500 px-6 py-4 font-bold text-white shadow-2xl transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95 z-[110]"
        >
          <MessageCircle size={24} />
          <span className="hidden sm:inline">Não baixou? Fale connosco</span>
        </motion.a>
      )}
    </div>
  );
}

function PaymentCard({ name, image, active, onClick }: { name: string; image: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all ${
        active ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100" : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <div className="mb-2 h-10 w-full overflow-hidden">
        <img src={image} alt={name} className="h-full w-full object-contain" />
      </div>
      <span className={`text-xs font-bold ${active ? "text-blue-600" : "text-slate-600"}`}>{name}</span>
      {active && (
        <div className="absolute right-2 top-2 text-blue-600">
          <CheckCircle2 size={16} />
        </div>
      )}
    </button>
  );
}
