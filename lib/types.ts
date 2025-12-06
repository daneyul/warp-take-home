export type EventType =
  | 'time-off'
  | 'birthday'
  | 'work-anniversary'
  | 'company-event'
  | 'deadline'
  | 'meeting';

export type EventSubtype =
  | 'daily-standup'
  | 'sprint-planning'
  | 'product-launch'
  | 'planning'
  | 'all-hands';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  subtype?: EventSubtype; // Optional subtype for meetings, deadlines, and company events
  startTime: Date; // Stored in UTC
  endTime: Date; // Stored in UTC
  description?: string;
  person?: string; // For birthdays, anniversaries, time-off
  isAllDay?: boolean;
  isPartialDay?: boolean; // For half-day time off (e.g., morning only, afternoon only)
  timezone?: string; // IANA timezone (e.g., 'America/New_York')
  recurrence?: {
    frequency: RecurrenceFrequency;
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
    endDate?: Date;
    exceptions?: string[]; // ISO date strings of excluded dates (e.g., '2024-01-15')
  };
}

// Mapping of event types to their possible subtypes
export const EVENT_SUBTYPES: Record<'meeting' | 'deadline' | 'company-event', { value: EventSubtype; label: string }[]> = {
  'meeting': [
    { value: 'daily-standup', label: 'Daily Standup' },
    { value: 'sprint-planning', label: 'Sprint Planning' },
  ],
  'deadline': [
    { value: 'product-launch', label: 'Product Launch' },
  ],
  'company-event': [
    { value: 'planning', label: 'Planning' },
    { value: 'all-hands', label: 'All-Hands' },
  ],
};

export type ViewMode = 'month' | 'week' | 'day';

export const EVENT_COLORS: Record<EventType, { bg: string; bgHover: string; text: string; border: string }> = {
  'time-off': {
    bg: 'bg-blue-100',
    bgHover: 'hover:bg-blue-200',
    text: 'text-blue-900',
    border: 'border-blue-300',
  },
  'birthday': {
    bg: 'bg-purple-100',
    bgHover: 'hover:bg-purple-200',
    text: 'text-purple-900',
    border: 'border-purple-300',
  },
  'work-anniversary': {
    bg: 'bg-amber-100',
    bgHover: 'hover:bg-amber-200',
    text: 'text-amber-900',
    border: 'border-amber-300',
  },
  'company-event': {
    bg: 'bg-green-100',
    bgHover: 'hover:bg-green-200',
    text: 'text-green-900',
    border: 'border-green-300',
  },
  'deadline': {
    bg: 'bg-red-100',
    bgHover: 'hover:bg-red-200',
    text: 'text-red-900',
    border: 'border-red-300',
  },
  'meeting': {
    bg: 'bg-zinc-100',
    bgHover: 'hover:bg-zinc-200',
    text: 'text-zinc-900',
    border: 'border-zinc-300',
  },
};
