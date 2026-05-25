'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminNavItems } from '@/lib/adminNavItems';
import { onlineTheme } from '@/lib/onlineTheme';

type AdminNavProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

type AdminNavContentProps = {
  onNavigate?: () => void;
  showClose?: boolean;
  onClose?: () => void;
};

const asideStyle = {
  background: `linear-gradient(180deg, ${onlineTheme.bg} 0%, ${onlineTheme.bgElevated} 100%)`,
  borderColor: onlineTheme.cardBorder,
};

function AdminNavContent({ onNavigate, showClose, onClose }: AdminNavContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const items = getAdminNavItems(t);

  const isActive = (path: string) => pathname === path;

  const navigate = (path: string) => {
    onNavigate?.();
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
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
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={t.dashboard.onlineClient.menuTitle}
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-9" aria-hidden />
        )}
      </div>

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
            className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: 'rgba(225, 28, 72, 0.35)',
              color: onlineTheme.accentLight,
              border: '1px solid rgba(249, 168, 217, 0.25)',
            }}
          >
            Admin
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 pt-4">
        {items.map((item) => {
          const active = isActive(item.path);
          const highlighted = item.highlighted;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                highlighted
                  ? active
                    ? 'text-white'
                    : 'text-amber-200/90 hover:bg-white/5 hover:text-white'
                  : active
                    ? 'text-white'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
              style={
                active
                  ? highlighted
                    ? {
                        background: 'rgba(234, 179, 8, 0.35)',
                        border: '1px solid rgba(250, 204, 21, 0.25)',
                      }
                    : {
                        background: 'rgba(225, 28, 72, 0.35)',
                        border: '1px solid rgba(249, 168, 217, 0.2)',
                      }
                  : undefined
              }
            >
              <item.icon
                className="h-5 w-5 shrink-0"
                style={{ color: highlighted && !active ? '#FDE68A' : onlineTheme.accentLight }}
              />
              {item.label}
            </button>
          );
        })}
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
    </>
  );
}

export function AdminNavDesktop() {
  return (
    <aside
      className="hidden h-screen w-80 shrink-0 flex-col border-l lg:sticky lg:top-0 lg:flex"
      style={asideStyle}
    >
      <AdminNavContent />
    </aside>
  );
}

export default function AdminNav({ menuOpen, setMenuOpen }: AdminNavProps) {
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const syncOverflow = () => {
      document.body.style.overflow = menuOpen && !mq.matches ? 'hidden' : 'unset';
    };
    syncOverflow();
    mq.addEventListener('change', syncOverflow);
    return () => {
      mq.removeEventListener('change', syncOverflow);
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-[min(100%,20rem)] flex-col shadow-2xl transition-transform duration-300 sm:w-80 lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          ...asideStyle,
          borderLeft: `1px solid ${onlineTheme.cardBorder}`,
        }}
      >
        <AdminNavContent
          showClose
          onClose={() => setMenuOpen(false)}
          onNavigate={() => setMenuOpen(false)}
        />
      </aside>
    </>
  );
}
