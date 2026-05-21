'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import LanguageSwitch from '@/components/LanguageSwitch';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getHomePathForRole } from '@/lib/authRedirects';
import { onlineTheme } from '@/lib/onlineTheme';
import {
  clearRememberedCredentials,
  loadRememberedCredentials,
  saveRememberedCredentials,
} from '@/lib/loginRemember';

const inputClass =
  'w-full min-h-[48px] rounded-2xl border bg-white/[0.06] pl-11 pr-4 text-base text-white placeholder:text-white/35 outline-none transition focus:border-[#F36088]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#F36088]/25';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    const saved = loadRememberedCredentials();
    if (!saved) return;
    setRememberMe(true);
    setEmail(saved.email);
    setPassword(saved.password);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cleared') !== '1') return;
    setCacheCleared(true);
    clearRememberedCredentials();
    window.history.replaceState({}, '', '/login');
  }, []);

  // Already logged in → home (dashboard for clients, admin for admins)
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    router.replace(getHomePathForRole(user?.role));
  }, [authLoading, isAuthenticated, user?.role, router]);

  const copyrightYear = new Date().getFullYear();
  const copyrightText = t.common.copyright.replace('{year}', String(copyrightYear));

  const DEMO_ONLINE_EMAIL = 'demo-online@mihaelafitness.com';
  const DEMO_ONLINE_PASSWORD = 'DemoOnline2025';

  const redirectAfterLogin = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const storedUser = localStorage.getItem('auth_user');
    let role: string | undefined;
    if (storedUser) {
      try {
        role = JSON.parse(storedUser)?.role;
      } catch {
        role = user?.role;
      }
    } else {
      role = user?.role;
    }
    router.replace(getHomePathForRole(role));
  };

  const runLogin = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true);
    setError('');
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        if (rememberMe) {
          saveRememberedCredentials(loginEmail, loginPassword);
        } else {
          clearRememberedCredentials();
        }
        await redirectAfterLogin();
      } else {
        setError(t.login.invalidCredentials);
      }
    } catch {
      setError(t.login.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runLogin(email, password);
  };

  const handleDemoLogin = async () => {
    setEmail(DEMO_ONLINE_EMAIL);
    setPassword(DEMO_ONLINE_PASSWORD);
    await runLogin(DEMO_ONLINE_EMAIL, DEMO_ONLINE_PASSWORD);
  };

  const handleRememberChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) clearRememberedCredentials();
  };

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      style={{ background: onlineTheme.bg, color: onlineTheme.text }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(circle, ${onlineTheme.accent} 0%, transparent 70%)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: `radial-gradient(circle, ${onlineTheme.accentMid} 0%, transparent 70%)` }}
        aria-hidden
      />

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 py-2">
          <Image
            src="/logo/Middel 4.svg"
            alt="Mihaela Fitness"
            width={140}
            height={40}
            className="h-7 w-auto max-w-[48%] shrink min-w-0 object-contain object-left brightness-0 invert sm:h-8 sm:max-w-none"
            priority
          />
          <div className="shrink-0">
            <LanguageSwitch />
          </div>
        </div>

        {/* Hero + form */}
        <div className="flex flex-1 flex-col justify-center py-6 sm:py-10">
          <div className="mb-6 text-center sm:mb-8">
            <h1
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: onlineTheme.accentLight }}
            >
              {t.login.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed sm:text-base" style={{ color: onlineTheme.textMuted }}>
              {t.login.subtitle}
            </p>
          </div>

          <div
            className="rounded-3xl p-5 sm:p-7"
            style={{
              background: `linear-gradient(160deg, ${onlineTheme.card} 0%, ${onlineTheme.bgElevated} 100%)`,
              border: `1px solid ${onlineTheme.cardBorder}`,
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {cacheCleared && (
                <div
                  role="status"
                  className="rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: 'rgba(34, 197, 94, 0.45)',
                    background: 'rgba(20, 83, 45, 0.35)',
                    color: '#bbf7d0',
                  }}
                >
                  {t.login.cacheClearedBanner}
                </div>
              )}
              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: 'rgba(239, 68, 68, 0.45)',
                    background: 'rgba(127, 29, 29, 0.35)',
                    color: '#fecaca',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: onlineTheme.textMuted }}>
                  {t.login.email}
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                    style={{ color: onlineTheme.textDim }}
                  />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    style={{ borderColor: onlineTheme.cardBorder }}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: onlineTheme.textMuted }}>
                  {t.login.password}
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                    style={{ color: onlineTheme.textDim }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                    style={{ borderColor: onlineTheme.cardBorder }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-white/45 transition hover:text-white/80"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <label className="group flex min-h-[44px] cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberChange(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ease-out group-active:scale-95 peer-focus-visible:ring-2 peer-focus-visible:ring-[#F36088]/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#351828]"
                    style={{
                      borderColor: rememberMe ? onlineTheme.accentMid : onlineTheme.cardBorder,
                      background: rememberMe
                        ? `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`
                        : 'rgba(255,255,255,0.06)',
                      boxShadow: rememberMe ? '0 2px 10px rgba(225, 28, 72, 0.4)' : 'none',
                    }}
                    aria-hidden
                  >
                    <Check
                      className={`h-3.5 w-3.5 text-white transition-all duration-200 ${
                        rememberMe ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                      }`}
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-sm leading-snug transition-colors group-hover:text-white/80" style={{ color: onlineTheme.textMuted }}>
                    {t.login.rememberMe}
                  </span>
                </label>
                <button
                  type="button"
                  className="min-h-[44px] shrink-0 px-1 text-sm font-medium transition hover:underline"
                  style={{ color: onlineTheme.accentLight }}
                >
                  {t.login.forgotPassword}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex min-h-[52px] w-full items-center justify-center rounded-2xl text-base font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
                  boxShadow: '0 8px 28px rgba(225, 28, 72, 0.45)',
                }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden
                    />
                    {t.common.loading}
                  </>
                ) : (
                  t.login.loginButton
                )}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <div className="w-full border-t" style={{ borderColor: onlineTheme.cardBorder }} />
                </div>
                <p className="relative mx-auto w-fit bg-transparent px-3 text-xs uppercase tracking-wider text-white/35">
                  {t.login.or}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border text-base font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: onlineTheme.cardBorder,
                  background: 'rgba(255,255,255,0.05)',
                  color: onlineTheme.accentLight,
                }}
              >
                <User className="h-5 w-5 shrink-0" />
                {t.login.demoLogin}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: onlineTheme.textMuted }}>
            {t.login.noAccount}{' '}
            <Link
              href="/start-online-coaching"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: onlineTheme.accentLight }}
            >
              {t.login.signUp}
            </Link>
          </p>
        </div>

        <footer className="py-4 text-center">
          <p className="text-[11px] leading-relaxed" style={{ color: onlineTheme.textDim }}>
            {copyrightText}
          </p>
        </footer>
      </main>
    </div>
  );
}
