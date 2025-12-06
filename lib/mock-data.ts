import { CalendarEvent } from './types';

/**
 * Helper to create UTC dates
 * IMPORTANT: For all-day events, use noon (12:00) UTC to prevent timezone shifting.
 * Example: Dec 15 at 00:00 UTC appears as Dec 14 in PST (UTC-8),
 *          but Dec 15 at 12:00 UTC appears as Dec 15 in all timezones (UTC-12 to UTC+14)
 */
const utc = (year: number, month: number, day: number, hour = 0, minute = 0) => {
  return new Date(Date.UTC(year, month, day, hour, minute));
};

// Default timezone for mock events
const DEFAULT_TIMEZONE = 'America/Los_Angeles';

export const MOCK_EVENTS: CalendarEvent[] = [
  // Recurring daily standup at 9am
  {
    id: 'standup',
    title: 'Daily Standup',
    type: 'meeting',
    subtype: 'daily-standup',
    startTime: utc(2025, 11, 1, 9, 0), // Dec 1, 2025, 9:00 AM UTC
    endTime: utc(2025, 11, 1, 9, 15),
    description: 'Daily team sync',
    timezone: DEFAULT_TIMEZONE,
    recurrence: {
      frequency: 'daily',
      endDate: utc(2025, 11, 31),
    },
  },
  // Weekly all-hands on Mondays at 10am
  {
    id: 'all-hands',
    title: 'All-Hands Meeting',
    type: 'company-event',
    subtype: 'all-hands',
    startTime: utc(2025, 11, 1, 10, 0), // Dec 1 (Monday), 10:00 AM UTC
    endTime: utc(2025, 11, 1, 11, 0),
    description: 'Weekly company-wide meeting',
    timezone: DEFAULT_TIMEZONE,
    recurrence: {
      frequency: 'weekly',
      daysOfWeek: [1], // Monday
      endDate: utc(2025, 11, 31),
    },
  },
  // Sarah's birthday
  {
    id: 'sarah-birthday',
    title: "Sarah's Birthday",
    type: 'birthday',
    startTime: utc(2025, 11, 12, 12, 0), // Dec 12 at noon UTC (prevents timezone shift)
    endTime: utc(2025, 11, 12, 12, 0),
    person: 'Sarah Chen',
    isAllDay: true,
    timezone: DEFAULT_TIMEZONE,
  },
  // Mike's work anniversary
  {
    id: 'mike-anniversary',
    title: "Mike's 2 Year Anniversary",
    type: 'work-anniversary',
    startTime: utc(2025, 11, 15, 12, 0), // Dec 15 at noon UTC (prevents timezone shift)
    endTime: utc(2025, 11, 15, 12, 0),
    person: 'Mike Johnson',
    isAllDay: true,
    timezone: DEFAULT_TIMEZONE,
  },
  // Product launch deadline
  {
    id: 'product-launch',
    title: 'Product Launch Deadline',
    type: 'deadline',
    subtype: 'product-launch',
    startTime: utc(2025, 11, 20, 17, 0), // Dec 20 (Friday), 5:00 PM UTC
    endTime: utc(2025, 11, 20, 17, 0),
    description: 'Final deadline for Q4 product launch',
    isAllDay: true,
    timezone: DEFAULT_TIMEZONE,
  },
  // Emma's PTO (2 full days)
  {
    id: 'emma-pto',
    title: 'Emma - Out of Office',
    type: 'time-off',
    startTime: utc(2025, 11, 16, 12, 0), // Dec 16 at noon UTC
    endTime: utc(2025, 11, 17, 12, 0), // Dec 17 at noon UTC
    person: 'Emma Wilson',
    isAllDay: true,
    description: 'Personal time off',
    timezone: DEFAULT_TIMEZONE,
  },
  // Alex's PTO (overlapping with Emma on Dec 16)
  {
    id: 'alex-pto',
    title: 'Alex - Out of Office',
    type: 'time-off',
    startTime: utc(2025, 11, 16, 12, 0), // Dec 16 at noon UTC
    endTime: utc(2025, 11, 16, 12, 0), // Dec 16 at noon UTC
    person: 'Alex Martinez',
    isAllDay: true,
    description: 'Vacation day',
    timezone: DEFAULT_TIMEZONE,
  },
  // Jordan's partial day off (morning only on Dec 18)
  {
    id: 'jordan-pto-morning',
    title: 'Jordan - Out (Morning)',
    type: 'time-off',
    startTime: utc(2025, 11, 18, 8, 0), // Dec 18, 8:00 AM
    endTime: utc(2025, 11, 18, 12, 0), // Dec 18, 12:00 PM
    person: 'Jordan Lee',
    isPartialDay: true,
    description: 'Personal appointment (morning)',
    timezone: DEFAULT_TIMEZONE,
  },
  // Sam's partial day off (afternoon only on Dec 19)
  {
    id: 'sam-pto-afternoon',
    title: 'Sam - Out (Afternoon)',
    type: 'time-off',
    startTime: utc(2025, 11, 19, 13, 0), // Dec 19, 1:00 PM
    endTime: utc(2025, 11, 19, 17, 0), // Dec 19, 5:00 PM
    person: 'Sam Taylor',
    isPartialDay: true,
    description: 'Doctor appointment (afternoon)',
    timezone: DEFAULT_TIMEZONE,
  },
  // Holiday party
  {
    id: 'holiday-party',
    title: 'Company Holiday Party',
    type: 'company-event',
    startTime: utc(2025, 11, 19, 18, 0), // Dec 19, 6:00 PM UTC
    endTime: utc(2025, 11, 19, 21, 0),
    description: 'Annual holiday celebration at the office',
    timezone: DEFAULT_TIMEZONE,
  },
  // Q1 Planning session
  {
    id: 'q1-planning',
    title: 'Q1 2026 Planning',
    type: 'company-event',
    subtype: 'planning',
    startTime: utc(2025, 11, 10, 14, 0), // Dec 10, 2:00 PM UTC
    endTime: utc(2025, 11, 10, 16, 0),
    description: 'Strategic planning for Q1 2026',
    timezone: DEFAULT_TIMEZONE,
  },
  // Some additional meetings to make the calendar interesting
  {
    id: 'design-review',
    title: 'Design Review',
    type: 'meeting',
    startTime: utc(2025, 11, 5, 14, 0), // Dec 5, 2:00 PM UTC
    endTime: utc(2025, 11, 5, 15, 30),
    description: 'Review of new product designs',
    timezone: DEFAULT_TIMEZONE,
  },
  {
    id: 'sprint-planning',
    title: 'Sprint Planning',
    type: 'meeting',
    subtype: 'sprint-planning',
    startTime: utc(2025, 11, 9, 10, 0), // Dec 9, 10:00 AM UTC
    endTime: utc(2025, 11, 9, 12, 0),
    description: 'Plan next sprint',
    timezone: DEFAULT_TIMEZONE,
  },
  {
    id: 'demo-day',
    title: 'Demo Day',
    type: 'company-event',
    startTime: utc(2025, 11, 13, 15, 0), // Dec 13, 3:00 PM UTC
    endTime: utc(2025, 11, 13, 16, 30),
    description: 'Team demos of completed features',
    timezone: DEFAULT_TIMEZONE,
  },
];
