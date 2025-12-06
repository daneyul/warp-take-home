import { CalendarEvent } from '../types';
import { parseDateInUserTimezone } from '../timezone-utils';

export interface DateRangeError {
  field: 'startDate' | 'endDate' | 'startTime' | 'endTime' | null;
  message: string;
}

export interface FormData {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
}

export function getDateRangeError(formData: FormData): DateRangeError | null {
  if (!formData.startDate) return null;

  const endDate = formData.endDate || formData.startDate;

  if (formData.isAllDay) {
    // For all-day events, just compare dates
    if (formData.endDate && formData.endDate < formData.startDate) {
      return { field: 'endDate', message: 'End date cannot be before start date' };
    }
  } else {
    // For timed events, compare date + time
    if (formData.endDate && formData.endDate < formData.startDate) {
      return { field: 'endDate', message: 'End date cannot be before start date' };
    }

    // Check if all fields are the same (start date = end date and start time = end time)
    if (
      endDate === formData.startDate &&
      formData.startTime &&
      formData.endTime &&
      formData.startTime === formData.endTime
    ) {
      return { field: 'endTime', message: 'Times are not possible' };
    }

    // If same date, check if end time is before start time
    if (endDate === formData.startDate && formData.startTime && formData.endTime) {
      if (formData.endTime < formData.startTime) {
        return { field: 'endTime', message: 'End time cannot be before start time' };
      }
    }
  }

  return null;
}

export interface TimeOffOverlap {
  person: string;
}

export function getTimeOffOverlaps(
  events: CalendarEvent[],
  formData: FormData
): TimeOffOverlap[] {
  if (!formData.startDate) return [];

  let startDateTime: Date;
  let endDateTime: Date;

  if (formData.isAllDay) {
    // For all-day events, use start of day and end of day
    const startDate = parseDateInUserTimezone(formData.startDate);
    const endDate = parseDateInUserTimezone(formData.endDate || formData.startDate);

    // Set to start of day (00:00) and end of day (23:59:59.999)
    startDateTime = new Date(startDate);
    startDateTime.setUTCHours(0, 0, 0, 0);

    endDateTime = new Date(endDate);
    endDateTime.setUTCHours(23, 59, 59, 999);
  } else {
    startDateTime = parseDateInUserTimezone(formData.startDate, formData.startTime || '00:00');
    endDateTime = parseDateInUserTimezone(
      formData.endDate || formData.startDate,
      formData.endTime || '23:59'
    );
  }

  const allTimeOffEvents = events.filter((event) => event.type === 'time-off' && event.person);

  const overlaps: TimeOffOverlap[] = [];
  const seenPeople = new Set<string>();

  allTimeOffEvents.forEach((event) => {
    // Check if the proposed event overlaps with this time-off event
    if (startDateTime < event.endTime && endDateTime > event.startTime) {
      if (event.person && !seenPeople.has(event.person)) {
        overlaps.push({ person: event.person });
        seenPeople.add(event.person);
      }
    }
  });

  return overlaps;
}
