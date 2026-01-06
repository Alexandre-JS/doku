"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, X, Send, Headphones } from "lucide-react";

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"idle" | "typing" | "message" | "responded">("idle");
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    // Abre o suporte automaticamente após 6 segundos
    const autoOpenTimer = setTimeout(() => {
      setIsOpen(true);
    }, 6000);

    return () => clearTimeout(autoOpenTimer);
  }, []);

  useEffect(() => {
    if (isOpen && step === "idle") {
      const typingTimer = setTimeout(() => {
        setStep("typing");
        const messageTimer = setTimeout(() => setStep("message"), 1500);
        return () => clearTimeout(messageTimer);
      }, 100);
      return () => clearTimeout(typingTimer);
    }
  }, [isOpen, step]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setStep("typing");
    setTimeout(() => setStep("responded"), 1500);
  };

  return (
    <div 
      className="flex flex-col items-end gap-3"
      style={{
        position: 'relative',
        width: 'fit-content'
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-full max-w-[350px] overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl sm:w-80"
          >
            {/* Header */}
            <div className="bg-doku-blue p-3 text-white sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 sm:h-10 sm:w-10">
                    <Headphones size={20} className="text-white" />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-doku-blue bg-green-500"></span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Suporte DOKU</p>
                    <p className="text-[10px] opacity-80">Online agora</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setStep("idle");
                    setUserInput("");
                  }}
                  className="rounded-full p-1 transition-colors hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
              {step === "typing" ? (
                <div className="flex gap-1 py-4">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                </div>
              ) : step === "message" ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="mb-6 text-sm leading-relaxed text-slate-600">
                    Olá! 👋 Como podemos ajudar você hoje? Estamos prontos para tirar suas dúvidas sobre as minutas.
                  </p>

                  <form onSubmit={handleSend} className="mb-6 flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Escreva sua dúvida..."
                      className="flex-1 rounded-xl bg-slate-50 px-4 py-2 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-doku-green"
                    />
                    <button 
                      type="submit"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-doku-green text-white transition-transform active:scale-90"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <p className="mb-4 text-sm font-medium text-doku-blue">
                    Obrigado pelo contacto! 🙏
                  </p>
                  <p className="mb-6 text-xs text-slate-500">
                    Para um atendimento imediato, por favor utilize um dos canais abaixo:
                  </p>
                  <div className="space-y-3">
                    <a 
                      href="https://wa.me/258867563555" 
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#20bd5a] active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.053 3.754 1.579 5.86 1.579h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                    <a 
                      href="tel:+258847563555" 
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-doku-blue py-3 text-sm font-bold text-white transition-all hover:bg-doku-blue/90 active:scale-95"
                    >
                      <Phone size={18} /> Chamada Normal
                    </a>
                  </div>
                </motion.div>
              )}

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <p className="text-[10px] font-medium text-slate-400">
                  Disponível para suporte técnico das 08h às 17h.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-doku-blue text-white shadow-lg ring-2 ring-white transition-all sm:h-14 sm:w-14 sm:ring-4"
      >
        {isOpen ? <X size={24} /> : <Headphones size={24} />}
      </motion.button>
    </div>
  );
}
