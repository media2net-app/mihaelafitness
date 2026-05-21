'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Trophy, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { onlineTheme } from '@/lib/onlineTheme';
import type { TimeRange } from '@/lib/trainingProgress';

type ProgressData = {
  exercises: Array<{ id: string; name: string; muscleGroup?: string | null }>;
  selectedExerciseId?: string;
  strength: {
    exerciseName?: string | null;
    currentMax: number;
    changePct: number;
    points: Array<{ date: string; label: string; e1rm: number; weightKg: number }>;
    stats: { vs30d: number; vs90d: number; prCount: number; bestSet: number };
  };
  personalRecords: Array<{
    id: string;
    date: string;
    exerciseName: string;
    weightKg: number;
    deltaKg: number;
  }>;
  consistency: {
    planName: string;
    percentComplete: number;
    trainingDays: number[];
    weeks: Array<{
      weekIndex: number;
      days: Array<{ trainingDay: number; status: string }>;
    }>;
    startedAt: string | null;
    endsAt: string | null;
  };
};

const RANGES: TimeRange[] = ['1w', '1m', '3m', '6m', '1y', 'all'];

type Tab = 'strength' | 'prs' | 'consistency';

export default function TrainingProgressSection() {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const tr = t.dashboard.onlineClient.trainingProgress;

  const [tab, setTab] = useState<Tab>('strength');
  const [range, setRange] = useState<TimeRange>('6m');
  const [exerciseId, setExerciseId] = useState<string>('');
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const q = new URLSearchParams({ range });
      if (exerciseId) q.set('exerciseId', exerciseId);
      const res = await fetch(`/api/online-training-progress?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json: ProgressData = await res.json();
        setData(json);
        if (json.selectedExerciseId && !exerciseId) {
          setExerciseId(json.selectedExerciseId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, range, exerciseId]);

  useEffect(() => {
    load();
  }, [load]);

  const chartPath = useMemo(() => {
    const pts = data?.strength.points ?? [];
    if (pts.length < 2) return '';
    const w = 280;
    const h = 100;
    const max = Math.max(...pts.map((p) => p.e1rm), 1);
    const min = Math.min(...pts.map((p) => p.e1rm));
    const span = max - min || 1;
    const coords = pts.map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p.e1rm - min) / span) * (h - 8) - 4;
      return `${x},${y}`;
    });
    return coords.join(' ');
  }, [data?.strength.points]);

  const rangeLabel = (r: TimeRange) => {
    const key = r === 'all' ? 'all' : r;
    return (tr.ranges as Record<string, string>)[key] || r;
  };

  if (loading && !data) {
    return (
      <div
        className="mb-5 flex h-40 items-center justify-center rounded-3xl"
        style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: onlineTheme.accentMid }}
        />
      </div>
    );
  }

  if (!data) return null;

  const hasTrainingData =
    data.strength.points.length > 0 ||
    data.personalRecords.length > 0 ||
    data.consistency.weeks.some((w) => w.days.some((d) => d.status === 'completed' || d.status === 'pr'));

  return (
    <section className="mb-6">
      <h2 className="mb-1 text-lg font-semibold text-white">{tr.title}</h2>
      <p className="mb-4 text-sm text-white/50">{tr.subtitle}</p>

      <div
        className="mb-4 flex gap-1 rounded-2xl p-1"
        style={{ background: onlineTheme.pillInactive }}
      >
        {(['strength', 'prs', 'consistency'] as Tab[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="flex-1 rounded-xl py-2 text-xs font-semibold transition-colors sm:text-sm"
            style={{
              background: tab === id ? onlineTheme.accent : 'transparent',
              color: tab === id ? '#fff' : onlineTheme.textMuted,
            }}
          >
            {id === 'strength' ? tr.tabStrength : id === 'prs' ? tr.tabPrs : tr.tabConsistency}
          </button>
        ))}
      </div>

      {!hasTrainingData ? (
        <div
          className="rounded-3xl p-6 text-center text-sm text-white/50"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          {tr.noWorkoutData}
        </div>
      ) : (
        <div
          className="rounded-3xl p-5"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          {tab === 'strength' && (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-white/45">{tr.estimatedMax}</p>
                  <p className="text-3xl font-bold text-white">
                    {data.strength.currentMax > 0 ? `${data.strength.currentMax} kg` : '—'}
                  </p>
                  {data.strength.changePct !== 0 && (
                    <span
                      className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: 'rgba(34,197,94,0.2)',
                        color: '#86efac',
                      }}
                    >
                      {data.strength.changePct > 0 ? '+' : ''}
                      {data.strength.changePct}%
                    </span>
                  )}
                </div>
                <select
                  value={exerciseId || data.selectedExerciseId || ''}
                  onChange={(e) => setExerciseId(e.target.value)}
                  className="max-w-[10rem] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                >
                  {data.exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              {data.strength.points.length >= 2 ? (
                <div className="mb-4 overflow-hidden rounded-xl bg-black/25 p-3">
                  <svg viewBox="0 0 280 100" className="h-28 w-full">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={onlineTheme.accentMid} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={onlineTheme.accentMid} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {chartPath && (
                      <>
                        <polygon
                          points={`0,100 ${chartPath} 280,100`}
                          fill="url(#lineGrad)"
                        />
                        <polyline
                          points={chartPath}
                          fill="none"
                          stroke={onlineTheme.accentLight}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                  </svg>
                  <div className="mt-1 flex justify-between text-[10px] text-white/35">
                    {data.strength.points
                      .filter((_, i, arr) => i === 0 || i === arr.length - 1 || i % Math.ceil(arr.length / 4) === 0)
                      .map((p) => (
                        <span key={p.date}>{p.label}</span>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="mb-4 text-sm text-white/45">{tr.chartNeedMore}</p>
              )}

              <div className="mb-4 flex flex-wrap gap-1">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{
                      background: range === r ? onlineTheme.accent : 'rgba(255,255,255,0.06)',
                      color: range === r ? '#fff' : onlineTheme.textMuted,
                    }}
                  >
                    {rangeLabel(r)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <MiniStat label={tr.vs30d} value={`${data.strength.stats.vs30d > 0 ? '+' : ''}${data.strength.stats.vs30d} kg`} />
                <MiniStat label={tr.vs90d} value={`${data.strength.stats.vs90d > 0 ? '+' : ''}${data.strength.stats.vs90d} kg`} />
                <MiniStat label={tr.prCount} value={String(data.strength.stats.prCount)} />
                <MiniStat
                  label={tr.bestSet}
                  value={data.strength.stats.bestSet > 0 ? `${data.strength.stats.bestSet} kg` : '—'}
                />
              </div>
            </>
          )}

          {tab === 'prs' && (
            <>
              <div className="mb-4 flex flex-wrap gap-1">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{
                      background: range === r ? onlineTheme.accent : 'rgba(255,255,255,0.06)',
                      color: range === r ? '#fff' : onlineTheme.textMuted,
                    }}
                  >
                    {rangeLabel(r)}
                  </button>
                ))}
              </div>
              {data.personalRecords.length === 0 ? (
                <p className="text-sm text-white/45">{tr.noPrs}</p>
              ) : (
                <ul className="space-y-3">
                  {data.personalRecords.map((pr) => (
                    <li
                      key={pr.id}
                      className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        <div>
                          <p className="font-semibold text-white">{pr.exerciseName}</p>
                          <p className="text-xs text-white/40">
                            {new Date(pr.date).toLocaleDateString(
                              language === 'ro' ? 'ro-RO' : 'en-GB',
                              { day: 'numeric', month: 'short', year: 'numeric' },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{pr.weightKg} kg</p>
                        {pr.deltaKg > 0 && (
                          <p className="text-xs font-medium text-emerald-400">+{pr.deltaKg} kg</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === 'consistency' && (
            <>
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">{data.consistency.planName}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${data.consistency.percentComplete}%`,
                      background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-white/45">
                  {tr.consistencyPercent.replace('{pct}', String(data.consistency.percentComplete))}
                </p>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[16rem]">
                  <div
                    className="mb-2 grid gap-1"
                    style={{
                      gridTemplateColumns: `4rem repeat(${data.consistency.trainingDays.length}, 1fr)`,
                    }}
                  >
                    <div />
                    {data.consistency.trainingDays.map((d) => (
                      <p key={d} className="text-center text-[10px] text-white/40">
                        {tr.day} {d}
                      </p>
                    ))}
                  </div>
                  {data.consistency.weeks.map((w) => (
                    <div
                      key={w.weekKey}
                      className="mb-1 grid items-center gap-1"
                      style={{
                        gridTemplateColumns: `4rem repeat(${w.days.length}, 1fr)`,
                      }}
                    >
                      <p className="text-[10px] text-white/40">
                        {tr.week} {w.weekIndex}
                      </p>
                      {w.days.map((d) => (
                        <div
                          key={d.trainingDay}
                          className="flex aspect-square items-center justify-center rounded-md"
                          style={{
                            background:
                              d.status === 'completed'
                                ? 'rgba(34,197,94,0.35)'
                                : d.status === 'pr'
                                  ? 'rgba(234,179,8,0.35)'
                                  : d.status === 'missed'
                                    ? 'rgba(239,68,68,0.25)'
                                    : 'rgba(255,255,255,0.06)',
                          }}
                        >
                          {d.status === 'completed' && (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                          {d.status === 'pr' && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
                          {d.status === 'missed' && <X className="h-3.5 w-3.5 text-red-400" />}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {(data.consistency.startedAt || data.consistency.endsAt) && (
                <p className="mt-3 text-xs text-white/40">
                  {data.consistency.startedAt &&
                    tr.started.replace(
                      '{date}',
                      new Date(data.consistency.startedAt).toLocaleDateString(
                        language === 'ro' ? 'ro-RO' : 'en-GB',
                      ),
                    )}
                  {data.consistency.endsAt &&
                    ` · ${tr.ends.replace(
                      '{date}',
                      new Date(data.consistency.endsAt).toLocaleDateString(
                        language === 'ro' ? 'ro-RO' : 'en-GB',
                      ),
                    )}`}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-2 py-2.5">
      <p className="text-[10px] text-white/40">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}
