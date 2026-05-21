const KEYS = {
  remember: 'login_remember',
  email: 'login_saved_email',
  password: 'login_saved_password',
} as const;

export function loadRememberedCredentials(): {
  remember: boolean;
  email: string;
  password: string;
} | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem(KEYS.remember) !== 'true') return null;

  const email = localStorage.getItem(KEYS.email) ?? '';
  const password = localStorage.getItem(KEYS.password) ?? '';
  if (!email && !password) return null;

  return { remember: true, email, password };
}

export function saveRememberedCredentials(email: string, password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.remember, 'true');
  localStorage.setItem(KEYS.email, email);
  localStorage.setItem(KEYS.password, password);
}

export function clearRememberedCredentials(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.remember);
  localStorage.removeItem(KEYS.email);
  localStorage.removeItem(KEYS.password);
}
