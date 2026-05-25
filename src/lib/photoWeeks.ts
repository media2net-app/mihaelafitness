export type PhotoWeekSource = { week: number; date: string };

export type PhotoWeekEntry = {
  storedWeek: number;
  date: string;
  displayWeek: number;
};

/** Chronological week order (oldest first) with display numbers 1..n */
export function buildPhotoWeekMeta(photos: PhotoWeekSource[]) {
  if (!photos.length) {
    return {
      ordered: [] as PhotoWeekEntry[],
      displayByStored: new Map<number, number>(),
      firstStoredWeek: undefined as number | undefined,
      lastStoredWeek: undefined as number | undefined,
      nextStoredWeek: 1,
    };
  }

  const dateByWeek = new Map<number, string>();
  for (const photo of photos) {
    const existing = dateByWeek.get(photo.week);
    if (!existing || photo.date < existing) {
      dateByWeek.set(photo.week, photo.date);
    }
  }

  const ordered: PhotoWeekEntry[] = Array.from(dateByWeek.entries())
    .sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime())
    .map(([storedWeek, date], index) => ({
      storedWeek,
      date,
      displayWeek: index + 1,
    }));

  const displayByStored = new Map(ordered.map((e) => [e.storedWeek, e.displayWeek]));

  return {
    ordered,
    displayByStored,
    firstStoredWeek: ordered[0]?.storedWeek,
    lastStoredWeek: ordered[ordered.length - 1]?.storedWeek,
    nextStoredWeek: ordered.length + 1,
  };
}

/** True when stored week numbers have gaps (e.g. 1,2,3,4,15) */
export function photoWeeksNeedRenumber(photos: PhotoWeekSource[]): boolean {
  const weeks = [...new Set(photos.map((p) => p.week))].sort((a, b) => a - b);
  if (weeks.length === 0) return false;
  return weeks[weeks.length - 1] !== weeks.length;
}

export function getPhotoDisplayWeek(
  storedWeek: number,
  displayByStored: Map<number, number>
): number {
  return displayByStored.get(storedWeek) ?? storedWeek;
}
