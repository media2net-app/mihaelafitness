export const ADMIN_ALERT_TYPES = {
  MISSING_PHOTOS: 'missing-photos',
  OVERDUE_SESSION: 'overdue-session',
} as const;

export type AdminAlertType = (typeof ADMIN_ALERT_TYPES)[keyof typeof ADMIN_ALERT_TYPES];

export type OverdueSessionLike = {
  date: Date | string;
  endTime: string;
  status: string;
  type?: string | null;
};

export function isTrainingSessionOverdue(
  session: OverdueSessionLike,
  now: Date = new Date(),
): boolean {
  if (session.status !== 'scheduled') return false;
  if (session.type === 'block-time') return false;

  const sessionDate = new Date(session.date);
  sessionDate.setHours(0, 0, 0, 0);

  const todayDate = new Date(now);
  todayDate.setHours(0, 0, 0, 0);

  const currentTime = now.toTimeString().slice(0, 5);

  if (sessionDate < todayDate) return true;

  if (sessionDate.getTime() === todayDate.getTime()) {
    return Boolean(session.endTime && session.endTime < currentTime);
  }

  return false;
}

export function getExpectedPhotoCount(measurementsCount: number): number {
  return measurementsCount * 3;
}

export function getMissingPhotoCount(photosCount: number, measurementsCount: number): number {
  const expected = getExpectedPhotoCount(measurementsCount);
  return Math.max(0, expected - photosCount);
}

export const ADMIN_EXCLUDED_CLIENT_FILTER = {
  NOT: {
    OR: [
      { name: { contains: 'Own Training' } },
      { name: { contains: 'Blocked Time' } },
      { email: { contains: 'blocked-time@system.local' } },
    ],
  },
} as const;
