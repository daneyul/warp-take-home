'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { eventsAtom, selectedEventAtom } from '@/lib/atoms';
import * as Popover from '@radix-ui/react-popover';
import { Pencil1Icon, TrashIcon, LoopIcon, ClockIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import { CalendarEvent, EVENT_COLORS } from '@/lib/types';
import { format } from 'date-fns';
import { formatEventTime, formatDateRange, isMultiDayEvent } from '@/lib/calendar-utils';
import { getUserTimezone } from '@/lib/timezone-utils';
import { motion, AnimatePresence } from 'framer-motion';
import useMeasure from 'react-use-measure';

interface EventDetailsPopoverProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

export default function EventDetailsPopover({ event, children }: EventDetailsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [events, setEvents] = useAtom(eventsAtom);
  const [, setSelectedEvent] = useAtom(selectedEventAtom);
  const [ref, bounds] = useMeasure();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [deleteClickedOnce, setDeleteClickedOnce] = useState(false);

  const colors = EVENT_COLORS[event.type];

  const handleEdit = () => {
    setOpen(false);
    setSelectedEvent(event);
  };

  const handleDeleteClick = () => {
    if (event.recurrence) {
      setIsTransitioning(true);
      setShowDeleteConfirm(true);
    } else {
      if (deleteClickedOnce) {
        handleDeleteAll();
      } else {
        setDeleteClickedOnce(true);
        setTimeout(() => {
          setDeleteClickedOnce(false);
        }, 2000);
      }
    }
  };

  const handleDeleteAll = () => {
    // For recurring events, extract the base ID and delete the base event
    const match = event.id.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/);
    const baseId = match ? match[1] : event.id;

    setEvents(events.filter((e) => e.id !== baseId));
    setOpen(false);
    setShowDeleteConfirm(false);
  };

  const handleDeleteThisOnly = () => {
    // Extract the base event ID and date from the instance ID
    // Instance IDs are formatted as: "base-id-YYYY-MM-DD"
    const match = event.id.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/);
    if (!match) {
      // Not a recurring instance, just delete it
      handleDeleteAll();
      return;
    }

    const [, baseId, dateStr] = match;

    // Find the original recurring event
    const recurringEvent = events.find(e => e.id === baseId);
    if (!recurringEvent || !recurringEvent.recurrence) {
      handleDeleteAll();
      return;
    }

    // Add this date to the exceptions list
    const updatedEvent = {
      ...recurringEvent,
      recurrence: {
        ...recurringEvent.recurrence,
        exceptions: [...(recurringEvent.recurrence.exceptions || []), dateStr],
      },
    };

    // Update the event in the array
    setEvents(events.map(e => e.id === baseId ? updatedEvent : e));
    setOpen(false);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setIsTransitioning(true);
    setShowDeleteConfirm(false);
  };

  const getEventTypeLabel = (type: string) => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setShowDeleteConfirm(false);
      setDeleteClickedOnce(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-80 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden"
          side="bottom"
          align="start"
          sideOffset={5}
        >
          <motion.div
            animate={isTransitioning ? { height: bounds.height > 0 ? bounds.height : 'auto' } : {}}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            style={!isTransitioning ? { height: 'auto' } : undefined}
          >
            <div ref={ref}>
              <AnimatePresence mode="wait" initial={false}>
                {!showDeleteConfirm ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className="p-4 space-y-3"
                  >
                {/* Event type badge and title */}
                <div className="space-y-2">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      {getEventTypeLabel(event.type)}
                    </span>
                    {event.recurrence && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">
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
                </div>

                {/* Date/Time */}
                <div className="space-y-1 text-sm">
                <div className="font-medium">Date & Time</div>
                  {event.isAllDay ? (
                    <div>
                      {isMultiDayEvent(event)
                        ? formatDateRange(event.startTime, event.endTime)
                        : format(event.startTime, 'MMMM d, yyyy')}
                    </div>
                  ) : (
                    <div>
                      <div>{format(event.startTime, 'EEEE, MMMM d, yyyy')}</div>
                      <div className="mt-0.5">
                        {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Person (if applicable) */}
                {event.person && (
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Person</div>
                    <div>{event.person}</div>
                  </div>
                )}

                {/* Description */}
                {event.description && (
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Description</div>
                    <div>{event.description}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 justify-end">
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className={`flex items-center justify-center rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-all duration-300 ease-out overflow-hidden whitespace-nowrap ${deleteClickedOnce ? "w-44" : "w-20"}`}
                  >
                    {deleteClickedOnce ? "Click again to delete" : "Delete"}
                  </button>
                </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="delete-confirm"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className="p-4 space-y-3"
                  >
                <div className="text-sm font-medium">Delete recurring event?</div>
                <div className="space-y-2">
                  <button
                    onClick={handleDeleteThisOnly}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 text-left"
                  >
                    Delete this event only
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 text-left"
                  >
                    Delete all of these events
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="w-full flex gap-2 items-center rounded-md border border-gray-300  px-3 py-2 text-sm font-medium hover:bg-gray-100 text-left"
                  >
                    <ArrowLeftIcon /> Go Back
                  </button>
                </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
