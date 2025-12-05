import { atom } from 'jotai';
import { CalendarEvent, ViewMode, EventType } from './types';
import { MOCK_EVENTS } from './mock-data';

// Current view mode (month, week, day)
export const viewModeAtom = atom<ViewMode>('month');

// Current date being viewed (defaults to today)
export const currentDateAtom = atom<Date>(new Date());

// All events
export const eventsAtom = atom<CalendarEvent[]>(MOCK_EVENTS);

// Selected event (for sidebar)
export const selectedEventAtom = atom<CalendarEvent | null>(null);

// Event type filters
export const eventTypeFiltersAtom = atom<Set<EventType>>(new Set());

// Derived atom: filtered events
export const filteredEventsAtom = atom((get) => {
  const events = get(eventsAtom);
  const filters = get(eventTypeFiltersAtom);

  if (filters.size === 0) {
    return events;
  }

  return events.filter((event) => !filters.has(event.type));
});
