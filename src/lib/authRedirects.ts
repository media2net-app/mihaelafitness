import { isAdminRole } from '@/lib/roles';

/** Default landing path after login or when already authenticated. */
export function getHomePathForRole(role: string | null | undefined): '/admin' | '/dashboard' {
  return isAdminRole(role) ? '/admin' : '/dashboard';
}
