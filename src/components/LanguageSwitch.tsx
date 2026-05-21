'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { onlineTheme } from '@/lib/onlineTheme';

const segmentBtn =
  'relative z-10 flex h-7 w-full min-h-0 min-w-0 appearance-none items-center justify-center border-0 bg-transparent p-0 text-[11px] font-bold leading-none transition-colors [-webkit-tap-highlight-color:transparent]';

export default function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();
  const isRo = language === 'ro';

  return (
    <div
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2"
      style={{
        borderColor: onlineTheme.cardBorder,
        background: onlineTheme.pillInactive,
      }}
      role="group"
      aria-label={t.login.language}
    >
      <Globe
        className="h-4 w-4 shrink-0"
        style={{ color: onlineTheme.accentLight }}
        aria-hidden
      />
      <div
        className="relative box-border h-7 w-[4.5rem] min-w-[4.5rem] max-w-[4.5rem] shrink-0 overflow-hidden rounded-full"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full transition-transform duration-200 ease-out will-change-transform"
          style={{
            background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
            boxShadow: '0 2px 8px rgba(225, 28, 72, 0.4)',
            transform: isRo ? 'translate3d(0,0,0)' : 'translate3d(100%,0,0)',
          }}
          aria-hidden
        />
        <div className="relative grid h-7 w-full grid-cols-2">
          <button
            type="button"
            onClick={() => setLanguage('ro')}
            className={segmentBtn}
            style={{ color: isRo ? '#fff' : onlineTheme.textDim }}
            aria-pressed={isRo}
          >
            RO
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={segmentBtn}
            style={{ color: !isRo ? '#fff' : onlineTheme.textDim }}
            aria-pressed={!isRo}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
}
