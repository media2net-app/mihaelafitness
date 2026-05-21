'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  Dumbbell,
  LineChart,
  Trophy,
  UtensilsCrossed,
  Video,
  X,
} from 'lucide-react';
import LanguageSwitch from '@/components/LanguageSwitch';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  formatEur,
  ONLINE_COACHING_MONTHLY_EUR,
  ONLINE_COACHING_YEARLY_DISCOUNT,
  ONLINE_COACHING_YEARLY_EUR,
  ONLINE_COACHING_YEARLY_PER_MONTH_EUR,
} from '@/lib/onlineCoachingPricing';

type BillingPlan = 'monthly' | 'yearly';

const FEATURE_KEYS = ['training', 'food', 'progression', 'workouts', 'goals'] as const;
const FEATURE_ICONS = {
  training: Dumbbell,
  food: UtensilsCrossed,
  progression: LineChart,
  workouts: Video,
  goals: Trophy,
} as const;

export default function StartOnlineCoachingPage() {
  const { language, setLanguage, t } = useLanguage();
  const oc = t.onlineCoachingLanding;

  const [plan, setPlan] = useState<BillingPlan>('yearly');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    setLanguage('ro');
  }, [setLanguage]);

  const features = useMemo(
    () =>
      FEATURE_KEYS.map((key) => ({
        key,
        icon: FEATURE_ICONS[key],
        ...oc.features[key],
      })),
    [oc.features]
  );

  const planLabel =
    plan === 'monthly'
      ? oc.planMonthly.replace('{price}', formatEur(ONLINE_COACHING_MONTHLY_EUR))
      : oc.planYearly
          .replace('{price}', formatEur(ONLINE_COACHING_YEARLY_EUR))
          .replace('{discount}', String(Math.round(ONLINE_COACHING_YEARLY_DISCOUNT * 100)));

  const savingsText = oc.savingsYearly.replace(
    '{amount}',
    formatEur(ONLINE_COACHING_MONTHLY_EUR * 12 - ONLINE_COACHING_YEARLY_EUR)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/online-coaching-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          program: 'Online Coaching',
          interests: ['online-coaching-subscription'],
          notes: `Abonnement: ${planLabel}. Gekozen via /start-online-coaching (${language})`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || oc.registrationFailed);
      }

      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : oc.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const openCheckout = () => {
    setSubmitted(false);
    setError('');
    setShowForm(true);
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-white"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(225,28,72,0.35) 0%, transparent 55%), linear-gradient(180deg, #0f0509 0%, #1a0b12 45%, #120810 100%)',
      }}
    >
      <div
        className="mx-auto flex max-w-lg flex-col px-5 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))] sm:max-w-md sm:px-6"
      >
        {/* Top bar: logo + taal + sluiten */}
        <div className="mb-8 flex items-center justify-between gap-2">
          <Image
            src="/logo/Middel 4.svg"
            alt="Mihaela Fitness"
            width={140}
            height={40}
            className="h-7 w-auto max-w-[42%] shrink min-w-0 object-contain object-left brightness-0 invert sm:h-8 sm:max-w-none"
            priority
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <LanguageSwitch />
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full border text-white/80 transition hover:text-white"
              style={{
                borderColor: 'rgba(245, 210, 224, 0.12)',
                background: '#3d1f2e',
              }}
              aria-label={oc.close}
            >
              <X className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-8 text-center">
          <span className="mb-3 inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
            {oc.badge}
          </span>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{oc.title}</h1>
          <p className="mt-2 text-base text-white/60 sm:text-lg">{oc.subtitle}</p>
        </div>

        {/* Features */}
        <ul className="mb-8 space-y-5">
          {features.map((f) => (
            <li key={f.key} className="flex gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(225, 28, 72, 0.25)', border: '1px solid rgba(249, 168, 217, 0.2)' }}
              >
                <f.icon className="h-5 w-5 text-[#F9A8D9]" />
              </div>
              <div>
                <p className="font-semibold text-white">{f.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-white/55">{f.description}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Pricing cards */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPlan('monthly')}
            className={`relative rounded-2xl p-4 text-left transition-all ${
              plan === 'monthly'
                ? 'ring-2 ring-[#F36088] ring-offset-2 ring-offset-[#1a0b12]'
                : 'ring-1 ring-white/10'
            }`}
            style={{
              background:
                plan === 'monthly'
                  ? 'linear-gradient(145deg, rgba(225,28,72,0.35), rgba(53,24,40,0.9))'
                  : 'rgba(255,255,255,0.05)',
            }}
          >
            {plan === 'monthly' && (
              <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#F36088]">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
            )}
            <p className={`text-xs text-white/50 ${plan === 'monthly' ? 'mt-6' : 'mt-0'}`}>{oc.monthly}</p>
            <p className="mt-1 text-xl font-bold">{formatEur(ONLINE_COACHING_MONTHLY_EUR)}</p>
            <p className="text-xs text-white/45">{oc.perMonth}</p>
          </button>

          <button
            type="button"
            onClick={() => setPlan('yearly')}
            className={`relative rounded-2xl p-4 text-left transition-all ${
              plan === 'yearly'
                ? 'ring-2 ring-[#F36088] ring-offset-2 ring-offset-[#1a0b12]'
                : 'ring-1 ring-white/10'
            }`}
            style={{
              background:
                plan === 'yearly'
                  ? 'linear-gradient(145deg, rgba(225,28,72,0.35), rgba(53,24,40,0.9))'
                  : 'rgba(255,255,255,0.05)',
            }}
          >
            <span className="absolute right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              {oc.popular}
            </span>
            {plan === 'yearly' && (
              <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#F36088]">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
            )}
            <p className={`text-xs text-white/50 ${plan === 'yearly' ? 'mt-6' : 'mt-0'}`}>{oc.yearly}</p>
            <p className="mt-1 text-xl font-bold">{formatEur(ONLINE_COACHING_YEARLY_EUR)}</p>
            <p className="text-xs text-emerald-300/90">
              {formatEur(ONLINE_COACHING_YEARLY_PER_MONTH_EUR)}
              {oc.perMonthShort} · {oc.discountLabel}
            </p>
          </button>
        </div>

        <p className="mb-6 text-center text-xs text-white/40">
          {plan === 'yearly' ? savingsText : oc.flexibleMonthly}
        </p>

        <button
          type="button"
          onClick={openCheckout}
          className="w-full rounded-2xl py-4 text-center text-base font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99]"
          style={{
            background: 'linear-gradient(90deg, #E11C48, #F36088)',
            boxShadow: '0 8px 32px rgba(225, 28, 72, 0.45)',
          }}
        >
          {oc.cta}
        </button>

        {submitted && (
          <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
            {oc.thankYou}
          </p>
        )}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-white/35">
          {oc.legalPrefix}
          <a href="mailto:info@mihaelafitness.com" className="underline hover:text-white/55">
            {oc.privacy}
          </a>
          {oc.legalMiddle}
          <a href="mailto:info@mihaelafitness.com" className="underline hover:text-white/55">
            {oc.terms}
          </a>
          {oc.legalSuffix}
        </p>

        <p className="mt-4 text-center text-sm text-white/45">
          {oc.alreadyClient}{' '}
          <Link href="/login" className="font-medium text-[#F9A8D9] hover:underline">
            {oc.login}
          </Link>
        </p>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !submitting && setShowForm(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl"
            style={{ background: '#2a1220', border: '1px solid rgba(245, 210, 224, 0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{oc.formTitle}</h2>
                <p className="mt-1 text-sm text-white/55">{planLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/50">{oc.formName}</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#F36088]"
                  placeholder={oc.formNamePlaceholder}
                />
              </div>
              <div>
                <label className="text-xs text-white/50">{oc.formEmail}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#F36088]"
                  placeholder="je@email.com"
                />
              </div>
              <div>
                <label className="text-xs text-white/50">{oc.formPhone}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#F36088]"
                  placeholder="+31 6 ..."
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl py-3.5 font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg, #E11C48, #F36088)' }}
              >
                {submitting ? oc.formSubmitting : oc.formSubmit}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
