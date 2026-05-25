'use client';

import { useState, useCallback, useEffect } from 'react';
import { Trophy, Users } from 'lucide-react';
import AdminPageContent from '@/components/admin/AdminPageContent';
import { adminInputClassName, adminPrimaryBtnClassName } from '@/lib/adminStyles';

const WINNER_NAME = 'deniinstaaa';
const SPIN_DURATION_MS = 5000;

const STORAGE_KEY = 'ig-winner-entrants';

function getStoredEntrants(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function storeEntrants(names: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch {
    // ignore
  }
}

function getIntervalMs(elapsed: number): number {
  const p = elapsed / SPIN_DURATION_MS;
  if (p > 0.9) return 400;
  if (p > 0.75) return 250;
  if (p > 0.5) return 150;
  return 80;
}

export default function IGWinnerPage() {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'winner'>('idle');
  const [entrantsText, setEntrantsText] = useState('');
  const [entrants, setEntrants] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [spinList, setSpinList] = useState<string[]>([]);

  useEffect(() => {
    const stored = getStoredEntrants();
    setEntrants(stored);
    setEntrantsText(stored.join('\n'));
  }, []);

  const saveEntrants = useCallback(() => {
    const names = entrantsText
      .split(/\n/)
      .map((s) => s.replace(/^@/, '').trim().toLowerCase())
      .filter(Boolean);
    const unique = [...new Set(names)];
    setEntrants(unique);
    storeEntrants(unique);
  }, [entrantsText]);

  const pickWinner = useCallback(() => {
    const names = entrantsText
      .split(/\n/)
      .map((s) => s.replace(/^@/, '').trim().toLowerCase())
      .filter(Boolean);
    const unique = [...new Set(names)];
    storeEntrants(unique);
    setEntrants(unique);

    const winnerLower = WINNER_NAME.toLowerCase();
    const list = unique.includes(winnerLower) ? [...unique] : [...unique, winnerLower];

    setDisplayName(list.length > 0 ? list[0] : winnerLower);
    setSpinList(list);
    setPhase('spinning');
  }, [entrantsText]);

  // Spinning: cycle through names, slow down, then show winner
  useEffect(() => {
    if (phase !== 'spinning') return;

    const winnerLower = WINNER_NAME.toLowerCase();

    if (spinList.length === 0) {
      const t = setTimeout(() => setPhase('winner'), SPIN_DURATION_MS);
      return () => clearTimeout(t);
    }

    const start = Date.now();
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= SPIN_DURATION_MS) {
        setDisplayName(winnerLower);
        setPhase('winner');
        return;
      }
      const idx = Math.floor(Math.random() * spinList.length);
      setDisplayName(spinList[idx]);
      timeoutId = setTimeout(scheduleNext, getIntervalMs(elapsed));
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [phase, spinList]);

  return (
    <AdminPageContent>
    <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#4a2035] via-[#351828] to-[#2a1220] p-6">
      <div className="w-full max-w-lg text-center">
        {phase === 'idle' && (
          <>
            <div className="mb-6">
              <Trophy className="mx-auto h-20 w-20 text-[#F36088] drop-shadow-lg" />
              <p className="mt-4 text-lg text-white/70">
                Alege un câștigător din comentariile de la reel
              </p>
            </div>

            <div className="mb-6 text-left">
              <label className="flex items-center gap-2 text-white/90 font-medium mb-2">
                <Users className="w-5 h-5" />
                Nume de utilizator din comentarii (câte unul pe rând)
              </label>
              <textarea
                value={entrantsText}
                onChange={(e) => setEntrantsText(e.target.value)}
                onBlur={saveEntrants}
                placeholder="@user1&#10;user2&#10;user3"
                rows={6}
                className={`${adminInputClassName} resize-y`}
              />
              {entrants.length > 0 && (
                <p className="text-white/70 text-xs mt-1">
                  {entrants.length} participant(i) salvați
                </p>
              )}
            </div>

            <button type="button" onClick={pickWinner} className={`${adminPrimaryBtnClassName} px-8 py-4 text-lg`}>
              Alege câștigătorul
            </button>
          </>
        )}

        {phase === 'spinning' && (
          <div className="py-12">
            <p className="text-white/90 text-xl font-medium mb-4">
              Și câștigătorul este...
            </p>
            <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl min-h-[4rem] flex items-center justify-center">
              @{displayName}
            </div>
          </div>
        )}

        {phase === 'winner' && (
          <div className="py-8 animate-[fadeInUp_0.6s_ease-out_forwards]">
            <p className="text-white/90 text-xl font-medium mb-6">
              🎉 Câștigătorul este
            </p>
            <p className="text-4xl md:text-5xl font-bold text-white drop-shadow-xl break-all">
              @{WINNER_NAME}
            </p>
          </div>
        )}
      </div>
    </div>
    </AdminPageContent>
  );
}
