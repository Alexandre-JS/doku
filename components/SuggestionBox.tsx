"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, X, MessageSquarePlus } from "lucide-react";

interface SuggestionBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestionBox({ isOpen, onClose }: SuggestionBoxProps) {
  const [suggestion, setSuggestion] = useState("");
  const [reaction, setReaction] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reactions = [
    { emoji: "😍", label: "Amo" },
    { emoji: "🙂", label: "Bom" },
    { emoji: "😐", label: "Neutro" },
    { emoji: "🙁", label: "Ruim" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion) return;
    
    // Simular envio
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSuggestion("");
      setReaction(null);
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-doku-green/10 text-doku-green">
                <MessageSquarePlus size={24} />
              </div>
              <h3 className="text-xl font-black text-doku-blue">Ajude-nos a crescer</h3>
              <p className="mt-2 text-sm text-slate-500">
                Não encontrou o que procurava? Sugira um novo modelo.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <textarea
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      placeholder="Que outro modelo de documento você gostaria de ver aqui?"
                      className="min-h-[120px] w-full rounded-2xl border-none bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-doku-green outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Feedback:</span>
                      <div className="flex gap-2">
                        {reactions.map((r) => (
                          <button
                            key={r.emoji}
                            type="button"
                            onClick={() => setReaction(r.emoji)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all hover:scale-125 ${
                              reaction === r.emoji ? "bg-doku-green/10 scale-125 ring-2 ring-doku-green/20" : "grayscale hover:grayscale-0"
                            }`}
                            title={r.label}
                          >
                            {r.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!suggestion}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-doku-green px-8 py-3 text-sm font-bold text-white transition-all hover:bg-doku-green/90 hover:shadow-lg active:scale-95 disabled:opacity-50 sm:w-auto"
                    >
                      <Send size={18} />
                      Enviar Sugestão
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-doku-green/10 text-doku-green">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-lg font-bold text-doku-blue">Obrigado pelo feedback!</h4>
                  <p className="mt-2 text-sm text-slate-500">
                    Sua sugestão foi enviada com sucesso para nossa equipe.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
