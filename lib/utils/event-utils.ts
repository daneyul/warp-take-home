import { EventType } from '../types';
import { EVENT_TYPES_WITH_PERSON } from '../constants/event-types';

export const RECURRING_EVENT_PATTERN = /^(.+)-(\d{4}-\d{2}-\d{2})$/;

export function extractBaseEventId(eventId: string): {
  baseId: string;
  dateStr: string | null;
  isRecurringInstance: boolean;
} {
  const match = eventId.match(RECURRING_EVENT_PATTERN);

  if (match) {
    const [, baseId, dateStr] = match;
    return {
      baseId,
      dateStr,
      isRecurringInstance: true,
    };
  }

  return {
    baseId: eventId,
    dateStr: null,
    isRecurringInstance: false,
  };
}

export function getEventTypeLabel(type: string): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function eventTypeSupportsPersonField(type: EventType): boolean {
  return EVENT_TYPES_WITH_PERSON.includes(type);
}
