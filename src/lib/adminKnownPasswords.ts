/** Known credentials for admin user table (demo accounts + hardcoded admin logins). */
const KNOWN_LOGIN_PASSWORDS: Record<string, string> = {
  'info@mihaelafitness.com': 'Miki210591',
  'chiel@media2net.nl': 'W4t3rk0k3r^',
  'demo-online@mihaelafitness.com': 'DemoOnline2025',
  'demo-klant@mihaelafitness.com': 'demo123',
  'lazarescu.denisa@mihaelafitness.com': 'Lazarescu2025',
};

export function getKnownLoginPassword(email: string): string | null {
  return KNOWN_LOGIN_PASSWORDS[email.trim().toLowerCase()] ?? null;
}

export function getAllKnownLoginPasswords(): Record<string, string> {
  return { ...KNOWN_LOGIN_PASSWORDS };
}
