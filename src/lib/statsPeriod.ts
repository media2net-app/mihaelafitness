export type StatsPeriod = 'week' | 'month' | 'year' | 'all';

export const STATS_PERIOD_OPTIONS: { id: StatsPeriod; label: string }[] = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
  { id: 'all', label: 'All time' },
];

export function parseStatsPeriod(value: string | null): StatsPeriod {
  if (value === 'week' || value === 'month' || value === 'year' || value === 'all') {
    return value;
  }
  return 'all';
}

/** Start of the current period (local time), inclusive. */
export function getStatsPeriodStart(period: StatsPeriod): Date | null {
  if (period === 'all') return null;

  const now = new Date();
  const start = new Date(now);

  if (period === 'week') {
    const day = now.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    start.setDate(now.getDate() - daysFromMonday);
  } else if (period === 'month') {
    start.setDate(1);
  } else if (period === 'year') {
    start.setMonth(0, 1);
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

export function getCreatedAtFilter(period: StatsPeriod): { gte: Date } | undefined {
  const start = getStatsPeriodStart(period);
  return start ? { gte: start } : undefined;
}

export function getPaymentDateFilter(period: StatsPeriod): { gte: Date } | undefined {
  return getCreatedAtFilter(period);
}

export const REVENUE_KPI_LABELS = {
  revenue: 'Revenue',
  paymentCount: 'Payments',
  averagePayment: 'Average',
  maxPayment: 'Highest payment',
} as const;

/** Payment amounts are stored in RON; display as EUR (same rate as admin payments page). */
const RON_TO_EUR = 5;

export function formatEuro(amountRon: number): string {
  const eur = Math.round(amountRon / RON_TO_EUR);
  return `€${eur.toLocaleString('en-GB')}`;
}
