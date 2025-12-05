'use client';

import { forwardRef } from 'react';
import { useAtom } from 'jotai';
import { currentDateAtom, filteredEventsAtom } from '@/lib/atoms';
import { getWeekViewDays, expandRecurringEvents, getEventsForDay } from '@/lib/calendar-utils';
import { format, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { CalendarEvent, EVENT_COLORS } from '@/lib/types';
import { LoopIcon } from '@radix-ui/react-icons';
import EventDetailsPopover from './EventDetailsPopover';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface EventWithLayout extends CalendarEvent {
  column: number;
  columnCount: number;
}

export default function WeekView() {
  const [currentDate] = useAtom(currentDateAtom);
  const [events] = useAtom(filteredEventsAtom);

  const weekDays = getWeekViewDays(currentDate);
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const expandedEvents = expandRecurringEvents(events, weekStart, weekEnd);

  const today = new Date();

  return (
    <div className="flex h-full flex-col">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
        <div className="px-2 py-3"></div>
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={day.toISOString()} className="flex flex-col items-center px-2 py-3">
              <div className="text-xs font-medium text-gray-600">{format(day, 'EEE')}</div>
              <div
                className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday ? 'bg-blue-600 text-white' : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events section */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
        <div className="px-2 py-2 text-xs font-semibold text-gray-500">ALL DAY</div>
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(expandedEvents, day);
          const allDayEvents = dayEvents.filter((e) => e.isAllDay);
          return (
            <div key={day.toISOString()} className="border-r border-gray-200 p-1 last:border-r-0">
              <div className="space-y-1">
                {allDayEvents.map((event) => (
                  <EventDetailsPopover key={event.id} event={event}>
                    <AllDayEventPill event={event} />
                  </EventDetailsPopover>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r border-gray-200">
            {HOURS.map((hour) => (
              <div key={hour} className="h-16 border-b border-gray-100 px-2 py-1">
                <div className="text-xs text-gray-500">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(expandedEvents, day);
            const timedEvents = dayEvents.filter((e) => !e.isAllDay);
            const timedEventsWithLayout = calculateEventLayout(timedEvents);
            return (
              <div key={day.toISOString()} className="relative border-r border-gray-200">
                {HOURS.map((hour) => (
                  <div key={hour} className="h-16 border-b border-gray-100"></div>
                ))}
                {/* Events overlay */}
                <div className="pointer-events-none absolute inset-0">
                  {timedEventsWithLayout.map((event) => (
                    <EventDetailsPopover key={event.id} event={event}>
                      <EventBlock event={event} />
                    </EventDetailsPopover>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Calculate layout for overlapping events
function calculateEventLayout(events: CalendarEvent[]): EventWithLayout[] {
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const columns: CalendarEvent[][] = [];

  sortedEvents.forEach((event) => {
    // Find a column where this event doesn't overlap with existing events
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const hasOverlap = column.some((existingEvent) => {
        return (
          event.startTime < existingEvent.endTime &&
          event.endTime > existingEvent.startTime
        );
      });
      if (!hasOverlap) {
        column.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
    }
  });

  // Assign column info to events
  const eventsWithLayout: EventWithLayout[] = [];
  columns.forEach((column, columnIndex) => {
    column.forEach((event) => {
      // Find max columns for overlapping events
      const overlappingEvents = sortedEvents.filter((e) => {
        return (
          (e.startTime < event.endTime && e.endTime > event.startTime) ||
          (event.startTime < e.endTime && event.endTime > e.startTime)
        );
      });

      const maxColumns = Math.max(
        ...overlappingEvents.map((e) => {
          for (let i = 0; i < columns.length; i++) {
            if (columns[i].includes(e)) return i + 1;
          }
          return 1;
        })
      );

      eventsWithLayout.push({
        ...event,
        column: columnIndex,
        columnCount: maxColumns,
      });
    });
  });

  return eventsWithLayout;
}

const AllDayEventPill = forwardRef<HTMLButtonElement, { event: CalendarEvent }>(
  ({ event, ...props }, ref) => {
    const colors = EVENT_COLORS[event.type];

    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={`w-full rounded px-2 py-1 text-left text-xs font-medium transition-all hover:opacity-80 ${colors.bg} ${colors.text}`}
        title={event.title}
      >
        <div className="flex items-center gap-1 truncate">
          {event.recurrence && <LoopIcon className="h-3 w-3 flex-shrink-0 opacity-75" />}
          <span className="truncate">{event.title}</span>
        </div>
      </button>
    );
  }
);

AllDayEventPill.displayName = 'AllDayEventPill';

const EventBlock = forwardRef<HTMLButtonElement, { event: EventWithLayout }>(
  ({ event, ...props }, ref) => {
    const colors = EVENT_COLORS[event.type];
    const isPartial = event.isPartialDay;

    // Calculate position and height
    const startHour = event.startTime.getHours();
    const startMinute = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMinute = event.endTime.getMinutes();

    const top = (startHour + startMinute / 60) * 64; // 64px per hour
    const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60);
    const height = Math.max(duration * 64, 32); // Minimum 32px height

    // Calculate width and position for overlapping events
    const columnWidth = 100 / event.columnCount;
    const leftOffset = event.column * columnWidth;

    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={`pointer-events-auto absolute overflow-hidden rounded border transition-all ${colors.bg} ${colors.text} ${colors.border} ${isPartial ? 'border-l-4' : ''} hover:opacity-90 hover:shadow-md hover:z-10`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          left: `${leftOffset}%`,
          width: `${columnWidth}%`,
        }}
      >
        <div className="px-2 py-1">
          <div className="flex items-center gap-1 truncate text-xs font-semibold">
            {isPartial && <span className="opacity-70">⏱</span>}
            {event.recurrence && <LoopIcon className="h-3 w-3 flex-shrink-0 opacity-75" />}
            <span className="truncate">{event.title}</span>
          </div>
          <div className="text-xs opacity-90">
            {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
          </div>
        </div>
      </button>
    );
  }
);

EventBlock.displayName = 'EventBlock';
