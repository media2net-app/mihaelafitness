'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminNavItems } from '@/lib/adminNavItems';
import OnlinePageHeader from '@/components/online/OnlinePageHeader';

export default function AdminMobileHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const firstName = user?.name?.split(' ')[0] || '';

  const navItems = getAdminNavItems(t);
  const currentPage = navItems.find((item) => {
    if (item.path === '/admin') return pathname === '/admin';
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  });

  const subtitle =
    pathname === '/admin'
      ? t.admin.dashboard.subtitle
      : currentPage?.label ?? t.admin.dashboard.subtitle;

  return (
    <div className="mx-auto max-w-lg px-3 pt-3 sm:max-w-xl sm:px-6 lg:hidden">
      <OnlinePageHeader
        title={t.dashboard.onlineClient.dashboardTitle.replace('{name}', firstName)}
        subtitle={subtitle}
      />
    </div>
  );
}
