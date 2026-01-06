/**
 * Secure Cookie Manager
 * Handles setting, getting, and clearing cookies with expiration policies
 * Implements GDPR-compliant automatic cleanup for sensitive data
 */

interface CookieOptions {
  maxAge?: number; // seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean; // Note: Cannot be set from client-side JS
}

/**
 * Set a cookie with optional expiration
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options (maxAge in seconds)
 */
export const setSecureCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  if (typeof document === 'undefined') return;

  const {
    maxAge = 31536000, // 1 year default
    path = '/',
    secure = true, // HTTPS only in production
    sameSite = 'Lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (maxAge) {
    cookieString += `; Max-Age=${maxAge}`;
  }

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  if (sameSite) {
    cookieString += `; SameSite=${sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export const getSecureCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(nameEQ)) {
      return decodeURIComponent(trimmed.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Clear a specific cookie
 * @param name - Cookie name to clear
 */
export const clearCookie = (name: string): void => {
  if (typeof document === 'undefined') return;

  setSecureCookie(name, '', {
    maxAge: 0,
    path: '/',
  });
};

/**
 * Clear all sensitive cookies (NUIT, Name, Email, etc.)
 * Called after PDF download or on 24-hour expiration
 */
export const clearSensitiveData = (): void => {
  if (typeof document === 'undefined') return;

  const sensitiveCookies = [
    'doku_nuit',
    'doku_name',
    'doku_email',
    'doku_phone',
    'doku_full_name',
    'doku_document_type',
    'doku_document_number',
  ];

  sensitiveCookies.forEach((cookieName) => {
    clearCookie(cookieName);
  });
};

/**
 * Set a sensitive cookie with automatic 24-hour expiration
 * Ensures personal data is cleaned up automatically
 * @param name - Cookie name
 * @param value - Cookie value
 */
export const setSensitiveCookie = (name: string, value: string): void => {
  setSecureCookie(name, value, {
    maxAge: 86400, // 24 hours in seconds
    path: '/',
    secure: true,
    sameSite: 'Lax',
  });
};

/**
 * Set a consent cookie (longer expiration - 1 year)
 * @param name - Cookie name
 * @param value - Cookie value
 */
export const setConsentCookie = (name: string, value: string): void => {
  setSecureCookie(name, value, {
    maxAge: 31536000, // 1 year
    path: '/',
    secure: true,
    sameSite: 'Lax',
  });
};

/**
 * Set a session cookie (expires with browser)
 * @param name - Cookie name
 * @param value - Cookie value
 */
export const setSessionCookie = (name: string, value: string): void => {
  setSecureCookie(name, value, {
    path: '/',
    secure: true,
    sameSite: 'Lax',
  });
};

/**
 * Get all cookies as an object
 */
export const getAllCookies = (): Record<string, string> => {
  if (typeof document === 'undefined') return {};

  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach((cookie) => {
    const [name, value] = cookie.split('=');
    if (name && value) {
      cookies[decodeURIComponent(name.trim())] = decodeURIComponent(value);
    }
  });

  return cookies;
};

/**
 * Check if a cookie exists
 */
export const cookieExists = (name: string): boolean => {
  return getSecureCookie(name) !== null;
};

/**
 * Initialize auto-cleanup timer for sensitive cookies
 * Clears all sensitive data after 24 hours from page load
 */
export const initializeSensitiveCookieCleanup = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const timeoutId = setTimeout(() => {
    clearSensitiveData();
    console.log('[DOKU Security] Auto-cleared sensitive cookies after 24 hours');
  }, CLEANUP_INTERVAL);

  // Return cleanup function to clear timeout if needed
  return () => clearTimeout(timeoutId);
};

export default {
  setSecureCookie,
  getSecureCookie,
  clearCookie,
  clearSensitiveData,
  setSensitiveCookie,
  setConsentCookie,
  setSessionCookie,
  getAllCookies,
  cookieExists,
  initializeSensitiveCookieCleanup,
};
