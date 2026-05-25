'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  addDaysToDateKey,
  FOOD_MEALS_PER_DAY,
  getMealLabel,
  isDemoFoodTrackingClient,
  toDateKey,
} from '@/lib/foodTracking';
import { onlineTheme } from '@/lib/onlineTheme';
import {
  adminCardStyle,
  adminInnerCardStyle,
  adminInputClassName,
  adminPageSubtitleClassName,
  adminPageTitleClassName,
} from '@/lib/adminStyles';

type MealPhoto = {
  id: string;
  mealSlot: number;
  imageUrl: string;
  notes?: string | null;
};

type ClientListItem = {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  status: string;
  uploadedCount: number;
  completed: boolean;
  requiredCount: number;
  filledSlots: number[];
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
  clients: ClientListItem[];
};

type DayHistory = {
  date: string;
  uploadedCount: number;
  completed: boolean;
  filledSlots: number[];
};

type ClientDetailResponse = {
  customer: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  };
  date: string;
  photos: MealPhoto[];
  uploadedCount: number;
  completed: boolean;
  requiredCount: number;
  history: DayHistory[];
};

type StatusFilter = 'all' | 'complete' | 'partial' | 'empty';

function dateKeyToLocalDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function ClientAvatar({
  name,
  profilePicture,
  size = 40,
}: {
  name: string;
  profilePicture: string | null;
  size?: number;
}) {
  const initials =
    name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2) || '?';

  if (profilePicture) {
    return (
      <Image
        src={profilePicture}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
      }}
    >
      {initials}
    </div>
  );
}

