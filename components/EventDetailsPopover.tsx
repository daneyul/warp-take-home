'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { selectedEventAtom } from '@/lib/atoms';
import * as Popover from '@radix-ui/react-popover';
import { LoopIcon, Cross2Icon } from '@radix-ui/react-icons';
import { CalendarEvent, EVENT_COLORS } from '@/lib/types';
import { format } from 'date-fns';
import { formatEventTime, formatDateRange, isMultiDayEvent } from '@/lib/calendar-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getEventTypeLabel } from '@/lib/utils/event-utils';
import { useDeleteEvent } from '@/lib/hooks/useDeleteEvent';
import AutoHeightAnimationWrapper from '@/components/common/AutoHeightAnimationWrapper';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import { buttonDeleteClass, dialogCloseButtonClass, buttonSecondaryClass } from '@/lib/constants/styles';

interface EventDetailsPopoverProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

export default function EventDetailsPopover({ event, children }: EventDetailsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [, setSelectedEvent] = useAtom(selectedEventAtom);

  const {
    showDeleteConfirm,
    deleteClickedOnce,
    isTransitioning,
    handleDeleteClick,
    handleDeleteAll,
    handleDeleteThisOnly,
    handleCancelDelete,
    resetDeleteState,
  } = useDeleteEvent({
    onDeleteComplete: () => setOpen(false),
  });

  const colors = EVENT_COLORS[event.type];

  const handleEdit = () => {
    setOpen(false);
    setSelectedEvent(event);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetDeleteState();
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-80 rounded-md border border-zinc-300 bg-white shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden"
          side="bottom"
          align="start"
          sideOffset={5}
        >
          <AutoHeightAnimationWrapper isTransitioning={isTransitioning} duration={0.3}>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <Popover.Close asChild>
                    <button className={dialogCloseButtonClass} aria-label="Close">
                      <Cross2Icon className="h-4 w-4 text-zinc-600" />
                    </button>
                  </Popover.Close>
                </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      {getEventTypeLabel(event.type)}
                    </span>
                    {event.recurrence && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium">
                        <LoopIcon className="h-3 w-3" />
                        Recurring
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

                {/* Timezone */}
                {event.timezone && (
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Timezone</div>
                    <div className="text-zinc-600">{event.timezone}</div>
                  </div>
                )}

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
                    className={buttonSecondaryClass}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event)}
                    className={`${buttonDeleteClass} ${deleteClickedOnce ? "w-44" : "w-20"}`}
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
                    className="p-4"
                  >
                    <DeleteConfirmation
                      event={event}
                      onDeleteThis={handleDeleteThisOnly}
                      onDeleteAll={handleDeleteAll}
                      onCancel={handleCancelDelete}
                    />
                  </motion.div>
                )}
            </AnimatePresence>
          </AutoHeightAnimationWrapper>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
