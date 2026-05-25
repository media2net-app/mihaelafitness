'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Home, LineChart, LogOut, Menu, Sparkles, UtensilsCrossed, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatEur, ONLINE_COACHING_MONTHLY_EUR } from '@/lib/onlineCoachingPricing';
import { onlineTheme } from '@/lib/onlineTheme';

const paths = {
  dashboard: '/dashboard',
  schedule: '/schedule',
  food: '/food-tracking',
  progression: '/my-progression',
  lifestyle: '/lifestyle',
} as const;

type OnlineNavProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  dark?: boolean;
};

export default function OnlineNav({ menuOpen, setMenuOpen, dark }: OnlineNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const online = t.dashboard.onlineClient;

  const planPriceLabel = online.activePlanPrice.replace(
    '{price}',
    formatEur(ONLINE_COACHING_MONTHLY_EUR),
  );

  const items = [
    { path: paths.dashboard, icon: Home, label: online.nav.dashboard },
    { path: paths.schedule, icon: Calendar, label: online.nav.training },
    { path: paths.progression, icon: LineChart, label: online.nav.progression },
    { path: paths.food, icon: UtensilsCrossed, label: online.nav.food },
    { path: paths.lifestyle, icon: Sparkles, label: online.nav.lifestyle },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const isActive = (path: string) =>
    pathname === path || (path === paths.progression && pathname.startsWith('/my-progression'));

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <nav
        className={`hidden border-b md:flex ${
          dark ? 'border-white/10 bg-[#1a0b12]/95' : 'border-[#F5D2E0] bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex w-full max-w-lg gap-1 px-4 sm:max-w-xl">
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? dark
                    ? 'border-[#F9A8D9] text-[#F9A8D9]'
                    : 'border-rose-500 text-rose-600'
                  : dark
                    ? 'border-transparent text-white/50 hover:border-white/20 hover:text-white'
                    : 'border-transparent text-gray-600 hover:border-gray-200 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-[min(100%,20rem)] flex-col shadow-2xl transition-transform duration-300 md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: `linear-gradient(180deg, ${onlineTheme.bg} 0%, ${onlineTheme.bgElevated} 100%)`,
          borderLeft: `1px solid ${onlineTheme.cardBorder}`,
        }}
      >
        {/* Header + logo */}
        <div
          className="flex items-center justify-between border-b px-4 py-4"
          style={{ borderColor: onlineTheme.cardBorder }}
        >
          <Image
            src="/logo/Middel 4.svg"
            alt="Mihaela Fitness"
            width={140}
            height={42}
            className="h-9 w-auto brightness-0 invert"
            priority
          />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={online.menuTitle}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Account */}
        {user && (
          <div
            className="mx-3 mt-4 rounded-2xl p-4"
            style={{
              background: onlineTheme.card,
              border: `1px solid ${onlineTheme.cardBorder}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/15">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.name}
                    fill
                    className="object-cover object-top"
                    sizes="48px"
                  />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{user.name}</p>
                <p className="mt-0.5 truncate text-sm text-white/50">{user.email}</p>
              </div>
            </div>
            <div
              className="mt-3 inline-flex flex-wrap items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: 'rgba(225, 28, 72, 0.35)',
                color: onlineTheme.accentLight,
                border: '1px solid rgba(249, 168, 217, 0.25)',
              }}
            >
              <span>{online.activePlan}</span>
              <span className="text-white/40">·</span>
              <span>{planPriceLabel}</span>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 pt-4">
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-white'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
              style={
                isActive(item.path)
                  ? {
                      background: 'rgba(225, 28, 72, 0.35)',
                      border: '1px solid rgba(249, 168, 217, 0.2)',
                    }
                  : undefined
              }
            >
              <item.icon className="h-5 w-5 shrink-0" style={{ color: onlineTheme.accentLight }} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t p-3" style={{ borderColor: onlineTheme.cardBorder }}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            {t.dashboard.logout}
          </button>
        </div>
      </aside>
    </>
  );
}

export function OnlineMenuButton({
  onClick,
  className = '',
}: {
  onClick: () => void;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${className}`.trim()}
      style={{
        background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
        boxShadow: '0 4px 14px rgba(225, 28, 72, 0.45)',
      }}
      aria-label={t.dashboard.onlineClient.openMenu}
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
