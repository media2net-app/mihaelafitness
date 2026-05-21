'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthToken } from '@/hooks/useOnlineApi';
import {
  FOOD_MEALS_PER_DAY,
  getMealLabel,
  parseDateKey,
  toDateKey,
} from '@/lib/foodTracking';
import { onlineTheme } from '@/lib/onlineTheme';
import { adminCardStyle, adminInnerCardStyle, adminInputClassName } from '@/lib/adminStyles';

type MealPhoto = {
  id: string;
  mealSlot: number;
  imageUrl: string;
  notes?: string | null;
};

type ClientSummary = {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  status: string;
  uploadedCount: number;
  completed: boolean;
  requiredCount: number;
  photos: MealPhoto[];
  weekCompleted: number;
  weekTotal: number;
};

type OverviewResponse = {
  date: string;
  requiredCount: number;
  summary: {
    totalClients: number;
    completedToday: number;
    partialToday: number;
    notStartedToday: number;
  };
  clients: ClientSummary[];
};

export default function AdminFoodTrackingClient() {
  const { t, language } = useLanguage();
  const ft = t.admin.foodTracking;
  const token = useAuthToken();
  const lang = language === 'ro' ? 'ro' : 'en';

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/food-tracking?date=${selectedDate}`, {
        headers,
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load');
      const json = (await res.json()) as OverviewResponse;
      setData(json);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, token]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const shiftDate = (days: number) => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(toDateKey(d));
    setExpandedId(null);
  };

  const dateLabel = useMemo(() => {
    return parseDateKey(selectedDate).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate, lang]);

  const filteredClients = useMemo(() => {
    if (!data?.clients) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.clients;
    return data.clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [data?.clients, search]);

  const isToday = selectedDate === toDateKey(new Date());

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 lg:max-w-6xl">
      <div className="mb-4 hidden lg:block">
        <h1 className="text-2xl font-bold text-white">{ft.title}</h1>
        <p className="mt-1 text-sm text-white/55">{ft.subtitle}</p>
      </div>

      {/* Date nav */}
      <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl p-3" style={adminCardStyle}>
        <button
          type="button"
          onClick={() => shiftDate(-1)}
          className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label={ft.prevDay}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold capitalize text-white">{dateLabel}</p>
          {isToday && (
            <span className="text-xs font-medium" style={{ color: onlineTheme.accentLight }}>
              {ft.today}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => shiftDate(1)}
          disabled={isToday}
          className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
          aria-label={ft.nextDay}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Summary */}
      {data && !loading && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: ft.totalClients, value: data.summary.totalClients, color: 'text-white' },
            { label: ft.complete, value: data.summary.completedToday, color: 'text-emerald-300' },
            { label: ft.partial, value: data.summary.partialToday, color: 'text-amber-300' },
            { label: ft.notStarted, value: data.summary.notStartedToday, color: 'text-white/45' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border p-3" style={adminInnerCardStyle}>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-white/55">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={ft.searchPlaceholder}
          className={`${adminInputClassName} pl-10`}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: onlineTheme.accentMid }} />
        </div>
      ) : !data ? (
        <p className="text-center text-white/55">{ft.loadError}</p>
      ) : filteredClients.length === 0 ? (
        <p className="rounded-2xl border p-8 text-center text-white/55" style={adminInnerCardStyle}>
          {ft.noClients}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const expanded = expandedId === client.id;
            const initials =
              client.name
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2) || '?';

            return (
              <div key={client.id} className="overflow-hidden rounded-2xl" style={adminCardStyle}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : client.id)}
                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/[0.03]"
                >
                  {client.profilePicture ? (
                    <Image
                      src={client.profilePicture}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{client.name}</p>
                    <p className="truncate text-xs text-white/45">{client.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(client.uploadedCount / FOOD_MEALS_PER_DAY) * 100}%`,
                            background: client.completed
                              ? '#86efac'
                              : `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
                          }}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-medium text-white/70">
                        {client.uploadedCount}/{FOOD_MEALS_PER_DAY}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-white/40">
                      {ft.weekProgress
                        .replace('{done}', String(client.weekCompleted))
                        .replace('{total}', String(client.weekTotal))}
                    </p>
                  </div>
                  {client.completed ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                  ) : (
                    <UtensilsCrossed className="h-6 w-6 shrink-0 text-white/30" />
                  )}
                </button>

                {expanded && (
                  <div className="border-t border-white/10 px-4 pb-4 pt-2">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {Array.from({ length: FOOD_MEALS_PER_DAY }, (_, i) => i + 1).map((slot) => {
                        const photo = client.photos.find((p) => p.mealSlot === slot);
                        const label = getMealLabel(slot, lang);
                        return (
                          <div
                            key={slot}
                            className="overflow-hidden rounded-xl border"
                            style={adminInnerCardStyle}
                          >
                            <p className="border-b border-white/10 px-2 py-1 text-[10px] font-medium text-white/70">
                              {slot}. {label}
                            </p>
                            {photo ? (
                              <button
                                type="button"
                                className="relative aspect-[4/3] w-full"
                                onClick={() => setLightboxUrl(photo.imageUrl)}
                              >
                                <Image
                                  src={photo.imageUrl}
                                  alt={label}
                                  fill
                                  className="object-cover"
                                  sizes="200px"
                                />
                              </button>
                            ) : (
                              <div className="flex aspect-[4/3] items-center justify-center text-xs text-white/30">
                                —
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[85vh] max-w-lg w-full aspect-[4/3]" onClick={(e) => e.stopPropagation()}>
            <Image src={lightboxUrl} alt="" fill className="rounded-2xl object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </div>
  );
}
