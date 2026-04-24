import { format, formatDistanceToNow, isPast, isToday, parseISO } from 'date-fns';

export const formatDate = (value: string) => format(parseISO(value), 'dd MMM yyyy');
export const formatDateTime = (value: string) => format(parseISO(value), 'dd MMM yyyy, p');
export const formatTime = (value: string) => format(parseISO(value), 'p');

export const relativeTime = (value: string) =>
  formatDistanceToNow(parseISO(value), { addSuffix: true });

export const initials = (name?: string | null) =>
  (name ?? 'UV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const eventTimingLabel = (start: string, end: string) => {
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  if (isToday(startDate)) {
    return `Today • ${format(startDate, 'p')} - ${format(endDate, 'p')}`;
  }

  return `${format(startDate, 'dd MMM')} • ${format(startDate, 'p')} - ${format(
    endDate,
    'p',
  )}`;
};

export const seatsLeft = (current: number, max: number) => Math.max(max - current, 0);
export const percent = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);
export const isUpcoming = (value: string) => !isPast(parseISO(value));
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
