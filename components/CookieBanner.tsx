'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, ShieldCheck, Settings2, Cookie } from 'lucide-react';
import { useCookieConsent } from '../src/hooks/useCookieConsent';

export default function CookieBanner() {
  const {
    hasConsented,
    preferences,
    isLoading,
    acceptAll,
    acceptNecessary,
    updatePreferences,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);

  // Don't render if already consented or still loading
  if (isLoading || hasConsented === null || hasConsented === true) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-4 left-4 right-4 z-[100] sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md"
      >
        {/* Main Banner Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all">
          <div className="p-5 sm:p-6">
            {/* Header with Icon */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-doku-blue/5 text-doku-blue">
                <Cookie className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-doku-blue sm:text-lg">
                    Políticas de Cookies
                  </h3>
                  <button
                    onClick={acceptNecessary}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Utilizamos cookies para personalizar conteúdo e melhorar a sua experiência no <span className="font-bold text-doku-blue">DOKU</span>.
                </p>
              </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 space-y-4 overflow-hidden border-t border-slate-100 pt-6"
                >
                  <CookieOption
                    id="ec"
                    title="Cookies Essenciais"
                    description="Necessários para o funcionamento seguro do site e processamento de documentos."
                    checked={true}
                    disabled={true}
                  />
                  <CookieOption
                    id="an"
                    title="Cookies de Análise"
                    description="Ajudam-nos a entender como os usuários interagem com a plataforma."
                    checked={preferences.analytics}
                    onChange={(val) => updatePreferences({ analytics: val })}
                  />
                  <CookieOption
                    id="mk"
                    title="Marketing & Preferências"
                    description="Utilizados para oferecer conteúdo relevante e salvar suas configurações."
                    checked={preferences.marketing}
                    onChange={(val) => updatePreferences({ marketing: val })}
                  />
                  
                  <div className="rounded-2xl bg-slate-50 p-3 flex items-start gap-3 border border-slate-100">
                    <ShieldCheck className="h-5 w-5 text-doku-green shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Seus dados sensíveis (NUIT, BI) são auto-limpos após 24h ou após o download. Segurança DOKU garantida.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions Area */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={acceptAll}
                  className="flex-1 rounded-2xl bg-doku-blue py-3.5 text-sm font-bold text-white shadow-lg shadow-doku-blue/20 transition-all hover:bg-doku-blue/90 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Aceitar Tudo
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`flex h-[48px] w-[48px] items-center justify-center rounded-2xl border transition-all ${
                    showDetails 
                    ? 'border-doku-green bg-doku-green/5 text-doku-green' 
                    : 'border-slate-200 text-slate-500 hover:border-doku-blue hover:text-doku-blue'
                  }`}
                  title="Configurações Granulares"
                >
                  <Settings2 className="h-5 w-5" />
                </button>
              </div>
              
              {!showDetails && (
                <button
                  onClick={acceptNecessary}
                  className="text-center text-[11px] font-medium text-slate-400 hover:text-doku-blue transition-colors"
                >
                  Continuar apenas com cookies essenciais
                </button>
              )}
            </div>

            {/* Bottom Info */}
            <div className="mt-5 flex items-center justify-center gap-4 border-t border-slate-50 pt-4">
              <a href="/privacy" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-doku-blue transition-colors">Privacidade</a>
              <div className="h-1 w-1 rounded-full bg-slate-300 pointer-events-none" />
              <a href="/terms" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-doku-blue transition-colors">Termos</a>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CookieOption({ 
  id, 
  title, 
  description, 
  checked, 
  onChange, 
  disabled = false 
}: { 
  id: string; 
  title: string; 
  description: string; 
  checked: boolean; 
  onChange?: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="relative flex h-5 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className={`h-4 w-4 rounded border-slate-300 transition-colors focus:ring-doku-blue ${
            disabled ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-doku-green'
          }`}
        />
      </div>
      <div className="flex-1">
        <label htmlFor={id} className={`text-xs font-bold leading-none ${disabled ? 'text-slate-400' : 'text-doku-blue group-hover:text-doku-green transition-colors cursor-pointer'}`}>
          {title}
        </label>
        <p className="mt-1 text-[10px] text-slate-500 leading-normal">
          {description}
        </p>
      </div>
    </div>
  );
}

