import { clearRememberedCredentials } from '@/lib/loginRemember';

const AUTH_KEYS = ['auth_token', 'auth_user'] as const;

/** Clears client-side session, login memory, and auth cookie (best-effort). */
export async function clearAppClientCache(): Promise<void> {
  if (typeof window === 'undefined') return;

  for (const key of AUTH_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
  clearRememberedCredentials();

  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  } catch {
    // Cookie clear is best-effort; local data is already wiped
  }

  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {
      // ignore
    }
  }
}
