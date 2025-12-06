import { EventType } from '../types';

export interface EventTypeConfig {
  value: EventType;
  label: string;
}

export const MEETING = 'meeting';
export const DEADLINE = 'deadline';
export const COMPANY_EVENT = 'company-event';
export const TIME_OFF = 'time-off';
export const BIRTHDAY = 'birthday';
export const WORK_ANNIVERSARY = 'work-anniversary';

export const EVENT_TYPE_CONFIGS: EventTypeConfig[] = [
  { value: MEETING, label: 'Meeting' },
  { value: DEADLINE, label: 'Deadline' },
  { value: COMPANY_EVENT, label: 'Company Event' },
  { value: TIME_OFF, label: 'Time Off' },
  { value: BIRTHDAY, label: 'Birthday' },
  { value: WORK_ANNIVERSARY, label: 'Work Anniversary' },
];

export const EVENT_TYPES_WITH_PERSON: EventType[] = [
  TIME_OFF,
  BIRTHDAY,
  WORK_ANNIVERSARY,
];

export const DELETE_CONFIRMATION_TIMEOUT = 2000;

export const MONTH = 'month';
export const WEEK = 'week';
export const DAY = 'day';

export const DAILY = 'daily';
export const WEEKLY = 'weekly';
export const MONTHLY = 'monthly';

export const DAILY_TEXT = 'Daily';
export const WEEKLY_TEXT = 'Weekly';
export const MONTHLY_TEXT = 'Monthly';

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
