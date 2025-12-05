'use client';

import { forwardRef } from 'react';
import { useAtom } from 'jotai';
import { currentDateAtom, filteredEventsAtom } from '@/lib/atoms';
import { expandRecurringEvents, getEventsForDay } from '@/lib/calendar-utils';
import { format, startOfDay, endOfDay } from 'date-fns';
import { CalendarEvent, EVENT_COLORS } from '@/lib/types';
import { LoopIcon } from '@radix-ui/react-icons';
import EventDetailsPopover from './EventDetailsPopover';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface EventWithLayout extends CalendarEvent {
  column: number;
  columnCount: number;
}

export default function DayView() {
  const [currentDate] = useAtom(currentDateAtom);
  const [events] = useAtom(filteredEventsAtom);

  const dayStart = startOfDay(currentDate);
  const dayEnd = endOfDay(currentDate);
  const expandedEvents = expandRecurringEvents(events, dayStart, dayEnd);
  const dayEvents = getEventsForDay(expandedEvents, currentDate);

  // Separate all-day events from timed events
  const allDayEvents = dayEvents.filter((e) => e.isAllDay);
  const timedEvents = dayEvents.filter((e) => !e.isAllDay);

  // Calculate overlapping events and assign columns
  const timedEventsWithLayout = calculateEventLayout(timedEvents);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="text-sm font-medium text-gray-600">{format(currentDate, 'EEEE')}</div>
        <div className="text-2xl font-semibold text-gray-900">{format(currentDate, 'MMMM d, yyyy')}</div>
      </div>

      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="text-xs font-semibold text-gray-500 mb-2">ALL DAY</div>
          <div className="space-y-1">
            {allDayEvents.map((event) => (
              <EventDetailsPopover key={event.id} event={event}>
                <AllDayEventPill event={event} />
              </EventDetailsPopover>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 flex-shrink-0 border-r border-gray-200">
            {HOURS.map((hour) => (
              <div key={hour} className="h-20 border-b border-gray-100 px-2 py-2">
                <div className="text-sm text-gray-500">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative flex-1">
            {HOURS.map((hour) => (
              <div key={hour} className="h-20 border-b border-gray-100"></div>
            ))}
            {/* Events overlay */}
            <div className="pointer-events-none absolute inset-0 px-2">
              {timedEventsWithLayout.map((event) => (
                <EventDetailsPopover key={event.id} event={event}>
                  <EventBlock event={event} />
                </EventDetailsPopover>
              ))}
            </div>
          </div>
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

function AllDayEventPill({ event }: { event: CalendarEvent }) {
  const colors = EVENT_COLORS[event.type];

  return (
    <button
      className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition-all hover:opacity-80 hover:shadow-sm ${colors.bg} ${colors.text}`}
    >
      <div className="flex items-center gap-2">
        <span>{event.title}</span>
        {event.recurrence && <LoopIcon className="h-3 w-3 opacity-75" />}
        {event.person && <span className="text-xs opacity-75">({event.person})</span>}
      </div>
    </button>
  );
}

function EventBlock({ event }: { event: EventWithLayout }) {
  const colors = EVENT_COLORS[event.type];
  const isPartial = event.isPartialDay;

  // Calculate position and height
  const startHour = event.startTime.getHours();
  const startMinute = event.startTime.getMinutes();
  const endHour = event.endTime.getHours();
  const endMinute = event.endTime.getMinutes();

  const top = (startHour + startMinute / 60) * 80; // 80px per hour
  const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60);
  const height = Math.max(duration * 80, 40); // Minimum 40px height

  // Calculate width and position for overlapping events
  const columnWidth = 100 / event.columnCount;
  const leftOffset = event.column * columnWidth;

  return (
    <button
      className={`pointer-events-auto absolute overflow-hidden rounded-lg border transition-all ${colors.bg} ${colors.text} ${colors.border} ${isPartial ? 'border-l-4' : ''} shadow-sm hover:shadow-md hover:opacity-90 hover:z-10`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftOffset}%`,
        width: `${columnWidth}%`,
      }}
    >
      <div className="px-3 py-2">
        <div className="flex items-center gap-1 font-semibold">
          {isPartial && <span className="text-xs opacity-70">⏱</span>}
          {event.recurrence && <LoopIcon className="h-3 w-3 flex-shrink-0 opacity-75" />}
          <span className="truncate">{event.title}</span>
        </div>
        <div className="mt-1 text-sm opacity-90">
          {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
        </div>
        {event.description && (
          <div className="mt-1 truncate text-xs opacity-80">{event.description}</div>
        )}
      </div>
    </button>
  );
}
