'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { onlineTheme } from '@/lib/onlineTheme';
import { FITNESS_GOAL_OPTIONS } from '@/lib/onlineOnboarding';
import {
  requiredTrainingDayCount,
  weekdaysFromSlots,
} from '@/lib/onlineTrainingDays';
import TrainingDaysPicker from '@/components/online/TrainingDaysPicker';

const STEPS = ['welcome', 'name', 'gender', 'height', 'weight', 'goals', 'coachPlan'] as const;
type Step = (typeof STEPS)[number];

type Props = {
  initialName?: string;
  assignedPlanName?: string | null;
  trainingDays?: Array<{ weekday: number; trainingDay: number }>;
};

export default function OnlineOnboardingWizard({
  initialName = '',
  assignedPlanName,
  trainingDays = [],
}: Props) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const ob = t.dashboard.onlineClient.onboarding;

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState(initialName);
  const [gender, setGender] = useState<'female' | 'male' | ''>('');
  const [heightCm, setHeightCm] = useState(168);
  const [weightKg, setWeightKg] = useState(65);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [goals, setGoals] = useState<string[]>([]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(() =>
    weekdaysFromSlots(trainingDays),
  );
  const [saving, setSaving] = useState(false);

  const requiredTrainingCount = useMemo(
    () => requiredTrainingDayCount(trainingDays, 3),
    [trainingDays],
  );

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (trainingDays.length > 0) {
      setSelectedWeekdays(weekdaysFromSlots(trainingDays));
    }
  }, [trainingDays]);

  const heightDisplay = useMemo(() => {
    if (heightUnit === 'cm') return heightCm;
    return Math.round(heightCm / 2.54);
  }, [heightCm, heightUnit]);

  const weightDisplay = useMemo(() => {
    if (weightUnit === 'kg') return weightKg;
    return Math.round(weightKg * 2.20462);
  }, [weightKg, weightUnit]);

  const toggleGoal = (id: string) => {
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const canNext = () => {
    if (step === 'name') return name.trim().length >= 2;
    if (step === 'gender') return gender !== '';
    if (step === 'goals') return goals.length > 0;
    if (step === 'coachPlan') return selectedWeekdays.length === requiredTrainingCount;
    return true;
  };

  const next = () => {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
    else finish();
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const finish = async () => {
    if (!user?.id || !token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/online-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user.id,
          name: name.trim(),
          gender,
          heightCm,
          weightKg,
          fitnessGoals: goals,
        }),
      });
      if (!res.ok) throw new Error('save failed');

      const daysRes = await fetch('/api/online-training-days', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weekdays: selectedWeekdays }),
      });
      if (!daysRes.ok) throw new Error('days save failed');

      router.replace('/dashboard');
    } catch {
      alert(ob.saveError);
    } finally {
      setSaving(false);
    }
  };

  const goalLabels = FITNESS_GOAL_OPTIONS.map((g) => ({
    id: g.id,
    label: language === 'ro' ? g.labelRo : g.labelEn,
  }));

  const dayNames =
    language === 'ro'
      ? ['L', 'M', 'M', 'J', 'V', 'S', 'D']
      : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col px-4 pb-8 pt-4 sm:max-w-md">
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
          }}
        />
      </div>

      <div className="flex-1">
        {step === 'welcome' && (
          <div className="flex flex-col items-center pt-8 text-center">
            <div
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})` }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">{ob.welcomeTitle}</h1>
            <p className="mt-3 max-w-sm text-white/60">{ob.welcomeBody}</p>
          </div>
        )}

        {step === 'name' && (
          <StepShell title={ob.nameTitle} subtitle={ob.nameSubtitle}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ob.namePlaceholder}
              className="w-full border-0 border-b-2 border-white/20 bg-transparent py-3 text-2xl text-white outline-none focus:border-[#F36088]"
            />
          </StepShell>
        )}

        {step === 'gender' && (
          <StepShell title={ob.genderTitle} subtitle={ob.genderSubtitle}>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {(['female', 'male'] as const).map((g) => {
                const selected = gender === g;
                const label = g === 'female' ? ob.female : ob.male;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all"
                    style={{
                      borderColor: selected ? onlineTheme.accentMid : 'rgba(255,255,255,0.1)',
                      background: selected
                        ? `linear-gradient(180deg, ${onlineTheme.accent}99, ${onlineTheme.card})`
                        : onlineTheme.card,
                    }}
                  >
                    <span className="text-4xl">{g === 'female' ? '♀' : '♂'}</span>
                    <span className="font-semibold text-white">{label}</span>
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {step === 'height' && (
          <StepShell title={ob.heightTitle} subtitle={ob.heightSubtitle}>
            <div className="mt-8 flex flex-col items-center">
              <div
                className="rounded-2xl px-10 py-6 text-4xl font-bold text-white"
                style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
              >
                {heightDisplay} {heightUnit === 'cm' ? 'cm' : 'in'}
              </div>
              <input
                type="range"
                min={heightUnit === 'cm' ? 140 : 55}
                max={heightUnit === 'cm' ? 210 : 83}
                value={heightDisplay}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHeightCm(heightUnit === 'cm' ? v : Math.round(v * 2.54));
                }}
                className="mt-8 w-full accent-[#F36088]"
              />
              <div className="mt-4 flex rounded-full p-1" style={{ background: onlineTheme.card }}>
                {(['cm', 'in'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setHeightUnit(u)}
                    className="rounded-full px-4 py-1.5 text-sm font-medium"
                    style={{
                      background: heightUnit === u ? onlineTheme.accent : 'transparent',
                      color: heightUnit === u ? '#fff' : onlineTheme.textMuted,
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </StepShell>
        )}

        {step === 'weight' && (
          <StepShell title={ob.weightTitle} subtitle={ob.weightSubtitle}>
            <div className="mt-8 flex flex-col items-center">
              <div
                className="rounded-2xl px-10 py-6 text-4xl font-bold text-white"
                style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
              >
                {weightDisplay} {weightUnit}
              </div>
              <input
                type="range"
                min={weightUnit === 'kg' ? 40 : 88}
                max={weightUnit === 'kg' ? 150 : 330}
                value={weightDisplay}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setWeightKg(weightUnit === 'kg' ? v : Math.round(v / 2.20462));
                }}
                className="mt-8 w-full accent-[#F36088]"
              />
              <div className="mt-4 flex rounded-full p-1" style={{ background: onlineTheme.card }}>
                {(['kg', 'lbs'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setWeightUnit(u)}
                    className="rounded-full px-4 py-1.5 text-sm font-medium"
                    style={{
                      background: weightUnit === u ? onlineTheme.accent : 'transparent',
                      color: weightUnit === u ? '#fff' : onlineTheme.textMuted,
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </StepShell>
        )}

        {step === 'goals' && (
          <StepShell title={ob.goalsTitle} subtitle={ob.goalsSubtitle}>
            <div className="mt-4 flex flex-wrap gap-2">
              {goalLabels.map((g) => {
                const selected = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    className="rounded-full px-4 py-2.5 text-sm font-medium transition-all"
                    style={{
                      background: selected
                        ? `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`
                        : onlineTheme.card,
                      color: selected ? '#fff' : onlineTheme.textMuted,
                      border: selected ? 'none' : `1px solid ${onlineTheme.cardBorder}`,
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {step === 'coachPlan' && (
          <StepShell title={ob.coachPlanTitle} subtitle={ob.coachPlanSubtitle}>
            <div
              className="mt-6 rounded-3xl p-5"
              style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-white/45">
                {ob.coachSelected}
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">
                {assignedPlanName || ob.defaultPlanName}
              </h3>
              <p className="mt-2 text-sm text-white/55">{ob.coachPlanNote}</p>
              <div className="mt-5">
                <TrainingDaysPicker
                  requiredCount={requiredTrainingCount}
                  selectedWeekdays={selectedWeekdays}
                  onChange={setSelectedWeekdays}
                  dayLabels={dayNames}
                  slotsLabel={(d) =>
                    ob.trainingDayShort.replace('{day}', String(d))
                  }
                  countLabel={ob.daysSelected
                    .replace('{current}', String(selectedWeekdays.length))
                    .replace('{required}', String(requiredTrainingCount))}
                  hint={ob.selectTrainingDays.replace(
                    '{count}',
                    String(requiredTrainingCount),
                  )}
                />
              </div>
              <p className="mt-4 rounded-xl bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-white/55">
                {ob.coachPlanChangeAnytime}
              </p>
            </div>
          </StepShell>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={back}
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: onlineTheme.card, color: '#fff' }}
            aria-label={ob.back}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-12" />
        )}

        <button
          type="button"
          disabled={!canNext() || saving}
          onClick={next}
          className="flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold disabled:opacity-40"
          style={{
            background: `linear-gradient(90deg, ${onlineTheme.accentLight}, ${onlineTheme.accentMid})`,
            color: onlineTheme.bg,
          }}
        >
          {saving ? (
            ob.saving
          ) : step === 'coachPlan' ? (
            <>
              <Check className="h-5 w-5" />
              {ob.finish}
            </>
          ) : (
            <>
              {ob.next}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-white/55 sm:text-base">{subtitle}</p>
      {children}
    </div>
  );
}
