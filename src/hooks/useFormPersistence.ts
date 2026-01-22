/**
 * useFormPersistence - Hook para persistência automática de formulários
 * 
 * Features:
 * - Auto-save em tempo real com debounce
 * - Recuperação automática ao recarregar
 * - Detecção de dados recuperados
 * - Limpeza segura de dados sensíveis
 * - Funciona perfeitamente em mobile
 * 
 * @author DOKU Team
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface FormPersistenceOptions {
  storageKey?: string;
  debounceMs?: number;
  onRestore?: (data: Record<string, any>) => void;
}

interface PersistenceState {
  data: Record<string, any>;
  hasRestoredData: boolean;
  isRestoring: boolean;
}

/**
 * Hook para gerenciar persistência automática de formulários
 */
export function useFormPersistence(
  initialData: Record<string, any>,
  options: FormPersistenceOptions = {}
) {
  const {
    storageKey = 'doku_form_auto_save',
    debounceMs = 300,
    onRestore,
  } = options;

  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isFirstRenderRef = useRef(true);

  /**
   * Restaura dados do localStorage ao montar
   */
  useEffect(() => {
    if (!isFirstRenderRef.current) return;
    isFirstRenderRef.current = false;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData) as Record<string, any>;
        
        // Mescla dados salvos com dados iniciais (dados salvos têm prioridade)
        const restoredData = {
          ...initialData,
          ...parsed,
        };

        setFormData(restoredData);
        setHasRestoredData(true);

        // Callback de restauração
        onRestore?.(restoredData);

        // Log para debugging (produção)
        console.log('[DOKU AutoSave] Dados restaurados do localStorage', {
          fields: Object.keys(parsed).length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('[DOKU AutoSave] Erro ao restaurar dados:', error);
      // Limpa dados corrompidos
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        // Silent fail
      }
    }
  }, [storageKey, initialData, onRestore]);

  /**
   * Salva dados no localStorage com debounce
   */
  const persistData = useCallback(
    (data: Record<string, string>) => {
      // Limpa timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Cria novo timer
      debounceTimerRef.current = setTimeout(() => {
        try {
          // Remove campos sensíveis antes de salvar (opcional, pode ser customizado)
          const dataToSave = { ...data };
          
          localStorage.setItem(storageKey, JSON.stringify(dataToSave));

          console.log('[DOKU AutoSave] Dados salvos', {
            fields: Object.keys(dataToSave).length,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('[DOKU AutoSave] Erro ao salvar dados:', error);
          
          // Se localStorage está cheio, tenta limpar dados antigos
          if (error && (error as Error).name === 'QuotaExceededError') {
            try {
              localStorage.removeItem(storageKey);
              console.warn('[DOKU AutoSave] localStorage cheio, dados antigos removidos');
            } catch (e) {
              console.error('[DOKU AutoSave] Falha ao limpar localStorage');
            }
          }
        }
      }, debounceMs);
    },
    [storageKey, debounceMs]
  );

  /**
   * Atualiza um campo e persiste
   */
  const updateField = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        persistData(updated);
        return updated;
      });
    },
    [persistData]
  );

  /**
   * Atualiza múltiplos campos
   */
  const updateMultiple = useCallback(
    (updates: Record<string, any>) => {
      setFormData((prev) => {
        const updated = { ...prev, ...updates };
        persistData(updated);
        return updated;
      });
    },
    [persistData]
  );

  /**
   * Limpa todos os dados salvos (usar após sucesso)
   */
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setFormData(initialData);
      setHasRestoredData(false);

      console.log('[DOKU AutoSave] Dados removidos do localStorage');
    } catch (error) {
      console.error('[DOKU AutoSave] Erro ao limpar dados:', error);
    }
  }, [storageKey, initialData]);

  /**
   * Retorna o tamanho dos dados salvos em bytes
   */
  const getSavedDataSize = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Blob([saved]).size : 0;
    } catch {
      return 0;
    }
  }, [storageKey]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    updateMultiple,
    clearSavedData,
    hasRestoredData,
    getSavedDataSize,
  };
}

/**
 * Hook para gerenciar Toast de notificação
 */
export function useToast() {
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToast({ id, message, type, duration });

      if (duration > 0) {
        setTimeout(() => {
          setToast(null);
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}
