"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, X, Send } from "lucide-react";

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
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white/20 bg-slate-200 sm:h-10 sm:w-10">
                    <img 
                      src="/assistant-avatar.png" 
                      alt="Assistente DOKU" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Doku+Support&background=003366&color=fff";
                      }}
                    />
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
                      href="https://wa.me/258840000000" 
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white"
                    >
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                    <a 
                      href="tel:+258840000000" 
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-doku-blue py-3 text-sm font-bold text-white"
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
        {isOpen ? <X size={24} /> : (
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <img 
              src="/assistant-avatar.png" 
              alt="Suporte" 
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://ui-avatars.com/api/?name=D&background=003366&color=fff";
              }}
            />
          </div>
        )}
      </motion.button>
    </div>
  );
}
