export const USER_ROLES = {
  admin: 'admin',
  client: 'client',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function isAdminRole(role: string | null | undefined): boolean {
  return role === USER_ROLES.admin;
}