function DayHistoryStrip({
  history,
  selectedDate,
  todayKey,
  onSelectDate,
  title,
  todayLabel,
  swipeHint,
  locale,
}: {
  history: DayHistory[];
  selectedDate: string;
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
  title: string;
  todayLabel: string;
  swipeHint: string;
  locale: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const selected = selectedRef.current;
    if (!container || !selected) return;

    const targetLeft =
      selected.offsetLeft - container.clientWidth / 2 + selected.offsetWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  }, [selectedDate, history.length]);

  if (history.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">{title}</p>
      {/* Full-bleed horizontal swipe (breaks out of card padding on mobile) */}
      <div className="-mx-3 sm:-mx-5">
        <div
          ref={scrollRef}
          className="day-history-scroll flex flex-nowrap snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth px-3 pb-2 pt-0.5 sm:px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
          role="listbox"
          aria-label={title}
        >
          {history.map((day) => {
            const active = day.date === selectedDate;
            const isDayToday = day.date === todayKey;
            const d = dateKeyToLocalDate(day.date);
            const weekday = d.toLocaleDateString(locale, { weekday: 'short' });
            const dayNum = d.getDate();

            return (
              <button
                key={day.date}
                ref={active ? selectedRef : undefined}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelectDate(day.date)}
                style={{ touchAction: 'manipulation' }}
                className={`flex min-h-[5.25rem] w-[4.75rem] shrink-0 snap-center flex-col items-center justify-center rounded-2xl border px-2 py-2.5 transition active:scale-[0.97] sm:w-[5.25rem] ${
                  active
                    ? 'border-[#E11C48]/60 bg-[#E11C48]/15 shadow-md shadow-[#E11C48]/10'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-[10px] font-medium uppercase text-white/45">{weekday}</span>
                <span
                  className={`text-base font-bold tabular-nums leading-tight ${
                    active ? 'text-white' : 'text-white/85'
                  }`}
                >
                  {dayNum}
                </span>
                <div className="mt-1.5 flex flex-wrap justify-center gap-0.5 px-0.5">
                  {Array.from({ length: FOOD_MEALS_PER_DAY }, (_, i) => {
                    const filled = day.filledSlots.includes(i + 1);
                    return (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full sm:h-1.5 sm:w-1.5 ${
                          filled
                            ? day.completed
                              ? 'bg-emerald-400'
                              : 'bg-[#E11C48]'
                            : 'bg-white/15'
                        }`}
                      />
                    );
                  })}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-semibold tabular-nums ${
                    day.completed
                      ? 'text-emerald-300'
                      : day.uploadedCount > 0
                        ? 'text-amber-200'
                        : 'text-white/35'
                  }`}
                >
                  {day.uploadedCount}/{FOOD_MEALS_PER_DAY}
                </span>
                {isDayToday && (
                  <span
                    className="mt-0.5 text-[9px] font-bold uppercase leading-none"
                    style={{ color: onlineTheme.accentLight }}
                  >
                    {todayLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-white/35 sm:hidden">{swipeHint}</p>
    </div>
  );
}

function MealProgressBar({
  uploadedCount,
  completed,
}: {
  uploadedCount: number;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(uploadedCount / FOOD_MEALS_PER_DAY) * 100}%`,
            background: completed
              ? '#86efac'
              : `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
          }}
        />
      </div>
      <span className="shrink-0 text-[11px] font-medium tabular-nums text-white/70">
        {uploadedCount}/{FOOD_MEALS_PER_DAY}
      </span>
    </div>
  );
}

export default function AdminFoodTrackingClient() {
  const { t, language } = useLanguage();
  const ft = t.admin.foodTracking;
  const { token } = useAuth();
  const lang = language === 'ro' ? 'ro' : 'en';
  const locale = lang === 'ro' ? 'ro-RO' : 'en-GB';

  const authHeaders = useMemo((): HeadersInit => {
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }, [token]);

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDetail, setClientDetail] = useState<ClientDetailResponse | null>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const res = await fetch(`/api/admin/food-tracking?date=${selectedDate}`, {
        headers: authHeaders,
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load');
      const json = (await res.json()) as OverviewResponse;
      setOverview(json);
    } catch (e) {
      console.error(e);
      setOverview(null);
    } finally {
      setOverviewLoading(false);
    }
  }, [selectedDate, authHeaders]);

  const loadClientDetail = useCallback(
    async (customerId: string) => {
      setClientLoading(true);
      setClientError(false);
      try {
        const res = await fetch(
          `/api/admin/food-tracking?date=${selectedDate}&customerId=${customerId}&historyDays=14`,
          { headers: authHeaders, credentials: 'same-origin', cache: 'no-store' },
        );
        if (!res.ok) throw new Error('Failed to load client');
        const json = (await res.json()) as ClientDetailResponse;
        setClientDetail(json);
      } catch (e) {
        console.error(e);
        setClientDetail(null);
        setClientError(true);
      } finally {
        setClientLoading(false);
      }
    },
    [selectedDate, authHeaders],
  );

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    setClientDetail(null);
  }, [selectedClientId]);

  useEffect(() => {
    if (!selectedClientId) return;
    setClientError(false);
    loadClientDetail(selectedClientId);
  }, [selectedClientId, loadClientDetail]);

  const todayKey = toDateKey(new Date());
  const isToday = selectedDate === todayKey;

  const goToPrevDay = () => setSelectedDate(addDaysToDateKey(selectedDate, -1));
  const goToNextDay = () => {
    if (!isToday) setSelectedDate(addDaysToDateKey(selectedDate, 1));
  };

  const dateLabel = useMemo(() => {
    return dateKeyToLocalDate(selectedDate).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate, locale]);

  const dateLabelCompact = useMemo(() => {
    return dateKeyToLocalDate(selectedDate).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [selectedDate, locale]);

  const shortDateLabel = useMemo(() => {
    return dateKeyToLocalDate(selectedDate).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }, [selectedDate, locale]);

  const filteredClients = useMemo(() => {
    if (!overview?.clients) return [];
    const q = search.trim().toLowerCase();
    return overview.clients
      .filter((c) => !isDemoFoodTrackingClient(c))
      .filter((c) => {
        const matchesSearch =
          !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
        if (!matchesSearch) return false;
        if (statusFilter === 'complete') return c.completed;
        if (statusFilter === 'partial') return c.uploadedCount > 0 && !c.completed;
        if (statusFilter === 'empty') return c.uploadedCount === 0;
        return true;
      });
  }, [overview?.clients, search, statusFilter]);

  useEffect(() => {
    if (filteredClients.length === 0) {
      setSelectedClientId(null);
      return;
    }
    if (!selectedClientId || !filteredClients.some((c) => c.id === selectedClientId)) {
      setSelectedClientId(filteredClients[0].id);
    }
  }, [filteredClients, selectedClientId]);

  const selectedListClient = overview?.clients.find((c) => c.id === selectedClientId);

  const filterChips: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: ft.filterAll },
    { key: 'complete', label: ft.filterComplete },
    { key: 'partial', label: ft.filterPartial },
    { key: 'empty', label: ft.filterEmpty },
  ];

  const dateNavBtnClassName =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] text-white/85 transition hover:bg-white/10 active:bg-white/15 disabled:pointer-events-none disabled:opacity-35';

  const dateNav = (
    <div
      className="sticky top-0 z-10 rounded-xl border border-white/10 px-2 py-2 shadow-lg backdrop-blur-md sm:rounded-2xl sm:px-3"
      style={{ ...adminCardStyle, background: 'rgba(26, 10, 18, 0.92)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={goToPrevDay}
          className={dateNavBtnClassName}
          aria-label={ft.prevDay}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
        </button>

        <p className="min-w-0 flex-1 text-center text-[13px] font-semibold capitalize leading-tight text-white sm:text-base">
          <span className="sm:hidden">{dateLabelCompact}</span>
          <span className="hidden sm:inline">{dateLabel}</span>
        </p>

        <button
          type="button"
          onClick={goToNextDay}
          disabled={isToday}
          className={dateNavBtnClassName}
          aria-label={ft.nextDay}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );

  const clientDetailPanel =
    !selectedClientId || !selectedListClient ? (
      <p className="p-8 text-center text-sm text-white/50 sm:p-10">{ft.selectClient}</p>
    ) : clientLoading && !clientDetail ? (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: onlineTheme.accentMid }} />
        <span className="sr-only">{ft.loadingClient}</span>
      </div>
    ) : clientError ? (
      <p className="p-8 text-center text-sm text-red-300 sm:p-10">{ft.clientLoadError}</p>
    ) : clientDetail ? (
      <div className="p-3 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <ClientAvatar
            name={clientDetail.customer.name}
            profilePicture={clientDetail.customer.profilePicture}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-white sm:text-lg">
              {clientDetail.customer.name}
            </h2>
            <p className="truncate text-xs text-white/45">{clientDetail.customer.email}</p>
            <p className="mt-1 text-xs text-white/40">
              {ft.weekProgress
                .replace('{done}', String(selectedListClient.weekCompleted))
                .replace('{total}', String(selectedListClient.weekTotal))}
            </p>
          </div>
          {selectedListClient.completed ? (
            <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-400" />
          ) : (
            <span className="shrink-0 rounded-xl border border-white/15 px-2.5 py-1 text-sm font-semibold tabular-nums text-white/80">
              {selectedListClient.uploadedCount}/{FOOD_MEALS_PER_DAY}
            </span>
          )}
        </div>

        {clientDetail.history.length > 0 && (
          <DayHistoryStrip
            history={clientDetail.history}
            selectedDate={selectedDate}
            todayKey={todayKey}
            onSelectDate={setSelectedDate}
            title={ft.dayHistory}
            todayLabel={ft.today}
            swipeHint={ft.swipeDays}
            locale={locale}
          />
        )}

        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">
            {ft.mealsOnDay}
            <span className="ml-1.5 font-normal text-white/45">· {shortDateLabel}</span>
          </h3>
          {clientLoading && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
        </div>

        {clientLoading || clientDetail.date !== selectedDate ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: onlineTheme.accentMid }} />
          </div>
        ) : clientDetail.photos.length === 0 ? (
          <p
            className="rounded-xl border border-dashed border-white/15 py-10 text-center text-sm text-white/45"
            style={adminInnerCardStyle}
          >
            {ft.noPhotosDay}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: FOOD_MEALS_PER_DAY }, (_, i) => i + 1).map((slot) => {
              const photo = clientDetail.photos.find((p) => p.mealSlot === slot);
              const label = getMealLabel(slot, lang);
              return (
                <div
                  key={slot}
                  className="overflow-hidden rounded-xl border"
                  style={adminInnerCardStyle}
                >
                  <p className="border-b border-white/10 px-2 py-1.5 text-[10px] font-medium text-white/70 sm:text-xs">
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
                        sizes="(max-width: 640px) 50vw, 200px"
                      />
                    </button>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center text-xs text-white/25">
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    ) : (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: onlineTheme.accentMid }} />
      </div>
    );

  return (
    <>
      <header className="mb-3 sm:mb-4">
        <h1 className={`${adminPageTitleClassName} text-xl sm:text-3xl`}>{ft.title}</h1>
        <p className={`${adminPageSubtitleClassName} text-xs sm:text-sm`}>{ft.subtitle}</p>
      </header>

      <div className="mb-3 sm:mb-4">{dateNav}</div>

      {overview && !overviewLoading && (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:grid-cols-4">
          {[
            { label: ft.totalClients, value: overview.summary.totalClients, color: 'text-white' },
            { label: ft.complete, value: overview.summary.completedToday, color: 'text-emerald-300' },
            { label: ft.partial, value: overview.summary.partialToday, color: 'text-amber-300' },
            { label: ft.notStarted, value: overview.summary.notStartedToday, color: 'text-white/45' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border p-2.5 sm:p-3" style={adminInnerCardStyle}>
              <p className={`text-lg font-bold sm:text-xl ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-white/55 sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mobile: horizontal client picker */}
      <div className="mb-3 lg:hidden">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ft.searchPlaceholder}
            className={`${adminInputClassName} pl-10`}
          />
        </div>
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setStatusFilter(chip.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === chip.key
                  ? 'bg-white text-[#1a0a12]'
                  : 'border border-white/15 text-white/65'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {overviewLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: onlineTheme.accentMid }} />
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            {filteredClients.map((client) => {
              const active = selectedClientId === client.id;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClientId(client.id)}
                  className={`flex min-w-[9.5rem] shrink-0 flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? 'border-[#E11C48]/50 bg-[#E11C48]/10'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ClientAvatar name={client.name} profilePicture={client.profilePicture} size={32} />
                    <span className="truncate text-xs font-semibold text-white">{client.name}</span>
                  </div>
                  <MealProgressBar uploadedCount={client.uploadedCount} completed={client.completed} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start">
        {/* Desktop sidebar */}
        <aside className="hidden flex-col gap-3 lg:flex lg:sticky lg:top-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ft.searchPlaceholder}
              className={`${adminInputClassName} pl-10`}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setStatusFilter(chip.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  statusFilter === chip.key
                    ? 'bg-white text-[#1a0a12]'
                    : 'border border-white/15 text-white/65 hover:bg-white/10'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10" style={adminCardStyle}>
            <p className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/50">
              {ft.clientList}
            </p>

            {overviewLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: onlineTheme.accentMid }} />
              </div>
            ) : !overview ? (
              <p className="p-4 text-center text-sm text-white/55">{ft.loadError}</p>
            ) : filteredClients.length === 0 ? (
              <p className="p-4 text-center text-sm text-white/55">{ft.noClients}</p>
            ) : (
              <ul className="max-h-[min(52vh,520px)] divide-y divide-white/10 overflow-y-auto overscroll-y-contain">
                {filteredClients.map((client) => {
                  const active = selectedClientId === client.id;
                  return (
                    <li key={client.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedClientId(client.id)}
                        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                          active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <ClientAvatar name={client.name} profilePicture={client.profilePicture} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{client.name}</p>
                          <MealProgressBar
                            uploadedCount={client.uploadedCount}
                            completed={client.completed}
                          />
                        </div>
                        {client.completed ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                        ) : client.uploadedCount > 0 ? (
                          <span className="shrink-0 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                            {client.uploadedCount}/{FOOD_MEALS_PER_DAY}
                          </span>
                        ) : (
                          <UtensilsCrossed className="h-4 w-4 shrink-0 text-white/25" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border border-white/10" style={adminCardStyle}>
          {clientDetailPanel}
        </section>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative aspect-[4/3] w-full max-h-[85vh] max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxUrl}
              alt=""
              fill
              className="rounded-2xl object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
