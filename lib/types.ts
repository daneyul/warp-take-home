export type EventType =
  | 'time-off'
  | 'birthday'
  | 'work-anniversary'
  | 'company-event'
  | 'deadline'
  | 'meeting';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startTime: Date; // Stored in UTC
  endTime: Date; // Stored in UTC
  description?: string;
  person?: string; // For birthdays, anniversaries, time-off
  isAllDay?: boolean;
  isPartialDay?: boolean; // For half-day time off (e.g., morning only, afternoon only)
  timezone?: string; // IANA timezone (e.g., 'America/New_York')
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
    endDate?: Date;
    exceptions?: string[]; // ISO date strings of excluded dates (e.g., '2024-01-15')
  };
}

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
    bg: 'bg-gray-100',
    bgHover: 'hover:bg-gray-200',
    text: 'text-gray-900',
    border: 'border-gray-300',
  },
};
