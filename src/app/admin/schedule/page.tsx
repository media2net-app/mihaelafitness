import { getWeekDates } from '@/lib/utils';
import MobileScheduleClient from './MobileScheduleClient';

interface CoachingSchedulePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { [key: string]: string | string[] | undefined };
}

export default async function CoachingSchedulePage({ searchParams }: CoachingSchedulePageProps) {
  const resolvedSearchParams = await searchParams;
  const currentWeekParam = resolvedSearchParams.week as string;
  const initialDate = currentWeekParam ? new Date(currentWeekParam) : new Date('2025-09-29'); // Set to week with existing sessions
  const weekDates = getWeekDates(initialDate);

  return (
    <MobileScheduleClient
      initialWeekDates={weekDates.map(d => d.toISOString())}
      initialCurrentWeek={initialDate.toISOString()}
    />
  );
}
