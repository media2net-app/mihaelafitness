/** Online client water intake — tracked in cups per calendar day */
export const WATER_CUPS_TARGET = 8;

export function clampCups(cups: number, target = WATER_CUPS_TARGET): number {
  return Math.max(0, Math.min(target, Math.round(cups)));
}
