'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { eventsAtom, selectedEventAtom } from '@/lib/atoms';
import * as Popover from '@radix-ui/react-popover';
import { Pencil1Icon, TrashIcon, LoopIcon, ClockIcon } from '@radix-ui/react-icons';
import { CalendarEvent, EVENT_COLORS } from '@/lib/types';
import { format } from 'date-fns';
import { formatEventTime, formatDateRange, isMultiDayEvent } from '@/lib/calendar-utils';
import { getUserTimezone } from '@/lib/timezone-utils';

interface EventDetailsPopoverProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

export default function EventDetailsPopover({ event, children }: EventDetailsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useAtom(eventsAtom);
  const [, setSelectedEvent] = useAtom(selectedEventAtom);

  const colors = EVENT_COLORS[event.type];

  const handleEdit = () => {
    setOpen(false);
    setSelectedEvent(event);
  };

  const handleDelete = () => {
    setEvents(events.filter((e) => e.id !== event.id));
    setOpen(false);
  };

  const getEventTypeLabel = (type: string) => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          side="bottom"
          align="start"
          sideOffset={5}
        >
          <div className="space-y-3">
            {/* Event type badge and title */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                >
                  {getEventTypeLabel(event.type)}
                </span>
                {event.recurrence && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    <LoopIcon className="h-3 w-3" />
                    Recurring
                  </span>
                )}
                {event.isPartialDay && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    <ClockIcon className="h-3 w-3" />
                    Partial Day
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            </div>

            {/* Date/Time */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500">Date & Time</div>
              {event.isAllDay ? (
                <div className="text-sm text-gray-900">
                  {isMultiDayEvent(event)
                    ? formatDateRange(event.startTime, event.endTime)
                    : format(event.startTime, 'MMMM d, yyyy')}
                </div>
              ) : (
                <div className="text-sm text-gray-900">
                  <div>{format(event.startTime, 'EEEE, MMMM d, yyyy')}</div>
                  <div className="mt-0.5">
                    {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Timezone: {event.timezone || getUserTimezone()}
                  </div>
                </div>
              )}
            </div>

            {/* Person (if applicable) */}
            {event.person && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500">Person</div>
                <div className="text-sm text-gray-900">{event.person}</div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500">Description</div>
                <div className="text-sm text-gray-900">{event.description}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 border-t border-gray-200 pt-3">
              <button
                onClick={handleEdit}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil1Icon className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
