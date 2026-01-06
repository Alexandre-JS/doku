/**
 * Checkout Session Manager
 * Handles persistent storage of checkout progress across page refreshes
 * Uses cookies to maintain state for sensitive checkout information
 */

import { setSessionCookie, getSecureCookie, clearCookie } from './cookieManager';

export interface CheckoutSessionData {
  formData: Record<string, any>;
  currentStep: number;
  timestamp: number;
  documentType?: string;
  documentNumber?: string;
}

const CHECKOUT_SESSION_KEY = 'doku_checkout_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Save checkout progress to session cookie
 * @param data - Checkout data to persist
 */
export const saveCheckoutSession = (data: Partial<CheckoutSessionData> & { formData: Record<string, any>; currentStep: number }): void => {
  if (typeof window === 'undefined') return;

  const sessionData: CheckoutSessionData = {
    formData: data.formData,
    currentStep: data.currentStep,
    timestamp: data.timestamp || Date.now(),
    documentType: data.documentType,
    documentNumber: data.documentNumber,
  };

  try {
    const serialized = JSON.stringify(sessionData);
    setSessionCookie(CHECKOUT_SESSION_KEY, serialized);
    console.log('[DOKU Checkout] Session saved successfully');
  } catch (error) {
    console.error('[DOKU Checkout] Failed to save session:', error);
  }
};

/**
 * Restore checkout progress from session cookie
 * Checks if session is still valid (not expired)
 * @returns Checkout data or null if no valid session exists
 */
export const restoreCheckoutSession = (): CheckoutSessionData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const sessionString = getSecureCookie(CHECKOUT_SESSION_KEY);
    
    if (!sessionString) {
      return null;
    }

    const sessionData: CheckoutSessionData = JSON.parse(sessionString);
    const elapsed = Date.now() - sessionData.timestamp;

    // Check if session has expired (30 minutes)
    if (elapsed > SESSION_TIMEOUT) {
      console.log('[DOKU Checkout] Session expired, clearing');
      clearCheckoutSession();
      return null;
    }

    console.log(
      `[DOKU Checkout] Session restored (${Math.round(elapsed / 1000)}s old)`
    );
    return sessionData;
  } catch (error) {
    console.error('[DOKU Checkout] Failed to restore session:', error);
    clearCheckoutSession();
    return null;
  }
};

/**
 * Clear checkout session data
 * Called after successful payment or when user starts fresh
 */
export const clearCheckoutSession = (): void => {
  if (typeof window === 'undefined') return;

  clearCookie(CHECKOUT_SESSION_KEY);
  console.log('[DOKU Checkout] Session cleared');
};

/**
 * Check if an active checkout session exists
 */
export const hasCheckoutSession = (): boolean => {
  const session = restoreCheckoutSession();
  return session !== null;
};

/**
 * Get time remaining for active session (in seconds)
 */
export const getSessionTimeRemaining = (): number | null => {
  if (typeof window === 'undefined') return null;

  try {
    const sessionString = getSecureCookie(CHECKOUT_SESSION_KEY);
    
    if (!sessionString) {
      return null;
    }

    const sessionData: CheckoutSessionData = JSON.parse(sessionString);
    const elapsed = Date.now() - sessionData.timestamp;
    const remaining = SESSION_TIMEOUT - elapsed;

    return remaining > 0 ? Math.round(remaining / 1000) : 0;
  } catch {
    return null;
  }
};

/**
 * Initialize session timeout warning
 * Warns user when session is about to expire (5 minutes remaining)
 */
export const initializeSessionWarning = (
  onWarning?: () => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiration
  const checkInterval = 30 * 1000; // Check every 30 seconds
  let warned = false;

  const intervalId = setInterval(() => {
    const remaining = getSessionTimeRemaining();

    if (remaining !== null && remaining > 0 && remaining <= 5 * 60) {
      if (!warned) {
        warned = true;
        onWarning?.();
        console.log(
          `[DOKU Checkout] Session expiring in ${remaining} seconds`
        );
      }
    }

    if (remaining === null || remaining <= 0) {
      clearInterval(intervalId);
      warned = false;
    }
  }, checkInterval);

  return () => clearInterval(intervalId);
};

/**
 * Validate checkout session data integrity
 * Ensures required fields are present
 */
export const isValidCheckoutSession = (
  session: CheckoutSessionData | null
): session is CheckoutSessionData => {
  if (!session) return false;

  return (
    typeof session.formData === 'object' &&
    typeof session.currentStep === 'number' &&
    typeof session.timestamp === 'number'
  );
};

/**
 * Migrate old checkout data format to new format
 * Useful when updating session structure in future versions
 */
export const migrateCheckoutSession = (
  oldData: any
): CheckoutSessionData | null => {
  if (!oldData) return null;

  try {
    return {
      formData: oldData.formData || {},
      currentStep: oldData.currentStep || 0,
      timestamp: oldData.timestamp || Date.now(),
      documentType: oldData.documentType,
      documentNumber: oldData.documentNumber,
    };
  } catch {
    return null;
  }
};

export default {
  saveCheckoutSession,
  restoreCheckoutSession,
  clearCheckoutSession,
  hasCheckoutSession,
  getSessionTimeRemaining,
  initializeSessionWarning,
  isValidCheckoutSession,
  migrateCheckoutSession,
};
