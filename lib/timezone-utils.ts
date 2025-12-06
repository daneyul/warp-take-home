import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// use utc
export function toUserTimezone(date: Date, timezone?: string): Date {
  const userTz = timezone || getUserTimezone();
  return toZonedTime(date, userTz);
}

// convert to utc
export function toUTC(date: Date, timezone?: string): Date {
  const userTz = timezone || getUserTimezone();
  return fromZonedTime(date, userTz);
}

export function createUTCDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  timezone?: string
): Date {
  const userTz = timezone || getUserTimezone();
  const localDate = new Date(year, month, day, hour, minute);
  return fromZonedTime(localDate, userTz);
}

export function parseDateInUserTimezone(dateString: string, timeString?: string): Date {
  const userTz = getUserTimezone();

  // For all-day events, use noon to prevent date shifting across timezones
  // This ensures Dec 15 stays Dec 15 in all timezones (UTC-12 to UTC+14)
  const dateTimeString = timeString ? `${dateString}T${timeString}` : `${dateString}T12:00:00`;
  const localDate = new Date(dateTimeString);

  // If it's an all-day event (no timeString), just parse directly as noon UTC
  if (!timeString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  return fromZonedTime(localDate, userTz);
}

export function formatInUserTimezone(date: Date): string {
  const userTz = getUserTimezone();
  const zonedDate = toZonedTime(date, userTz);
  return zonedDate.toLocaleString();
}
