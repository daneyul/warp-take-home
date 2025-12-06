'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { eventsAtom, selectedEventAtom } from '@/lib/atoms';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { Cross2Icon, TrashIcon, LoopIcon, ArrowLeftIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { CalendarEvent, EventType } from '@/lib/types';
import { parseDateInUserTimezone, getUserTimezone } from '@/lib/timezone-utils';
import { format } from 'date-fns';
import { dialogOverlayClass, dialogContentClass } from '@/lib/dialog-styles';
import { motion, AnimatePresence } from 'framer-motion';
import useMeasure from 'react-use-measure';

export default function EditEventDialog() {
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const [events, setEvents] = useAtom(eventsAtom);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ref, bounds] = useMeasure();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [deleteClickedOnce, setDeleteClickedOnce] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting' as EventType,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false,
    person: '',
    description: '',
  });

  // Populate form when event is selected
  useEffect(() => {
    if (selectedEvent) {
      setIsTransitioning(false);
      setDeleteClickedOnce(false);
      setFormData({
        title: selectedEvent.title,
        type: selectedEvent.type,
        startDate: format(selectedEvent.startTime, 'yyyy-MM-dd'),
        startTime: selectedEvent.isAllDay ? '' : format(selectedEvent.startTime, 'HH:mm'),
        endDate: format(selectedEvent.endTime, 'yyyy-MM-dd'),
        endTime: selectedEvent.isAllDay ? '' : format(selectedEvent.endTime, 'HH:mm'),
        isAllDay: selectedEvent.isAllDay || false,
        person: selectedEvent.person || '',
        description: selectedEvent.description || '',
      });
    }
  }, [selectedEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const startDateTime = formData.isAllDay
      ? parseDateInUserTimezone(formData.startDate)
      : parseDateInUserTimezone(formData.startDate, formData.startTime);

    const endDateTime = formData.isAllDay
      ? parseDateInUserTimezone(formData.endDate || formData.startDate)
      : parseDateInUserTimezone(formData.endDate || formData.startDate, formData.endTime);

    const isPartialDay = !formData.isAllDay && formData.startDate === (formData.endDate || formData.startDate);

    const updatedEvent: CalendarEvent = {
      ...selectedEvent,
      title: formData.title,
      type: formData.type,
      startTime: startDateTime,
      endTime: endDateTime,
      isAllDay: formData.isAllDay,
      isPartialDay: isPartialDay,
      timezone: getUserTimezone(),
      person: formData.person || undefined,
      description: formData.description || undefined,
    };

    setEvents(events.map((e) => (e.id === selectedEvent.id ? updatedEvent : e)));
    setSelectedEvent(null);
  };

  const handleDeleteClick = () => {
    if (!selectedEvent) return;
    if (selectedEvent.recurrence) {
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
    if (!selectedEvent) return;

    // For recurring events, extract the base ID and delete the base event
    const match = selectedEvent.id.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/);
    const baseId = match ? match[1] : selectedEvent.id;

    setEvents(events.filter((e) => e.id !== baseId));
    setSelectedEvent(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteThisOnly = () => {
    if (!selectedEvent) return;

    // Extract the base event ID and date from the instance ID
    // Instance IDs are formatted as: "base-id-YYYY-MM-DD"
    const match = selectedEvent.id.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/);
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
    setSelectedEvent(null);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setIsTransitioning(true);
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    setShowDeleteConfirm(false);
    setIsTransitioning(false);
  };

  if (!selectedEvent) return null;

  return (
    <Dialog.Root open={!!selectedEvent} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlayClass} />
        <Dialog.Content className={dialogContentClass}>
          <motion.div
            initial={false}
            animate={isTransitioning ? { height: bounds.height > 0 ? bounds.height : 'auto' } : {}}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            style={!isTransitioning ? { height: 'auto' } : undefined}
          >
            <div ref={ref}>
              <AnimatePresence mode="wait" initial={false}>
                {!showDeleteConfirm ? (
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
                    Edit Event
                    {selectedEvent.recurrence && (
                      <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium">
                        <LoopIcon className="h-3 w-3" />
                        Recurring
                      </span>
                    )}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="rounded-md p-1 hover:bg-zinc-100" aria-label="Close">
                      <Cross2Icon className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Team Standup"
              />
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium">
                Event Type *
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as EventType })
                }
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="company-event">Company Event</option>
                <option value="time-off">Time Off</option>
                <option value="birthday">Birthday</option>
                <option value="work-anniversary">Work Anniversary</option>
              </select>
            </div>

            {/* Person (for certain event types) */}
            {(formData.type === 'time-off' ||
              formData.type === 'birthday' ||
              formData.type === 'work-anniversary') && (
              <div>
                <label htmlFor="person" className="block text-sm font-medium">
                  Person
                </label>
                <Select.Root
                  value={formData.person}
                  onValueChange={(value) => setFormData({ ...formData, person: value })}
                >
                  <Select.Trigger
                    id="person"
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <Select.Value placeholder="Select person" />
                    <Select.Icon>
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-zinc-500">
                            Engineering
                          </Select.Label>
                          <Select.Item
                            value="Sarah Chen"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Sarah Chen</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Alex Kim"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Alex Kim</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Jordan Lee"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Jordan Lee</Select.ItemText>
                          </Select.Item>
                        </Select.Group>

                        <Select.Separator className="my-1 h-px bg-zinc-200" />

                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-zinc-500">
                            Operations
                          </Select.Label>
                          <Select.Item
                            value="Emma Wilson"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Emma Wilson</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Marcus Rodriguez"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Marcus Rodriguez</Select.ItemText>
                          </Select.Item>
                        </Select.Group>

                        <Select.Separator className="my-1 h-px bg-zinc-200" />

                        <Select.Group>
                          <Select.Label className="px-4 py-2 text-xs font-semibold text-zinc-500">
                            Design
                          </Select.Label>
                          <Select.Item
                            value="Riley Patel"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Riley Patel</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="Taylor Morgan"
                            className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm outline-none data-highlighted:bg-zinc-100 data-[state=checked]:bg-zinc-200"
                          >
                            <Select.ItemText>Taylor Morgan</Select.ItemText>
                          </Select.Item>
                        </Select.Group>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            )}

            {/* All Day Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.isAllDay}
                onChange={(e) => {
                  setIsTransitioning(true);
                  setFormData({ ...formData, isAllDay: e.target.checked });
                }}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allDay" className="text-sm font-medium">
                All day event
              </label>
            </div>

            {/* Date & Time Container */}
            <div className={formData.isAllDay ? "flex gap-3" : "space-y-4"}>
              {/* Start Date & Time */}
              <div className={formData.isAllDay ? "flex-1" : "grid grid-cols-2 gap-3"}>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {!formData.isAllDay && (
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* End Date & Time */}
              <div className={formData.isAllDay ? "flex-1" : "grid grid-cols-2 gap-3"}>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {!formData.isAllDay && (
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium">
                      End Time *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={handleDeleteClick}
                className={`flex items-center justify-center rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-all duration-300 ease-out overflow-hidden whitespace-nowrap ${deleteClickedOnce ? "w-48" : "w-20"}`}
              >
                {deleteClickedOnce ? "Click again to delete" : "Delete"}
              </button>
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  className="rounded-md bg-black/80 px-4 py-2 text-sm font-medium text-white hover:bg-black/70"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
              </motion.div>
            ) : (
              <motion.div
                key="delete-confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                className="space-y-4"
              >
                <Dialog.Title className="text-lg font-semibold">Delete recurring event?</Dialog.Title>
                <div className="space-y-2">
                  <button
                    onClick={handleDeleteThisOnly}
                    className="w-full rounded-md border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-100 text-left"
                  >
                    Delete this event only
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="w-full rounded-md border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-100 text-left"
                  >
                    Delete all of these events
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="w-full flex gap-2 items-center rounded-md border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-medium hover:bg-zinc-100 text-left"
                  >
                    <ArrowLeftIcon /> Go Back
                  </button>
                </div>
              </motion.div>
            )}
              </AnimatePresence>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
