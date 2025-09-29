export function getWeekDates(date: Date): Date[] {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  
  // Monday is day 1, Sunday is day 0
  // Calculate days to subtract to get to Monday
  const daysToSubtract = day === 0 ? 6 : day - 1; // Sunday = 6 days back, Monday = 0 days back
  startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDates = [];
  for (let i = 0; i < 6; i++) { // Monday to Saturday
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    weekDates.push(weekDate);
  }

  return weekDates;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
