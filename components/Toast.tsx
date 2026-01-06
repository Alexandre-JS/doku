'use client';

/**
 * Toast - Notificação discreta e elegante
 * 
 * Features:
 * - Animação suave de entrada/saída
 * - Múltiplos tipos (success, error, info, warning)
 * - Auto-dismiss com duração customizável
 * - Mobile-friendly
 * - Acessibilidade integrada
 * 
 * @author DOKU Team
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-800',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
    Icon: AlertCircle,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
    Icon: Info,
  },
};

export default function Toast({
  message,
  type = 'info',
  onClose,
  duration = 3000,
}: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.Icon;

  React.useEffect(() => {
    if (duration && duration > 0 && onClose) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${config.bg}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${config.icon}`} />
        <p className={`text-sm font-medium ${config.text}`}>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-auto shrink-0 rounded-md p-0.5 transition-colors hover:bg-white/30`}
            aria-label="Fechar notificação"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * ToastContainer - Container para múltiplos toasts
 */
export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  }>;
  onClose?: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => onClose?.(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
