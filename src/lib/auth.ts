import { Actor } from './types';

const STORAGE_KEY = 'fin21_session';
const LEGACY_KEY = 'fin21_auth_user';

/**
 * Retrieve the current session from localStorage.
 * Returns null if no session exists or if JSON parsing fails.
 */
export function getStoredUser(): Actor | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Actor;
  } catch (err) {
    console.error('Failed to parse stored session:', err);
    return null;
  }
}

/**
 * Persist the session (which now contains the JWT in the apiKey field).
 */
export function setStoredUser(actor: Actor): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actor));
  } catch (err) {
    console.error('Failed to store session:', err);
  }
}

/**
 * Clear the session — used on sign out and on 401.
 */
export function clearStoredUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

/**
 * Extract the JWT from the current session.
 * Returns null if not logged in.
 */
export function getToken(): string | null {
  const user = getStoredUser();
  return user?.apiKey ?? null;
}

/**
 * Check if the current session has a valid-looking JWT.
 * A JWT has three dot-separated base64url segments.
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  return token.split('.').length === 3;
}