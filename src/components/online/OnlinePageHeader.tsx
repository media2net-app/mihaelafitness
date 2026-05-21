'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { onlineTheme } from '@/lib/onlineTheme';
import { OnlineMenuButton } from '@/components/online/OnlineNav';
import { useAppMenu } from '@/hooks/useAppMenu';

type Props = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function OnlineTopMenuRow({ children }: { children?: ReactNode }) {
  const menu = useAppMenu();
  const pathname = usePathname();
  const hideMenu = pathname.startsWith('/my-progression/onboarding');

  return (
    <div className="mb-4 flex items-center gap-3">
      {children ? <div className="min-w-0 flex-1">{children}</div> : <div className="flex-1" />}
      {menu && !hideMenu ? <OnlineMenuButton onClick={menu.openMenu} /> : null}
    </div>
  );
}

export default function OnlinePageHeader({ title, subtitle, trailing }: Props) {
  const { user } = useAuth();
  const menu = useAppMenu();
  const pathname = usePathname();
  const hideMenu = pathname.startsWith('/my-progression/onboarding');
  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <header className="mb-6 flex items-center gap-3">
      <div
        className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/15"
        style={{
          background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
        }}
      >
        {user?.profilePicture ? (
          <Image
            src={user.profilePicture}
            alt={user.name || ''}
            fill
            className="object-cover object-top"
            sizes="44px"
            priority
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
            {firstName.charAt(0).toUpperCase() || 'M'}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: onlineTheme.accentLight }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 truncate text-sm" style={{ color: onlineTheme.textMuted }}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}

      {menu && !hideMenu ? <OnlineMenuButton onClick={menu.openMenu} /> : null}
    </header>
  );
}
