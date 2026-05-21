'use client';

import { useState, useCallback, useEffect } from 'react';
import { Trophy, Users } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-[#E11C48] via-[#F36088] to-[#F9A8D9] flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {phase === 'idle' && (
          <>
            <div className="mb-6">
              <Trophy className="w-20 h-20 mx-auto text-white/90 drop-shadow-lg" />
              <h1 className="mt-4 text-3xl font-bold text-white drop-shadow-md">
                Câștigător IG
              </h1>
              <p className="mt-2 text-white/80 text-lg">
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
                className="w-full rounded-xl border-2 border-white/30 bg-white/10 text-white placeholder-white/50 p-3 text-sm resize-y focus:border-white/60 focus:outline-none"
              />
              {entrants.length > 0 && (
                <p className="text-white/70 text-xs mt-1">
                  {entrants.length} participant(i) salvați
                </p>
              )}
            </div>

            <button
              onClick={pickWinner}
              className="px-8 py-4 rounded-2xl bg-white text-[#E11C48] font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-200"
            >
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
  );
}
