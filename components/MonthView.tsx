'use client';

import { forwardRef } from 'react';
import { useAtom } from 'jotai';
import { currentDateAtom, filteredEventsAtom, viewModeAtom } from '@/lib/atoms';
import { getMonthViewDays, expandRecurringEvents, getEventsForDay } from '@/lib/calendar-utils';
import { format, isSameMonth, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { CalendarEvent, EVENT_COLORS } from '@/lib/types';
import { LoopIcon } from '@radix-ui/react-icons';
import EventDetailsPopover from './EventDetailsPopover';

export default function MonthView() {
  const [currentDate] = useAtom(currentDateAtom);
  const [events] = useAtom(filteredEventsAtom);
  const [, setViewMode] = useAtom(viewModeAtom);
  const [, setCurrentDate] = useAtom(currentDateAtom);

  const days = getMonthViewDays(currentDate);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const expandedEvents = expandRecurringEvents(events, monthStart, monthEnd);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Split days into weeks for proper rendering
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }


  return (
    <div className="flex h-full flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div key={day} className="border-r border-gray-200 p-2 text-center text-xs font-semibold last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1">
        {weeks.map((week, weekIndex) => {
          return (
            <div key={weekIndex} className="relative" style={{ height: `${100 / weeks.length}%` }}>
              {/* Date row and cells container */}
              <div className="grid grid-cols-7 h-full">
                {week.map((day) => {
                  const dayEvents = getEventsForDay(expandedEvents, day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);

                  const handleDayClick = (e: React.MouseEvent) => {
                    // Don't switch to day view if clicking on an event
                    const target = e.target as HTMLElement;
                    if (target.closest('button')) {
                      return;
                    }
                    setCurrentDate(day);
                    setViewMode('day');
                  };

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={handleDayClick}
                      className={`relative border-b border-r border-gray-200 p-2 last:border-r-0 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-100'
                      }`}
                    >
                      {/* Date number */}
                      <div className="flex items-center justify-between mb-1">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${
                            isTodayDate
                              ? 'bg-black/80 text-white'
                              : ''
                          }`}
                        >
                          {format(day, 'd')}
                        </div>
                      </div>

                      {/* Events */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <EventDetailsPopover key={event.id} event={event}>
                            <EventPill event={event} />
                          </EventDetailsPopover>
                        ))}

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const EventPill = forwardRef<HTMLButtonElement, { event: CalendarEvent }>(
  ({ event, ...props }, ref) => {
    const isPartial = event.isPartialDay;
    const timeDisplay = event.isAllDay
      ? ''
      : isPartial
        ? `${format(event.startTime, 'h:mma')} `
        : `${format(event.startTime, 'h:mm a')} `;

    const colors = EVENT_COLORS[event.type];

    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={`group relative w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium transition-all ${colors.bg} ${colors.bgHover} ${colors.text}`}
        title={event.title}
      >
        <span className="flex items-center gap-1">
          {isPartial && <span className="text-[10px] opacity-70">⏱</span>}
          {event.recurrence && <LoopIcon className="h-3 w-3 shrink-0 opacity-75" />}
          {timeDisplay}
          <span className="truncate">{event.title}</span>
        </span>
      </button>
    );
  }
);

EventPill.displayName = 'EventPill';
