'use client';

import { onlineTheme } from '@/lib/onlineTheme';
import { toggleWeekdaySelection } from '@/lib/onlineTrainingDays';

type Props = {
  requiredCount: number;
  selectedWeekdays: number[];
  onChange: (weekdays: number[]) => void;
  dayLabels: string[];
  slotsLabel: (trainingDay: number) => string;
  hint?: string;
  countLabel?: string;
};

export default function TrainingDaysPicker({
  requiredCount,
  selectedWeekdays,
  onChange,
  dayLabels,
  slotsLabel,
  hint,
  countLabel,
}: Props) {
  const sorted = [...selectedWeekdays].sort((a, b) => a - b);

  return (
    <div>
      {countLabel && (
        <p className="mb-3 text-sm font-medium" style={{ color: onlineTheme.accentLight }}>
          {countLabel}
        </p>
      )}
      <div className="flex justify-between gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((wd) => {
          const index = sorted.indexOf(wd);
          const active = index >= 0;
          const trainingDay = active ? index + 1 : null;
          return (
            <button
              key={wd}
              type="button"
              onClick={() =>
                onChange(toggleWeekdaySelection(selectedWeekdays, wd, requiredCount))
              }
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1 transition-transform active:scale-95"
            >
              <span className="text-[10px] text-white/40">{dayLabels[wd - 1]}</span>
              <div
                className="flex h-10 w-full max-w-[2.25rem] items-center justify-center rounded-lg text-xs font-bold sm:h-11"
                style={{
                  background: active
                    ? `linear-gradient(180deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`
                    : 'rgba(255,255,255,0.08)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: active
                    ? 'none'
                    : `1px dashed ${onlineTheme.cardBorder}`,
                }}
              >
                {trainingDay ? slotsLabel(trainingDay) : '—'}
              </div>
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-3 text-xs leading-relaxed text-white/50">{hint}</p>}
    </div>
  );
}
