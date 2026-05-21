'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, CheckCircle2, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthToken } from '@/hooks/useOnlineApi';
import {
  FOOD_MEAL_SLOTS,
  FOOD_MEALS_PER_DAY,
  getMealLabel,
  toDateKey,
} from '@/lib/foodTracking';
import { onlineTheme } from '@/lib/onlineTheme';
import OnlinePageHeader from '@/components/online/OnlinePageHeader';

type MealPhoto = {
  id: string;
  mealSlot: number;
  imageUrl: string;
  notes?: string | null;
};

export default function OnlineFoodTrackingView() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const token = useAuthToken();
  const online = t.dashboard.onlineClient;

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [photos, setPhotos] = useState<MealPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const cameraInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const libraryInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const openPhotoPicker = (slot: number, source: 'camera' | 'library') => {
    const input =
      source === 'camera' ? cameraInputRefs.current[slot] : libraryInputRefs.current[slot];
    input?.click();
  };

  const handleFileInputChange = (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(slot, file);
    e.target.value = '';
  };

  const loadDay = useCallback(async () => {
    if (!user?.id || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/food-tracking?customerId=${user.id}&date=${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, selectedDate]);

  useEffect(() => {
    loadDay();
  }, [loadDay]);

  const shiftDate = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    const today = toDateKey(new Date());
    const key = toDateKey(date);
    if (key > today) return;
    setSelectedDate(key);
  };

  const photoBySlot = (slot: number) => photos.find((p) => p.mealSlot === slot);

  const handleUpload = async (slot: number, file: File) => {
    if (!user?.id || !token) return;
    setUploadingSlot(slot);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('customerId', user.id);
      form.append('date', selectedDate);
      form.append('mealSlot', String(slot));

      const res = await fetch('/api/food-tracking', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || online.uploadFailed);
        return;
      }
      await loadDay();
    } catch {
      alert(online.uploadFailed);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm(online.deleteConfirm)) return;
    try {
      const res = await fetch(`/api/food-tracking?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await loadDay();
    } catch (e) {
      console.error(e);
    }
  };

  const uploadedCount = photos.length;
  const dayComplete = uploadedCount >= FOOD_MEALS_PER_DAY;
  const isToday = selectedDate === toDateKey(new Date());
  const foodPercent = Math.round((uploadedCount / FOOD_MEALS_PER_DAY) * 100);

  const formatHeaderDate = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-4 sm:max-w-xl sm:px-6 md:pt-2">
      <OnlinePageHeader title={online.foodTitle} subtitle={online.foodSubtitle} />

      <div
        className="mb-6 rounded-3xl p-4"
        style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="rounded-xl p-2 text-white/70 transition hover:bg-white/10"
            aria-label={online.prevDay}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold text-white">{formatHeaderDate()}</p>
            <p
              className="mt-1 text-xs font-medium"
              style={{ color: dayComplete ? '#86efac' : onlineTheme.accentLight }}
            >
              {uploadedCount}/{FOOD_MEALS_PER_DAY}{' '}
              {dayComplete ? online.dayComplete : online.mealsUploaded}
            </p>
          </div>
          <button
            type="button"
            onClick={() => shiftDate(1)}
            disabled={isToday}
            className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
            aria-label={online.nextDay}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${foodPercent}%`,
              background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: onlineTheme.accentMid }} />
        </div>
      ) : (
        <div className="space-y-4">
          {FOOD_MEAL_SLOTS.map((meal) => {
            const photo = photoBySlot(meal.slot);
            const uploading = uploadingSlot === meal.slot;
            const label = getMealLabel(meal.slot, language === 'ro' ? 'ro' : 'en');

            return (
              <div
                key={meal.slot}
                className="rounded-3xl p-4"
                style={{
                  background: onlineTheme.card,
                  border: photo
                    ? `1px solid rgba(134, 239, 172, 0.35)`
                    : `1px solid ${onlineTheme.cardBorder}`,
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{
                        background: photo
                          ? `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`
                          : onlineTheme.pillInactive,
                      }}
                    >
                      {meal.slot}
                    </span>
                    <span className="font-semibold text-white">{label}</span>
                  </div>
                  {photo && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      {online.uploaded}
                    </span>
                  )}
                </div>

                {photo ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/30">
                    <Image
                      src={photo.imageUrl}
                      alt={label}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(photo.id)}
                      className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80"
                      title={online.deletePhoto}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openPhotoPicker(meal.slot, 'camera')}
                        disabled={uploading}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        style={{ background: onlineTheme.accent }}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        {online.takePhoto}
                      </button>
                      <button
                        type="button"
                        onClick={() => openPhotoPicker(meal.slot, 'library')}
                        disabled={uploading}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-black/60 px-2 py-1.5 text-xs font-medium text-white backdrop-blur-sm disabled:opacity-50"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        {online.chooseFromLibrary}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl border-2 border-dashed p-4"
                    style={{ borderColor: 'rgba(249, 168, 217, 0.35)' }}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-8">
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: onlineTheme.accentLight }} />
                      </div>
                    ) : (
                      <>
                        <p className="mb-3 text-center text-sm font-medium text-white/70">
                          {online.tapToUpload}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openPhotoPicker(meal.slot, 'camera')}
                            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-5 transition hover:bg-white/[0.08]"
                          >
                            <Camera className="h-8 w-8" style={{ color: onlineTheme.accentLight }} />
                            <span className="text-xs font-medium text-white/80">{online.takePhoto}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openPhotoPicker(meal.slot, 'library')}
                            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-5 transition hover:bg-white/[0.08]"
                          >
                            <ImageIcon className="h-8 w-8" style={{ color: onlineTheme.accentLight }} />
                            <span className="text-xs font-medium text-white/80">
                              {online.chooseFromLibrary}
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={(el) => {
                    cameraInputRefs.current[meal.slot] = el;
                  }}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileInputChange(meal.slot, e)}
                />
                <input
                  ref={(el) => {
                    libraryInputRefs.current[meal.slot] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileInputChange(meal.slot, e)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
