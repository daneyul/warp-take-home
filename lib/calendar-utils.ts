import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  format,
  addDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { CalendarEvent } from './types';

export function getMonthViewDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

export function getWeekViewDays(date: Date): Date[] {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);

  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

export function expandRecurringEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  const expanded: CalendarEvent[] = [];

  events.forEach((event) => {
    if (!event.recurrence) {
      // Non-recurring event, add if it overlaps with the range
      if (
        isWithinInterval(event.startTime, { start: rangeStart, end: rangeEnd }) ||
        isWithinInterval(event.endTime, { start: rangeStart, end: rangeEnd }) ||
        (event.startTime < rangeStart && event.endTime > rangeEnd)
      ) {
        expanded.push(event);
      }
    } else {
      // Recurring event, generate individual instances
      const { frequency, daysOfWeek, endDate, exceptions = [] } = event.recurrence;
      const recurrenceEnd = endDate || rangeEnd;

      if (frequency === 'daily') {
        let currentDate = new Date(event.startTime);
        while (currentDate <= recurrenceEnd && currentDate <= rangeEnd) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          if (currentDate >= rangeStart && !exceptions.includes(dateStr)) {
            const duration = event.endTime.getTime() - event.startTime.getTime();
            expanded.push({
              ...event,
              id: `${event.id}-${dateStr}`,
              startTime: new Date(currentDate),
              endTime: new Date(currentDate.getTime() + duration),
            });
          }
          currentDate = addDays(currentDate, 1);
        }
      } else if (frequency === 'weekly' && daysOfWeek) {
        let currentDate = new Date(event.startTime);
        while (currentDate <= recurrenceEnd && currentDate <= rangeEnd) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          if (currentDate >= rangeStart && daysOfWeek.includes(currentDate.getDay()) && !exceptions.includes(dateStr)) {
            const duration = event.endTime.getTime() - event.startTime.getTime();
            expanded.push({
              ...event,
              id: `${event.id}-${dateStr}`,
              startTime: new Date(currentDate),
              endTime: new Date(currentDate.getTime() + duration),
            });
          }
          currentDate = addDays(currentDate, 1);
        }
      }
    }
  });

  return expanded;
}

export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return events.filter((event) => {
    return (
      isWithinInterval(event.startTime, { start: dayStart, end: dayEnd }) ||
      isWithinInterval(event.endTime, { start: dayStart, end: dayEnd }) ||
      (event.startTime < dayStart && event.endTime > dayEnd)
    );
  });
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  return !isSameDay(event.startTime, event.endTime);
}

export function formatEventTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatDateRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    return format(start, 'MMM d, yyyy');
  }
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}
