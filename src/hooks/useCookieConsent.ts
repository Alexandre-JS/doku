/**
 * Cookie Consent Hook
 * Manages cookie consent state and preferences
 * Handles first-time visitors and returning users
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSecureCookie, setConsentCookie } from '../utils/cookieManager';

export interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CONSENT_COOKIE_NAME = 'doku_consent';
const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

/**
 * Hook to manage cookie consent
 * @returns Cookie consent state and methods
 */
export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>(
    DEFAULT_PREFERENCES
  );
  const [isLoading, setIsLoading] = useState(true);

  // Initialize consent state from cookie on mount
  useEffect(() => {
    const initializeConsent = () => {
      try {
        const consentCookie = getSecureCookie(CONSENT_COOKIE_NAME);

        if (consentCookie) {
          const parsed = JSON.parse(consentCookie);
          setPreferences(parsed);
          setHasConsented(true);
        } else {
          setHasConsented(false);
          setPreferences(DEFAULT_PREFERENCES);
        }
      } catch (error) {
        console.error('[DOKU Consent] Failed to parse consent cookie:', error);
        setHasConsented(false);
        setPreferences(DEFAULT_PREFERENCES);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConsent();
  }, []);

  /**
   * Accept all cookies
   */
  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    setPreferences(allAccepted);
    setConsentCookie(CONSENT_COOKIE_NAME, JSON.stringify(allAccepted));
    setHasConsented(true);

    console.log('[DOKU Consent] User accepted all cookies');
  }, []);

  /**
   * Accept only necessary cookies
   */
  const acceptNecessary = useCallback(() => {
    const necessaryOnly = DEFAULT_PREFERENCES;

    setPreferences(necessaryOnly);
    setConsentCookie(CONSENT_COOKIE_NAME, JSON.stringify(necessaryOnly));
    setHasConsented(true);

    console.log('[DOKU Consent] User accepted necessary cookies only');
  }, []);

  /**
   * Update specific cookie preferences
   */
  const updatePreferences = useCallback(
    (updates: Partial<CookiePreferences>) => {
      const newPreferences: CookiePreferences = {
        ...preferences,
        ...updates,
        necessary: true, // Always required
      };

      setPreferences(newPreferences);
      setConsentCookie(CONSENT_COOKIE_NAME, JSON.stringify(newPreferences));

      console.log('[DOKU Consent] Preferences updated:', newPreferences);
    },
    [preferences]
  );

  /**
   * Reset consent (for testing or user request)
   */
  const resetConsent = useCallback(() => {
    setHasConsented(false);
    setPreferences(DEFAULT_PREFERENCES);
    // Don't clear the cookie, just mark as not consented
  }, []);

  /**
   * Get current consent status
   */
  const isConsentGiven = useCallback(
    (type: keyof CookiePreferences): boolean => {
      return preferences[type] === true;
    },
    [preferences]
  );

  return {
    hasConsented,
    preferences,
    isLoading,
    acceptAll,
    acceptNecessary,
    updatePreferences,
    resetConsent,
    isConsentGiven,
  };
};

export default useCookieConsent;
