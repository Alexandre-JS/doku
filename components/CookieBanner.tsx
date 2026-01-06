'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
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
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[99] w-full"
      >
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/10 backdrop-blur-sm"
          onClick={() => {
            /* Click outside to close is optional */
          }}
        />

        {/* Cookie Banner Container */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 overflow-hidden rounded-2xl border border-doku-green/20 bg-white shadow-2xl sm:mb-6"
          >
            {/* Main Content */}
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-doku-blue sm:text-lg">
                    ⚙️ Preferências de Cookies
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 sm:text-sm">
                    Utilizamos cookies para melhorar sua experiência no DOKU.
                    Alguns são essenciais para o funcionamento do site, enquanto
                    outros ajudam-nos a entender como você interage com ele.
                  </p>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={acceptNecessary}
                  className="ml-2 flex-shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Expandable Details */}
              <motion.div
                initial={false}
                animate={{ height: showDetails ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 overflow-hidden"
              >
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="cookies-necessary"
                      checked={true}
                      disabled
                      className="mt-1 h-4 w-4 cursor-not-allowed rounded border-slate-300 bg-slate-100 text-doku-blue"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="cookies-necessary"
                        className="block text-xs font-semibold text-doku-blue sm:text-sm"
                      >
                        Cookies Essenciais
                      </label>
                      <p className="mt-1 text-xs text-slate-500">
                        Necessários para o funcionamento do site (autenticação,
                        segurança). Sempre ativados.
                      </p>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="cookies-analytics"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        updatePreferences({
                          analytics: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-doku-green"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="cookies-analytics"
                        className="block text-xs font-semibold text-slate-700 sm:text-sm"
                      >
                        Cookies de Análise
                      </label>
                      <p className="mt-1 text-xs text-slate-500">
                        Ajuda-nos a entender como você usa o DOKU para melhorar
                        sua experiência.
                      </p>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="cookies-marketing"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        updatePreferences({
                          marketing: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-doku-green"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="cookies-marketing"
                        className="block text-xs font-semibold text-slate-700 sm:text-sm"
                      >
                        Cookies de Marketing
                      </label>
                      <p className="mt-1 text-xs text-slate-500">
                        Utilizados para personalizações e conteúdo relevante.
                      </p>
                    </div>
                  </div>

                  {/* Preferences Cookies */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="cookies-preferences"
                      checked={preferences.preferences}
                      onChange={(e) =>
                        updatePreferences({
                          preferences: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-doku-green"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="cookies-preferences"
                        className="block text-xs font-semibold text-slate-700 sm:text-sm"
                      >
                        Cookies de Preferências
                      </label>
                      <p className="mt-1 text-xs text-slate-500">
                        Guardam suas preferências (idioma, tema) para sessões
                        futuras.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Toggle Details Button */}
              <motion.button
                onClick={() => setShowDetails(!showDetails)}
                className="mb-4 flex items-center gap-2 text-xs font-medium text-doku-green transition-colors hover:text-doku-blue sm:text-sm"
              >
                <span>
                  {showDetails
                    ? 'Ocultar detalhes'
                    : 'Ver detalhes e opções'}
                </span>
                <motion.div
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </motion.button>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={acceptNecessary}
                  className="order-2 rounded-lg border-2 border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:border-doku-blue hover:bg-slate-50 sm:order-1 sm:text-sm"
                >
                  Apenas Essenciais
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={acceptAll}
                  className="order-1 rounded-lg bg-gradient-to-r from-doku-blue to-doku-green px-4 py-2 text-xs font-bold text-white shadow-lg transition-all hover:shadow-xl sm:order-2 sm:text-sm"
                >
                  Aceitar Tudo
                </motion.button>
              </div>

              {/* Footer Text */}
              <p className="mt-4 text-center text-[10px] text-slate-500 sm:text-xs">
                Pode gerenciar essas configurações a qualquer momento em
                Privacidade. Saiba mais em nossa{' '}
                <a
                  href="/privacy"
                  className="font-medium text-doku-blue hover:text-doku-green transition-colors"
                >
                  Política de Privacidade
                </a>
                .
              </p>
            </div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-1 w-full origin-left bg-gradient-to-r from-doku-blue to-doku-green"
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
