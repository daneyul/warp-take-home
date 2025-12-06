import { atom } from 'jotai';
import { CalendarEvent, ViewMode, EventType, EventSubtype } from './types';
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

// Event subtype filters
export const eventSubtypeFiltersAtom = atom<Set<EventSubtype>>(new Set());

// Derived atom: filtered events
export const filteredEventsAtom = atom((get) => {
  const events = get(eventsAtom);
  const typeFilters = get(eventTypeFiltersAtom);
  const subtypeFilters = get(eventSubtypeFiltersAtom);

  return events.filter((event) => {
    // If the event type is filtered out, hide it
    if (typeFilters.has(event.type)) {
      return false;
    }
    
    // If the event has a subtype and that subtype is filtered out, hide it
    if (event.subtype && subtypeFilters.has(event.subtype)) {
      return false;
    }
    
    return true;
  });
});

// Navigation direction for animations (-1 for previous/left, 1 for next/right)
export const navigationDirectionAtom = atom<number>(0);

// Mobile sidebar open state
export const mobileSidebarOpenAtom = atom<boolean>(false);
