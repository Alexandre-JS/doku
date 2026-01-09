'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, Loader2, FileCheck, ShieldCheck } from 'lucide-react';
import { subscribeToNewsletter } from '@/src/lib/newsletter-actions';

const NewsletterModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Logic: Show after 5 seconds if not subscribed and not hidden recently
    const checkStatus = () => {
      const isSub = localStorage.getItem('dok_sub');
      const hideUntil = localStorage.getItem('dok_hide');

      if (isSub === 'true') return;

      if (hideUntil) {
        const hideDate = new Date(hideUntil);
        const now = new Date();
        const diffInDays = (now.getTime() - hideDate.getTime()) / (1000 * 3600 * 24);
        if (diffInDays < 3) return;
      }

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);

      return () => clearTimeout(timer);
    };

    checkStatus();
  }, []);

  const handleClose = (isPermanent = false) => {
    if (isPermanent) {
      localStorage.setItem('dok_sub', 'true');
    } else {
      localStorage.setItem('dok_hide', new Date().toISOString());
    }
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    try {
      const result = await subscribeToNewsletter(email, "modal_acesso_antecipado");
      if (result.success) {
        localStorage.setItem('dok_sub', 'true');
        setIsSubscribed(true);
        setMessage(result.message || "Bem-vindo à Dokumoz!");
        
        // Auto-close after 4 seconds of showing success
        setTimeout(() => {
          setIsVisible(false);
        }, 4000);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleClose()}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
          >
            {/* Left Side: Impact Image/Gradient */}
            <div className="md:w-5/12 bg-[#0f172a] relative p-8 flex flex-col justify-center items-center text-white overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-doku-green/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 text-center"
              >
                <div className="bg-doku-green/20 p-4 rounded-3xl inline-block mb-6 shadow-xl shadow-black/20">
                  <ShieldCheck size={48} className="text-doku-green" />
                </div>
                <h2 className="text-3xl font-bold mb-4 leading-tight">
                  Documentação sem<br />
                  <span className="text-doku-green">Complicações</span>
                </h2>
                <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
                  Tratamos dos seus documentos enquanto você foca no que realmente importa.
                </p>
                <div className="flex gap-2 justify-center opacity-70">
                  <FileCheck size={20} />
                  <span className="text-xs uppercase tracking-widest font-medium">Dokumoz Pro</span>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-7/12 p-8 sm:p-12 bg-white flex flex-col relative">
              <button
                onClick={() => handleClose()}
                className="absolute top-6 right-6 text-slate-400 hover:text-[#0f172a] transition-colors p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={24} />
              </button>

              {!isSubscribed ? (
                <div className="my-auto">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="text-doku-green font-bold text-xs uppercase tracking-widest mb-2 block">Acesso Antecipado</span>
                    <h3 className="text-3xl font-black text-[#0f172a] mb-4">Não perca nenhuma novidade!</h3>
                    <p className="text-slate-500 mb-8 max-w-sm">
                      Junte-se à nossa comunidade e receba em primeira mão novos modelos de documentos, dicas legais e atualizações exclusivas do Dokumoz diretamente no seu e-mail.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0f172a] transition-colors" size={20} />
                        <input
                          type="email"
                          placeholder="Digite seu e-mail de contacto"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-[#0f172a] outline-none transition-all text-[#0f172a] font-medium placeholder:text-slate-400"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#0f172a] text-doku-green font-black py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isLoading ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          'ASSINAR AGORA'
                        )}
                      </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        onClick={() => handleClose(true)}
                        className="text-slate-400 hover:text-[#0f172a] text-sm font-semibold transition-colors"
                      >
                        Já estou inscrito
                      </button>
                      <button
                        onClick={() => handleClose()}
                        className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
                      >
                        Talvez mais tarde
                      </button>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="my-auto flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="text-green-500 bg-green-50 p-6 rounded-full mb-6"
                  >
                    <CheckCircle2 size={80} strokeWidth={2.5} />
                  </motion.div>
                  <h3 className="text-2xl font-black text-[#0f172a] mb-3">Bem-vindo a bordo!</h3>
                  <p className="text-slate-500 leading-relaxed max-w-xs">
                    Inscrição realizada! Verifique o seu e-mail <br />
                    <span className="text-[#0f172a] font-bold">{email}</span> <br />
                    para o seu guia gratuito.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterModal;
