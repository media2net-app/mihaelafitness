'use client';

import { useRef } from 'react';
import { GlassWater, Plus } from 'lucide-react';
import { onlineTheme } from '@/lib/onlineTheme';
import { WATER_CUPS_TARGET } from '@/lib/waterTracking';

const CELL = 'h-10 w-10 shrink-0';

const cellStyle = (filled: boolean) => ({
  background: filled
    ? `linear-gradient(180deg, ${onlineTheme.accentMid} 0%, ${onlineTheme.accent} 100%)`
    : 'rgba(255,255,255,0.06)',
  border: filled
    ? `1px solid ${onlineTheme.accentLight}66`
    : '1px solid rgba(255,255,255,0.12)',
  boxShadow: filled ? '0 4px 14px rgba(225, 28, 72, 0.32)' : 'none',
});

function WaterCupSlot({
  filled,
  disabled,
  onClick,
  index,
}: {
  filled: boolean;
  disabled: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={`${index + 1}`}
      className={`${CELL} flex snap-center items-center justify-center rounded-xl transition-transform active:scale-95 disabled:opacity-50`}
      style={cellStyle(filled)}
    >
      <GlassWater
        className="h-[18px] w-[18px]"
        strokeWidth={filled ? 2.25 : 1.75}
        style={{ color: filled ? '#fff' : 'rgba(255,255,255,0.3)' }}
        aria-hidden
      />
    </button>
  );
}

type Props = {
  cups: number;
  target: number;
  saving: boolean;
  title: string;
  cupsLabel: string;
  onAdd: () => void;
  onSetCups: (cups: number) => void;
};

export default function WaterIntakeCard({
  cups,
  target,
  saving,
  title,
  cupsLabel,
  onAdd,
  onSetCups,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slotCount = target || WATER_CUPS_TARGET;
  const slots = Array.from({ length: slotCount }, (_, i) => i);

  const handleAdd = () => {
    onAdd();
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el || cups + 1 >= slotCount) return;
      const next = el.children[cups + 1] as HTMLElement | undefined;
      next?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  };

  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: onlineTheme.card,
        border: `1px solid ${onlineTheme.cardBorder}`,
      }}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold leading-none text-white">{title}</h2>
        <span
          className="shrink-0 text-sm font-semibold leading-none tabular-nums"
          style={{ color: onlineTheme.accentLight }}
        >
          {cupsLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || cups >= slotCount}
          className={`${CELL} flex items-center justify-center rounded-xl transition-all hover:brightness-110 active:scale-95 disabled:opacity-40`}
          style={{
            background: `linear-gradient(145deg, ${onlineTheme.accentLight} 0%, ${onlineTheme.accent} 50%, ${onlineTheme.accentMid} 100%)`,
            boxShadow: '0 4px 14px rgba(225, 28, 72, 0.35)',
          }}
          aria-label={title}
        >
          <Plus className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
        </button>

        <div className="relative min-w-0 flex-1">
          {/* Fade hint — more glasses to the right */}
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-10 w-8 rounded-r-xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${onlineTheme.card} 85%)`,
            }}
            aria-hidden
          />

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain scroll-smooth py-0.5 pr-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              /* ~5 cups visible: 5×40px + 4×10px gap */
              maxWidth: '100%',
            }}
          >
            {slots.map((i) => {
              const filled = i < cups;
              return (
                <WaterCupSlot
                  key={i}
                  index={i}
                  filled={filled}
                  disabled={saving}
                  onClick={() => onSetCups(filled ? i : i + 1)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
