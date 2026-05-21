'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOnlineProfile } from '@/hooks/useOnlineProfile';
import { onlineTheme } from '@/lib/onlineTheme';
import OnlinePageHeader from '@/components/online/OnlinePageHeader';
import { FITNESS_GOAL_OPTIONS } from '@/lib/onlineOnboarding';
import TrainingProgressSection from '@/components/online/TrainingProgressSection';

type Measurement = {
  id: string;
  week: number;
  date: string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  bodyFat?: number | null;
};

export default function MyProgressionView() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, token, isAuthenticated } = useAuth();
  const { data: profileData, loading: profileLoading } = useOnlineProfile();
  const prog = t.dashboard.onlineClient.progression;

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInWeight, setCheckInWeight] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customer-measurements?customerId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setMeasurements(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user?.id, token]);

  const sorted = useMemo(
    () =>
      [...measurements].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [measurements],
  );

  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const weightDelta =
    latest?.weight && first?.weight ? Math.round((latest.weight - first.weight) * 10) / 10 : null;

  const maxWeight = Math.max(...sorted.map((m) => m.weight || 0), 1);

  const goalLabels = useMemo(() => {
    const ids = (profileData?.profile?.fitnessGoals as string[]) || [];
    return ids
      .map((id) => FITNESS_GOAL_OPTIONS.find((g) => g.id === id))
      .filter(Boolean)
      .map((g) => (language === 'ro' ? g!.labelRo : g!.labelEn));
  }, [profileData, language]);

  const submitCheckIn = async () => {
    if (!user?.id || !token || !checkInWeight) return;
    setSaving(true);
    try {
      const weight = parseFloat(checkInWeight);
      const nextWeek =
        sorted.length > 0 ? Math.max(...sorted.map((m) => m.week)) + 1 : 1;
      const height = latest?.height ?? profileData?.profile?.heightCm ?? null;
      const bmi =
        height && weight
          ? Math.round((weight / (Number(height) / 100) ** 2) * 10) / 10
          : null;

      const res = await fetch('/api/customer-measurements', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user.id,
          week: nextWeek,
          date: new Date().toISOString(),
          weight,
          height,
          bmi,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setMeasurements((prev) => [...prev, created]);
        setShowCheckIn(false);
        setCheckInWeight('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: onlineTheme.accentMid }}
        />
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-4 sm:max-w-xl sm:px-6 md:pt-2">
      <OnlinePageHeader title={prog.title} subtitle={prog.subtitle} />

      {profileData?.assignedPlan && (
        <div
          className="mb-5 rounded-2xl p-4"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          <p className="text-xs uppercase tracking-wide text-white/40">{prog.yourPlan}</p>
          <p className="mt-1 font-semibold text-white">{profileData.assignedPlan.name}</p>
          {goalLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {goalLabels.map((g) => (
                <span
                  key={g}
                  className="rounded-full px-2.5 py-0.5 text-xs"
                  style={{ background: 'rgba(225,28,72,0.3)', color: onlineTheme.accentLight }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <TrainingProgressSection />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatBox
          label={prog.currentWeight}
          value={latest?.weight ? `${latest.weight} kg` : '—'}
          icon={Scale}
        />
        <StatBox
          label={prog.change}
          value={
            weightDelta !== null
              ? `${weightDelta > 0 ? '+' : ''}${weightDelta} kg`
              : '—'
          }
          icon={weightDelta !== null && weightDelta < 0 ? TrendingDown : TrendingUp}
          highlight={weightDelta !== null && weightDelta < 0}
        />
      </div>

      {sorted.length > 1 && (
        <div
          className="mb-5 rounded-3xl p-5"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          <h2 className="mb-4 text-sm font-semibold text-white">{prog.weightChart}</h2>
          <div className="flex h-32 items-end justify-between gap-1">
            {sorted.map((m) => {
              const h = m.weight ? (m.weight / maxWeight) * 100 : 8;
              return (
                <div key={m.id} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-[2rem] rounded-t-md"
                    style={{
                      height: `${h}%`,
                      minHeight: 8,
                      background: `linear-gradient(180deg, ${onlineTheme.accentLight}, ${onlineTheme.accent})`,
                    }}
                  />
                  <span className="text-[9px] text-white/35">W{m.week}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="mb-5 rounded-3xl p-5"
        style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-white">{prog.history}</h2>
          <button
            type="button"
            onClick={() => setShowCheckIn(true)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
              color: '#fff',
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {prog.addCheckIn}
          </button>
        </div>

        {showCheckIn && (
          <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <label className="text-xs text-white/50">{prog.weightKg}</label>
            <input
              type="number"
              step="0.1"
              value={checkInWeight}
              onChange={(e) => setCheckInWeight(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#F36088]"
              placeholder="e.g. 62.5"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCheckIn(false)}
                className="flex-1 rounded-lg py-2 text-sm text-white/60"
              >
                {prog.cancel}
              </button>
              <button
                type="button"
                disabled={saving || !checkInWeight}
                onClick={submitCheckIn}
                className="flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: onlineTheme.accent }}
              >
                {saving ? '...' : prog.save}
              </button>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <p className="text-sm text-white/50">{prog.noData}</p>
        ) : (
          <ul className="space-y-3">
            {[...sorted].reverse().map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {prog.week} {m.week}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(m.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-lg font-bold" style={{ color: onlineTheme.accentLight }}>
                  {m.weight ? `${m.weight} kg` : '—'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold"
        style={{ border: `1px solid ${onlineTheme.accentMid}`, color: onlineTheme.accentLight }}
      >
        {prog.backToDashboard}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
    >
      <Icon className="mb-2 h-5 w-5" style={{ color: onlineTheme.accentLight }} />
      <p className="text-xs text-white/45">{label}</p>
      <p
        className="mt-1 text-xl font-bold"
        style={{ color: highlight ? '#86efac' : '#fff' }}
      >
        {value}
      </p>
    </div>
  );
}
