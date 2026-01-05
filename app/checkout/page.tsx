"use client";

import { useState } from "react";
import { ArrowLeft, ShieldCheck, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "emola">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    if (!phoneNumber) return alert("Por favor, insira o número de telefone.");
    setIsLoading(true);
    
    // Simulate payment process
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Pagamento Confirmado!</h1>
        <p className="mt-2 text-slate-600">Seu documento está sendo processado e será enviado em instantes.</p>
        <Link href="/success" className="mt-8 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 flex items-center gap-2">
          Ver Documento
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-3xl items-center justify-between px-6 max-w-3xl">
          <Link href="/form" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          <span className="text-sm font-bold tracking-tight">Checkout</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid gap-8">
          {/* Order Summary */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Resumo do Pedido</h2>
            <div className="flex items-center gap-4 rounded-2xl bg-slate-100 p-4 ring-1 ring-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Smartphone size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Documento: Requerimento</h3>
                <p className="text-xs text-slate-500">Processamento instantâneo</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-slate-900">100 MT</span>
              </div>
            </div>
          </section>

          {/* Payment Method Selection */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Método de Pagamento</h2>
            <div className="grid grid-cols-2 gap-4">
              <PaymentCard
                id="mpesa"
                name="M-Pesa"
                image="/m-pesa.png"
                active={paymentMethod === "mpesa"}
                onClick={() => setPaymentMethod("mpesa")}
                color="bg-red-600"
              />
              <PaymentCard
                id="emola"
                name="e-Mola"
                image="/e-mola.png"
                active={paymentMethod === "emola"}
                onClick={() => setPaymentMethod("emola")}
                color="bg-orange-500"
              />
            </div>
          </section>

          {/* Input Section */}
          <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Número de Telefone {paymentMethod === "mpesa" ? "Vodacom" : "Movitel"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-medium">+258</span>
                <input
                  type="tel"
                  placeholder="8X XXX XXXX"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-16 pr-4 text-lg font-semibold focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="relative flex w-full items-center justify-center rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <motion.img 
                    src="/logo-tra.png" 
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1, 0.9] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-6 w-auto brightness-0 invert" 
                  />
                  <span>Aguardando confirmação do PIN...</span>
                </div>
              ) : (
                "Pagar Agora"
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span className="text-xs font-medium">Pagamento 100% Seguro via Vodacom/Movitel</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function PaymentCard({ id, name, active, onClick, color, image }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all ${
        active ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className={`mb-3 flex h-12 w-full items-center justify-center overflow-hidden`}>
        {image ? (
          <img src={image} alt={name} className="h-full w-auto object-contain" />
        ) : (
          <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center text-white font-black text-xs`}>
            {name[0]}
          </div>
        )}
      </div>
      <span className={`text-sm font-bold ${active ? "text-blue-600" : "text-slate-600"}`}>{name}</span>
      {active && (
        <div className="absolute right-3 top-3 text-blue-600">
          <CheckCircle2 size={20} />
        </div>
      )}
    </button>
  );
}
