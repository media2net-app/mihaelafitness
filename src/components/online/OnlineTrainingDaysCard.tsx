'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { weekdaysFromSlots } from '@/lib/onlineTrainingDays';
import { onlineTheme } from '@/lib/onlineTheme';
import TrainingDaysPicker from '@/components/online/TrainingDaysPicker';

type Props = {
  onSaved?: () => void;
};

export default function OnlineTrainingDaysCard({ onSaved }: Props) {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const ob = t.dashboard.onlineClient.onboarding;

  const [requiredCount, setRequiredCount] = useState(3);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'ok' | 'err' | null>(null);

  const dayNames =
    language === 'ro'
      ? ['L', 'M', 'M', 'J', 'V', 'S', 'D']
      : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/online-training-days', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequiredCount(data.requiredCount ?? 3);
        setSelectedWeekdays(weekdaysFromSlots(data.slots ?? []));
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!token || selectedWeekdays.length !== requiredCount) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/online-training-days', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weekdays: selectedWeekdays }),
      });
      if (!res.ok) throw new Error('fail');
      setMessage('ok');
      onSaved?.();
    } catch {
      setMessage('err');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <section
      className="mb-6 rounded-3xl p-5"
      style={{
        background: onlineTheme.card,
        border: `1px solid ${onlineTheme.cardBorder}`,
      }}
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(225, 28, 72, 0.25)' }}
        >
          <Calendar className="h-5 w-5" style={{ color: onlineTheme.accentLight }} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">{ob.scheduleTrainingDaysTitle}</h2>
          <p className="mt-1 text-xs text-white/55">
            {ob.scheduleTrainingDaysSubtitle.replace('{count}', String(requiredCount))}
          </p>
          <p className="mt-2 text-xs text-white/45">{ob.coachPlanChangeAnytime}</p>
        </div>
      </div>

      <TrainingDaysPicker
        requiredCount={requiredCount}
        selectedWeekdays={selectedWeekdays}
        onChange={setSelectedWeekdays}
        dayLabels={dayNames}
        slotsLabel={(d) => ob.trainingDayShort.replace('{day}', String(d))}
        countLabel={ob.daysSelected
          .replace('{current}', String(selectedWeekdays.length))
          .replace('{required}', String(requiredCount))}
      />

      <button
        type="button"
        disabled={saving || selectedWeekdays.length !== requiredCount}
        onClick={save}
        className="mt-4 w-full rounded-full py-3 text-sm font-bold disabled:opacity-40"
        style={{
          background: `linear-gradient(90deg, ${onlineTheme.accentLight}, ${onlineTheme.accentMid})`,
          color: onlineTheme.bg,
        }}
      >
        {saving ? ob.saving : ob.saveTrainingDays}
      </button>

      {message === 'ok' && (
        <p className="mt-2 text-center text-xs text-emerald-400/90">{ob.trainingDaysSaved}</p>
      )}
      {message === 'err' && (
        <p className="mt-2 text-center text-xs text-red-400/90">{ob.trainingDaysSaveError}</p>
      )}
    </section>
  );
}
