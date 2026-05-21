'use client';

import { useAdminMenu } from '@/components/admin/AdminMenuContext';
import { useOnlineMenu } from '@/components/online/OnlineMenuContext';

export function useAppMenu() {
  const online = useOnlineMenu();
  const admin = useAdminMenu();
  return online ?? admin;
}
