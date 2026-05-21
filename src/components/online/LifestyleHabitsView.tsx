'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Check,
  ChevronRight,
  Footprints,
  Moon,
  Plus,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LIFESTYLE_HABIT_CATEGORIES,
  type LifestyleHabitCategory,
} from '@/lib/lifestyleHabits';
import { onlineTheme } from '@/lib/onlineTheme';
import OnlinePageHeader from '@/components/online/OnlinePageHeader';

type HabitRow = {
  key: string;
  category: LifestyleHabitCategory;
  active: boolean;
  doneToday: boolean;
  streak: number;
};

type ApiData = {
  active: string[];
  maxActive: number;
  today: { date: string; completed: number; total: number };
  streaks: Record<string, number>;
  last7Days: Array<{ date: string; completed: number; total: number; rate: number }>;
  habits: HabitRow[];
};

const categoryIcon: Record<LifestyleHabitCategory, typeof Brain> = {
  nutrition: UtensilsCrossed,
  mindset: Brain,
  movement: Footprints,
  sleep: Moon,
};

export default function LifestyleHabitsView() {
  const router = useRouter();
  const { t } = useLanguage();
  const { token } = useAuth();
  const ls = t.dashboard.onlineClient.lifestyle;

  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/online-habits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
      else setError('load');
    } catch {
      setError('load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (body: Record<string, string>) => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/online-habits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.error === 'max_active') setError('max');
        else setError('save');
        return;
      }
      await load();
    } catch {
      setError('save');
    } finally {
      setSaving(false);
    }
  };

  const activeHabits = useMemo(
    () => (data?.habits ?? []).filter((h) => h.active),
    [data?.habits],
  );

  const habitText = (key: string) => {
    const habits = ls.habits as Record<
      string,
      { title: string; desc: string; tip: string }
    >;
    return habits[key] ?? { title: key, desc: '', tip: '' };
  };

  const categoryLabel = (cat: LifestyleHabitCategory) =>
    ls.categories[cat] ?? cat;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: onlineTheme.accentMid }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-12 pt-4 sm:max-w-xl sm:px-6 md:pt-2">
      <OnlinePageHeader title={ls.title} subtitle={ls.subtitle} />

      {/* Education */}
      <section
        className="mb-5 rounded-3xl p-5"
        style={{
          background: `linear-gradient(145deg, ${onlineTheme.card} 0%, ${onlineTheme.bgElevated} 100%)`,
          border: `1px solid ${onlineTheme.cardBorder}`,
        }}
      >
        <h2 className="text-lg font-semibold leading-snug text-white">{ls.heroTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{ls.heroBody}</p>
      </section>

      <section
        className="mb-5 rounded-3xl p-5"
        style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
      >
        <h2 className="mb-3 text-base font-semibold text-white">{ls.philosophyTitle}</h2>
        <ul className="space-y-2.5">
          {ls.philosophyPoints.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm text-white/75">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: onlineTheme.accentLight }}
              />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mb-6 rounded-3xl p-5"
        style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
      >
        <h2 className="mb-3 text-base font-semibold text-white">{ls.howTitle}</h2>
        <ol className="space-y-3">
          {ls.howSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-white/75">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: onlineTheme.accent, color: '#fff' }}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {error === 'max' && (
        <p className="mb-4 rounded-xl bg-amber-900/40 px-4 py-3 text-sm text-amber-100">
          {ls.maxHabits}
        </p>
      )}

      {/* Today */}
      <section className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{ls.todayTitle}</h2>
          {data && data.today.total > 0 && (
            <span className="text-sm font-medium" style={{ color: onlineTheme.accentLight }}>
              {ls.todayProgress
                .replace('{done}', String(data.today.completed))
                .replace('{total}', String(data.today.total))}
            </span>
          )}
        </div>

        {activeHabits.length === 0 ? (
          <div
            className="rounded-3xl p-5 text-center"
            style={{ background: onlineTheme.card, color: onlineTheme.textMuted }}
          >
            <p className="font-medium text-white/90">{ls.noActiveTitle}</p>
            <p className="mt-2 text-sm">{ls.noActiveBody}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {activeHabits.map((h) => {
              const copy = habitText(h.key);
              const done = h.doneToday;
              return (
                <li key={h.key}>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => post({ action: 'toggle', habitKey: h.key })}
                    className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-opacity disabled:opacity-50"
                    style={{
                      background: done ? 'rgba(225, 28, 72, 0.22)' : onlineTheme.card,
                      border: `1px solid ${done ? onlineTheme.accentMid : onlineTheme.cardBorder}`,
                    }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: done ? onlineTheme.accent : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {done ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border-2 border-white/40" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{copy.title}</p>
                      {h.streak > 0 && (
                        <p className="mt-0.5 text-xs" style={{ color: onlineTheme.accentLight }}>
                          {ls.streakDays.replace('{count}', String(h.streak))}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-white/50">{done ? ls.done : ls.markDone}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Week grid */}
      {data && data.last7Days.some((d) => d.total > 0) && (
        <section
          className="mb-6 rounded-3xl p-5"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          <h2 className="mb-3 text-base font-semibold text-white">{ls.weekTitle}</h2>
          <div className="flex justify-between gap-1">
            {data.last7Days.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="h-2 w-full max-w-[2rem] rounded-full"
                  style={{
                    background:
                      d.rate >= 100
                        ? onlineTheme.accentMid
                        : d.rate > 0
                          ? 'rgba(243, 96, 136, 0.45)'
                          : 'rgba(255,255,255,0.12)',
                  }}
                />
                <span className="text-[9px] text-white/35">{d.date.split('-')[2]}</span>
                {d.total > 0 && (
                  <span className="text-[8px] text-white/30">
                    {d.completed}/{d.total}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Library */}
      <section>
        <h2 className="text-lg font-semibold text-white">{ls.libraryTitle}</h2>
        <p className="mb-4 text-sm" style={{ color: onlineTheme.textMuted }}>
          {ls.librarySubtitle}
        </p>

        {LIFESTYLE_HABIT_CATEGORIES.map((cat) => {
          const CatIcon = categoryIcon[cat];
          const items = (data?.habits ?? []).filter((h) => h.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat} className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <CatIcon className="h-4 w-4" style={{ color: onlineTheme.accentLight }} />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {categoryLabel(cat)}
                </h3>
              </div>
              <ul className="space-y-2">
                {items.map((h) => {
                  const copy = habitText(h.key);
                  return (
                    <li
                      key={h.key}
                      className="rounded-2xl p-4"
                      style={{
                        background: onlineTheme.card,
                        border: `1px solid ${h.active ? onlineTheme.accentMid : onlineTheme.cardBorder}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">{copy.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-white/60">{copy.desc}</p>
                          <p className="mt-2 text-xs italic text-white/45">💡 {copy.tip}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          post({
                            action: h.active ? 'deactivate' : 'activate',
                            habitKey: h.key,
                          })
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
                        style={
                          h.active
                            ? {
                                border: `1px solid ${onlineTheme.cardBorder}`,
                                color: onlineTheme.textMuted,
                              }
                            : {
                                background: `linear-gradient(90deg, ${onlineTheme.accentLight}, ${onlineTheme.accentMid})`,
                                color: onlineTheme.bg,
                              }
                        }
                      >
                        {h.active ? (
                          ls.deactivate
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            {ls.activate}
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border py-3 text-sm font-medium text-white/70 hover:bg-white/5"
        style={{ borderColor: onlineTheme.cardBorder }}
      >
        {t.dashboard.onlineClient.progression.backToDashboard}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
