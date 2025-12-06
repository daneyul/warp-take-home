import { atom } from 'jotai';
import { CalendarEvent, ViewMode, EventType, EventSubtype } from './types';
import { MOCK_EVENTS } from './mock-data';
import { MONTH } from './constants/event-types';

// Current view mode (month, week, day)
export const viewModeAtom = atom<ViewMode>(MONTH);

// Current date being viewed (defaults to today)
export const currentDateAtom = atom<Date>(new Date());

export const allEventsAtom = atom<CalendarEvent[]>(MOCK_EVENTS);

// For sidebar
export const selectedEventAtom = atom<CalendarEvent | null>(null);

export const eventTypeFiltersAtom = atom<Set<EventType>>(new Set<EventType>());

export const eventSubtypeFiltersAtom = atom<Set<EventSubtype>>(new Set<EventSubtype>());

export const filteredEventsAtom = atom((get) => {
  const events = get(allEventsAtom);
  const typeFilters = get(eventTypeFiltersAtom);
  const subtypeFilters = get(eventSubtypeFiltersAtom);

  return events.filter((event) => {
    if (typeFilters.has(event.type)) {
      return false;
    }
    
    if (event.subtype && subtypeFilters.has(event.subtype)) {
      return false;
    }
    
    return true;
  });
});

// Navigation direction for animations (-1 for previous/left, 1 for next/right)
export const navigationDirectionAtom = atom<number>(0);

export const mobileSidebarOpenAtom = atom<boolean>(false);
