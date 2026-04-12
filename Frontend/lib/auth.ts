// Auth utilities for token management and validation

const TOKEN_KEY = 'token';
const HOUSEHOLD_ID_KEY = 'household_id';

export interface AuthState {
  token: string | null;
  householdId: string | null;
  name: string | null;
  isAuthenticated: boolean;
}

/**
 * Get current auth state from localStorage
 */
export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { token: null, householdId: null, isAuthenticated: false };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const householdId = localStorage.getItem(HOUSEHOLD_ID_KEY);
  const name = localStorage.getItem('family_name');

  return {
    token,
    householdId,
    name,
    isAuthenticated: !!token && !!householdId,
  };
}

/**
 * Set auth tokens in localStorage
 */
export function setAuthTokens(token: string, householdId: string, name?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(HOUSEHOLD_ID_KEY, householdId);
  if (name) localStorage.setItem('family_name', name);
}

/**
 * Clear auth tokens from localStorage
 */
export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(HOUSEHOLD_ID_KEY);
  localStorage.removeItem('family_name');
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get household ID from localStorage
 */
export function getHouseholdId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(HOUSEHOLD_ID_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const { isAuthenticated } = getAuthState();
  return isAuthenticated;
}

/**
 * Decode JWT token (basic decoding, doesn't verify signature)
 */
export function decodeToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
}

/**
 * Get time until token expiration in seconds
 */
export function getTokenExpirationTime(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;

  const expirationTime = decoded.exp * 1000;
  const timeRemaining = expirationTime - Date.now();
  return Math.max(0, Math.floor(timeRemaining / 1000));
}
